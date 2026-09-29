/**
 * Audio Service for Kirana Ledger
 * Provides Web Speech Recognition, Web Audio sound effects, and simulation fallback.
 */

class AudioService {
  constructor() {
    this.recognition = null;
    this.isSupported = false;
    this.audioCtx = null;
    this.initSpeech();
  }

  initSpeech() {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = "hi-IN"; // Default to Hindi/Indian Hinglish
        this.isSupported = true;
      }
    }
  }

  getAudioContext() {
    if (typeof window !== "undefined") {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      }
      if (this.audioCtx && this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
    }
    return this.audioCtx;
  }

  // Plays a traditional shop counter bell chime (satisfying cash register ding)
  playSuccessChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Note 1: High crisp ding (880 Hz - A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.15);

      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Note 2: Harmonious register chime (1320 Hz - E6)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1320, now + 0.08);

      gain2.gain.setValueAtTime(0.25, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.7);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Soft mic toggle click sound
  playMicClick() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // ignore audio context errors
    }
  }

  // Start real browser speech recognition
  startListening({ onInterim, onFinal, onError, onEnd }) {
    if (!this.isSupported || !this.recognition) {
      if (onError) onError("SPEECH_NOT_SUPPORTED");
      return;
    }

    this.playMicClick();

    this.recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim && onInterim) onInterim(interim);
      if (final && onFinal) onFinal(final);
    };

    this.recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Recognition already started or error:", e);
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
  }
}

export const audioService = new AudioService();
