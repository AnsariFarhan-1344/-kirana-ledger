import { Platform } from 'react-native';
import {
  SpeechAdapter,
  SpeechAdapterCallbacks,
  SpeechErrorType,
  SpeechLocale,
  SpeechState,
  DiagnosticsInfo,
} from './types';
import { WebSpeechAdapter } from './WebSpeechAdapter';
import { NativeSpeechAdapter } from './NativeSpeechAdapter';
import { UnsupportedAdapter } from './UnsupportedAdapter';

/**
 * Checks if the Web Speech Recognition API is available in the current environment.
 * This works in:
 *  - Desktop Chrome / Edge
 *  - Mobile Chrome on Android (when served over HTTP on LAN too!)
 *  - Mobile Safari (partial)
 *  - Expo Web
 * It does NOT work in:
 *  - Expo Go on Android (React Native, no window.SpeechRecognition)
 *  - Firefox (no webkitSpeechRecognition)
 */
function isWebSpeechAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

/**
 * Check if we have a real native ExpoSpeechRecognitionModule available
 * (only in standalone dev builds, not Expo Go).
 */
function isNativeSpeechAvailable(): boolean {
  if (Platform.OS === 'web') return false;
  try {
    const mod = (global as any).ExpoSpeechRecognitionModule;
    return !!mod;
  } catch {
    return false;
  }
}

/**
 * Pick the best available adapter at startup:
 * 1. If window.SpeechRecognition / webkitSpeechRecognition is accessible → WebSpeechAdapter
 *    (this covers Desktop Browser, Mobile Chrome via LAN URL, Expo Web)
 * 2. If native ExpoSpeechRecognitionModule is loaded → NativeSpeechAdapter
 *    (this covers standalone Android APK dev builds)
 * 3. Otherwise → UnsupportedAdapter (shows clear "type instead" message)
 */
function pickAdapter(): SpeechAdapter {
  if (isWebSpeechAvailable()) {
    console.log('[SpeechService] Using WebSpeechAdapter (browser SpeechRecognition API)');
    return new WebSpeechAdapter();
  }
  if (isNativeSpeechAvailable()) {
    console.log('[SpeechService] Using NativeSpeechAdapter (Expo native module)');
    return new NativeSpeechAdapter();
  }
  console.log('[SpeechService] Using UnsupportedAdapter - falling back to text input');
  return new UnsupportedAdapter();
}

class SpeechServiceManager {
  private adapter: SpeechAdapter;
  private currentLocale: SpeechLocale = 'hi-IN';
  private lastErrorCode: string | null = null;

  constructor() {
    this.adapter = pickAdapter();
  }

  /** Re-evaluate best adapter (useful if called after a permission grant) */
  public refreshAdapter() {
    this.adapter = pickAdapter();
  }

  public getLocale(): SpeechLocale {
    return this.currentLocale;
  }

  public setLocale(locale: SpeechLocale) {
    this.currentLocale = locale;
  }

  public async getDiagnostics(): Promise<DiagnosticsInfo> {
    const hasWebWindow = typeof window !== 'undefined';
    let isSecure = false;
    let isApi = false;
    let permState: 'granted' | 'prompt' | 'denied' | 'unsupported' = 'unsupported';
    let browserName = Platform.OS;

    if (hasWebWindow) {
      isSecure = !!(window as any).isSecureContext;
      isApi = isWebSpeechAvailable();
      browserName = typeof navigator !== 'undefined' ? navigator.userAgent : Platform.OS;

      if (navigator.permissions && navigator.permissions.query) {
        try {
          const res = await navigator.permissions.query({ name: 'microphone' as any });
          permState = res.state as any;
        } catch {
          permState = 'prompt';
        }
      } else {
        permState = 'prompt';
      }
    }

    // On native Android when no Web Speech available
    if (Platform.OS !== 'web' && !hasWebWindow) {
      isApi = isNativeSpeechAvailable();
      permState = isApi ? 'prompt' : 'unsupported';
    }

    return {
      isSecureContext: isSecure,
      isApiAvailable: isApi,
      permissionState: permState,
      chosenLocale: this.currentLocale,
      lastErrorCode: this.lastErrorCode,
      browserOrPlatform: browserName,
      adapterName: this.adapter.name,
    };
  }

  public async startListening(callbacks: SpeechAdapterCallbacks): Promise<void> {
    // Refresh adapter just in case environment changed (e.g. permission was granted)
    this.refreshAdapter();

    const wrappedCallbacks: SpeechAdapterCallbacks = {
      ...callbacks,
      onError: (type: SpeechErrorType, message: string, raw?: string) => {
        this.lastErrorCode = raw || type;
        callbacks.onError(type, message, raw);
      },
    };

    return this.adapter.start(this.currentLocale, wrappedCallbacks);
  }

  public async stopListening(): Promise<void> {
    return this.adapter.stop();
  }

  public async abortListening(): Promise<void> {
    return this.adapter.abort();
  }
}

export const speechService = new SpeechServiceManager();
