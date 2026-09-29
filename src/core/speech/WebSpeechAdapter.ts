import { SpeechAdapter, SpeechAdapterCallbacks, SpeechErrorType, SpeechLocale } from './types';

export class WebSpeechAdapter implements SpeechAdapter {
  public name = 'WebSpeechAdapter';
  private recognition: any = null;
  private audioContext: any = null;
  private analyser: any = null;
  private mediaStream: any = null;
  private animFrameId: any = null;
  private silenceTimer: any = null;
  private isRunning = false;

  public async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const hasApi = !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
    const isSecure = !!(window as any).isSecureContext;
    return hasApi && isSecure;
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop temporary stream immediately
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err: any) {
      console.warn('[WebSpeechAdapter] getUserMedia permission error:', err);
      return false;
    }
  }

  public async start(locale: SpeechLocale, callbacks: SpeechAdapterCallbacks): Promise<void> {
    if (typeof window === 'undefined') {
      callbacks.onError('unsupported', 'Web environment nahi mila.');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      callbacks.onError('unsupported', 'Aapke browser mein Web Speech API uplabdh nahi hai.');
      return;
    }

    // A3. Check isSecureContext
    if (window.isSecureContext === false) {
      callbacks.onError(
        'unsupported',
        'Microphone sirf HTTPS ya localhost par kaam karta hai (insecure context).'
      );
      return;
    }

    // Clean up previous runs
    await this.abort();

    callbacks.onStateChange('requestingPermission');

    // A3. Request mic via getUserMedia first so the permission dialog really appears
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: any) {
      const name = err.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        callbacks.onError(
          'not-allowed',
          'Mic permission nahi mili. Settings me mic allow karein.',
          err.message
        );
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        callbacks.onError(
          'audio-capture',
          'Mic nahi mila. Phone ya device ka mic check karein.',
          err.message
        );
      } else {
        callbacks.onError('not-allowed', 'Mic access nahi mil paya.', err.message);
      }
      callbacks.onStateChange('error');
      return;
    }

    // A4. Drive real waveform from WebAudio AnalyserNode
    this.setupAudioAnalysis(this.mediaStream, callbacks.onAudioLevel);

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
      this.recognition.lang = locale;

      this.resetSilenceTimer(callbacks);

      // A2. Truthful state machine: UI shows listening ONLY after recognizer start/audiostart
      this.recognition.onstart = () => {
        this.isRunning = true;
        callbacks.onStateChange('listening');
      };

      this.recognition.onaudiostart = () => {
        callbacks.onStateChange('listening');
      };

      this.recognition.onresult = (event: any) => {
        this.resetSilenceTimer(callbacks);
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interimText += transcript;
          }
        }

        const currentText = (finalText || interimText).trim();
        if (currentText) {
          callbacks.onInterimText(currentText);
        }

        if (finalText.trim()) {
          callbacks.onFinalText(finalText.trim());
        }
      };

      this.recognition.onerror = (event: any) => {
        const err = event.error;
        console.warn('[WebSpeechAdapter] error event:', err);

        if (err === 'not-allowed') {
          callbacks.onError(
            'not-allowed',
            'Mic permission nahi mili. Browser settings me mic allow karein.',
            err
          );
        } else if (err === 'service-not-allowed') {
          callbacks.onError(
            'service-not-allowed',
            'Mic service block hai. Browser settings me mic allow karein.',
            err
          );
        } else if (err === 'network') {
          callbacks.onError(
            'network',
            'Voice ke liye internet chahiye. Abhi type karein.',
            err
          );
        } else if (err === 'no-speech') {
          callbacks.onError(
            'no-speech',
            'Kuch sunai nahi diya. Phir se bolein.',
            err
          );
        } else if (err === 'audio-capture') {
          callbacks.onError(
            'audio-capture',
            'Mic nahi mila. Phone ka mic check karein.',
            err
          );
        } else if (err === 'language-not-supported') {
          callbacks.onError(
            'language-not-supported',
            'Ye bhasha is phone par nahi chalti.',
            err
          );
        } else {
          callbacks.onError('unsupported', `Voice error: ${err}`, err);
        }
        callbacks.onStateChange('error');
        this.cleanup();
      };

      this.recognition.onend = () => {
        this.isRunning = false;
        this.clearSilenceTimer();
      };

      this.recognition.start();
    } catch (err: any) {
      console.error('[WebSpeechAdapter] start failure:', err);
      callbacks.onError('unsupported', 'Mic shuru nahi ho paya.', err.message);
      callbacks.onStateChange('error');
      this.cleanup();
    }
  }

  private setupAudioAnalysis(stream: any, onAudioLevel?: (level: number) => void) {
    if (!onAudioLevel || typeof window === 'undefined') return;

    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      const sampleLevel = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);

        // Compute RMS level normalized between 0 and 1
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += (dataArray[i] / 255) ** 2;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const clamped = Math.min(1, Math.max(0, rms * 2.5)); // slight gain for voice

        onAudioLevel(clamped);
        this.animFrameId = requestAnimationFrame(sampleLevel);
      };

      sampleLevel();
    } catch (err) {
      console.warn('[WebSpeechAdapter] WebAudio setup error:', err);
    }
  }

  private resetSilenceTimer(callbacks: SpeechAdapterCallbacks) {
    this.clearSilenceTimer();
    // 8-second silence threshold
    this.silenceTimer = setTimeout(() => {
      if (this.isRunning) {
        callbacks.onError('no-speech', 'Kuch sunai nahi diya. Phir se bolein.');
        callbacks.onStateChange('error');
        this.stop();
      }
    }, 8000);
  }

  private clearSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  public async stop(): Promise<void> {
    this.clearSilenceTimer();
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.cleanup();
  }

  public async abort(): Promise<void> {
    this.clearSilenceTimer();
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {}
    }
    this.cleanup();
  }

  private cleanup() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach((track: any) => track.stop());
      } catch (e) {}
      this.mediaStream = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
    this.analyser = null;
  }
}
