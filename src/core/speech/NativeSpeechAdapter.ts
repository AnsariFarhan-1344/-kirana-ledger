import { Platform } from 'react-native';
import { SpeechAdapter, SpeechAdapterCallbacks, SpeechLocale } from './types';

export class NativeSpeechAdapter implements SpeechAdapter {
  public name = 'NativeSpeechAdapter';

  public async isAvailable(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    // For standalone custom dev build / production APK with native speech recognition module
    try {
      const ExpoSpeechRecognition = (global as any).ExpoSpeechRecognitionModule || null;
      return !!ExpoSpeechRecognition;
    } catch {
      return false;
    }
  }

  public async requestPermission(): Promise<boolean> {
    return false;
  }

  public async start(locale: SpeechLocale, callbacks: SpeechAdapterCallbacks): Promise<void> {
    callbacks.onError(
      'unsupported',
      'Native speech requires an Android standalone dev build (not Expo Go). Kripya niche likhkar hisaab jodein.'
    );
    callbacks.onStateChange('error');
  }

  public async stop(): Promise<void> {}
  public async abort(): Promise<void> {}
}
