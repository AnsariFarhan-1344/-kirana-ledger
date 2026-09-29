export type SpeechState =
  | 'idle'
  | 'requestingPermission'
  | 'listening'
  | 'processing'
  | 'heard'
  | 'error';

export type SpeechErrorType =
  | 'not-allowed'
  | 'service-not-allowed'
  | 'network'
  | 'no-speech'
  | 'audio-capture'
  | 'language-not-supported'
  | 'unsupported';

export type SpeechLocale = 'hi-IN' | 'mr-IN' | 'en-IN';

export interface SpeechAdapterCallbacks {
  onStateChange: (state: SpeechState) => void;
  onInterimText: (text: string) => void;
  onFinalText: (text: string) => void;
  onError: (type: SpeechErrorType, message: string, raw?: string) => void;
  onAudioLevel?: (level: number) => void; // 0.0 to 1.0 real RMS level
}

export interface SpeechAdapter {
  name: string;
  isAvailable(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
  start(locale: SpeechLocale, callbacks: SpeechAdapterCallbacks): Promise<void>;
  stop(): Promise<void>;
  abort(): Promise<void>;
}

export interface DiagnosticsInfo {
  isSecureContext: boolean;
  isApiAvailable: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unsupported';
  chosenLocale: SpeechLocale;
  lastErrorCode: string | null;
  browserOrPlatform: string;
  adapterName: string;
}
