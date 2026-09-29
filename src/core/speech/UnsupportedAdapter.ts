import { SpeechAdapter, SpeechAdapterCallbacks, SpeechLocale } from './types';

export class UnsupportedAdapter implements SpeechAdapter {
  public name = 'UnsupportedAdapter';

  public async isAvailable(): Promise<boolean> {
    return false;
  }

  public async requestPermission(): Promise<boolean> {
    return false;
  }

  public async start(locale: SpeechLocale, callbacks: SpeechAdapterCallbacks): Promise<void> {
    callbacks.onError(
      'unsupported',
      'Voice input is unavailable on this device. Kripya niche likhkar hisaab jodein.'
    );
    callbacks.onStateChange('error');
  }

  public async stop(): Promise<void> {}
  public async abort(): Promise<void> {}
}
