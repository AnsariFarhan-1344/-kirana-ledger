import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';
import { speechService } from '../core/speech/SpeechService';
import { SpeechLocale, SpeechState, SpeechErrorType } from '../core/speech/types';
import {
  Mic,
  MicOff,
  X,
  Send,
  Volume2,
  AlertCircle,
  Globe,
  RotateCcw,
  Keyboard,
  Info,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface MicWaveformProps {
  visible: boolean;
  onClose: () => void;
  onSubmitText: (text: string) => void;
}

const DEMO_PHRASES = [
  'Ramesh ne 500 rupaye ka maal liya',
  'Amit ne 200 de diye',
  'Priya ne 2 kilo sugar liya 180 ki',
  'Amit kal dega',
  'Ramesh ka kitna baaki hai?',
  'Aaj kitna mila?',
  'रमेशने 500 रुपयांचा माल घेतला',
];

export const MicWaveform: React.FC<MicWaveformProps> = ({
  visible,
  onClose,
  onSubmitText,
}) => {
  const { speechLocale, setSpeechLocale } = useAppStore();

  const [speechState, setSpeechState] = useState<SpeechState>('idle');
  const [inputText, setInputText] = useState('');
  const [errorMessage, setErrorMessage] = useState<{
    type: SpeechErrorType;
    text: string;
    helpStep?: string;
  } | null>(null);

  // A4. Real Audio Level from AnalyserNode (0.0 to 1.0)
  const [audioLevel, setAudioLevel] = useState(0);
  const inputRef = useRef<TextInput>(null);

  // Detect if Web Speech API is available at all in this browser/environment
  const isBrowserSpeechSupported = typeof window !== 'undefined' &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  // Stop listening when unmounted or hidden
  useEffect(() => {
    if (visible) {
      setInputText('');
      setErrorMessage(null);
      setAudioLevel(0);
      setSpeechState('idle');
      // Only auto-start mic if the browser supports speech
      if (isBrowserSpeechSupported) {
        handleStartRecording();
      } else {
        // Focus text input so user can type immediately
        setTimeout(() => inputRef.current?.focus(), 300);
      }
    } else {
      speechService.stopListening();
      setSpeechState('idle');
    }

    return () => {
      speechService.stopListening();
    };
  }, [visible, speechLocale]);

  const handleStartRecording = async () => {
    if (!isBrowserSpeechSupported) {
      setErrorMessage({
        type: 'unsupported',
        text: 'Aapka browser mic ko support nahi karta.',
        helpStep: '📱 Google Chrome browser mein yeh URL kholein aur phir mic use karein.',
      });
      return;
    }

    setErrorMessage(null);
    setSpeechState('requestingPermission');
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    // Refresh adapter so permission grants mid-session are picked up
    speechService.refreshAdapter();
    speechService.setLocale(speechLocale);

    await speechService.startListening({
      onStateChange: (state) => {
        setSpeechState(state);
      },
      onInterimText: (text) => {
        setInputText(text);
      },
      onFinalText: (text) => {
        setInputText(text);
        setSpeechState('heard');
      },
      onError: (type, msg) => {
        setSpeechState('error');
        setAudioLevel(0);

        let helpStep: string | undefined;
        if (type === 'not-allowed' || type === 'service-not-allowed') {
          helpStep =
            'Browser me URL bar ke paas 🔒 icon dabayein aur Microphone allow karein.';
        }
        setErrorMessage({ type, text: msg, helpStep });
      },
      onAudioLevel: (level) => {
        setAudioLevel(level);
      },
    });
  };

  const handleStopRecording = async () => {
    await speechService.stopListening();
    setSpeechState('heard');
    setAudioLevel(0);
  };

  const handleToggle = () => {
    if (speechState === 'listening') {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const handleSubmit = (textToSubmit?: string) => {
    const text = textToSubmit || inputText;
    if (!text.trim()) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    speechService.stopListening();
    onSubmitText(text.trim());
    onClose();
  };

  const handleSelectLang = (locale: SpeechLocale) => {
    setSpeechLocale(locale);
    speechService.setLocale(locale);
  };

  // 5 Real Waveform Bars heights driven by real audio level
  const barHeights = [
    Math.max(8, Math.min(48, 12 + audioLevel * 45)),
    Math.max(12, Math.min(54, 18 + audioLevel * 55)),
    Math.max(16, Math.min(64, 24 + audioLevel * 75)),
    Math.max(12, Math.min(54, 18 + audioLevel * 55)),
    Math.max(8, Math.min(48, 12 + audioLevel * 45)),
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        speechService.stopListening();
        onClose();
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.micIconPill}>
                <Mic size={16} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Bolke Hisaab Likho</Text>
                <Text style={styles.headerSub}>Spoken Ledger Assistant</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                speechService.stopListening();
                onClose();
              }}
              style={styles.closeBtn}
            >
              <X size={18} color={lightColors.muted} />
            </TouchableOpacity>
          </View>

          {/* A6. Language Selector Chips (Remembered) */}
          <View style={styles.langRow}>
            <Globe size={13} color={lightColors.muted} />
            <Text style={styles.langLabel}>Bhasha:</Text>
            <TouchableOpacity
              style={[styles.langChip, speechLocale === 'hi-IN' && styles.langChipActive]}
              onPress={() => handleSelectLang('hi-IN')}
            >
              <Text
                style={[
                  styles.langChipText,
                  speechLocale === 'hi-IN' && styles.langChipTextActive,
                ]}
              >
                हिंदी / Hinglish
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.langChip, speechLocale === 'mr-IN' && styles.langChipActive]}
              onPress={() => handleSelectLang('mr-IN')}
            >
              <Text
                style={[
                  styles.langChipText,
                  speechLocale === 'mr-IN' && styles.langChipTextActive,
                ]}
              >
                मराठी
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.langChip, speechLocale === 'en-IN' && styles.langChipActive]}
              onPress={() => handleSelectLang('en-IN')}
            >
              <Text
                style={[
                  styles.langChipText,
                  speechLocale === 'en-IN' && styles.langChipTextActive,
                ]}
              >
                English
              </Text>
            </TouchableOpacity>
          </View>

          {/* A2 & A4. Real Waveform + Center Mic */}
          <View style={styles.micSection}>
            {speechState === 'listening' && (
              <View style={styles.waveformContainer}>
                {barHeights.map((h, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveformBar,
                      {
                        height: h,
                        backgroundColor:
                          audioLevel > 0.08 ? lightColors.primary : '#86EFAC',
                      },
                    ]}
                  />
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.micCircle,
                speechState === 'listening'
                  ? styles.micListening
                  : styles.micIdle,
              ]}
              onPress={handleToggle}
              activeOpacity={0.8}
            >
              {speechState === 'listening' ? (
                <Mic size={38} color="#FFFFFF" strokeWidth={2.5} />
              ) : (
                <MicOff size={36} color="#FFFFFF" strokeWidth={2.5} />
              )}
            </TouchableOpacity>

            {/* A2. Truthful Status Text */}
            <Text style={styles.stateStatusText}>
              {speechState === 'requestingPermission' && 'Mic permission mang rahe hain...'}
              {speechState === 'listening' && '🟢 Sun raha hoon... Bolte rahiye'}
              {speechState === 'processing' && '⏳ Samajh rahe hain...'}
              {speechState === 'heard' && '✓ Sun liya. Jaanch karein ya naye shabd bolein.'}
              {speechState === 'idle' && 'Mic dabayein bolna shuru karne ke liye'}
              {speechState === 'error' && '❌ Awaaz capture nahi ho payi'}
            </Text>
          </View>

          {/* Browser not supported banner */}
          {!isBrowserSpeechSupported && (
            <View style={styles.unsupportedBox}>
              <Text style={styles.unsupportedTitle}>🔇 Mic is haari browser mein kaam nahi karta</Text>
              <Text style={styles.unsupportedDesc}>
                Web Speech API sirf <Text style={{ fontWeight: 'bold', color: '#166534' }}>Google Chrome</Text> aur
                <Text style={{ fontWeight: 'bold', color: '#166534' }}> Edge</Text> browser mein kaam karta hai.
                {`\n\n`}Abhi niche text box mein likh sakte hain, ya:
              </Text>
              <Text style={styles.unsupportedStep}>
                📲 Chrome mein yeh URL kholein:
              </Text>
              <Text style={styles.unsupportedUrl}>http://192.168.137.187:8081</Text>
            </View>
          )}

          {/* A5. Error Banner with Hinglish Text and Action Buttons */}
          {errorMessage && (
            <View style={styles.errorBox}>
              <View style={styles.errorHeader}>
                <AlertCircle size={18} color="#DC2626" />
                <Text style={styles.errorTitle}>{errorMessage.text}</Text>
              </View>

              {errorMessage.helpStep && (
                <View style={styles.helpStepRow}>
                  <Info size={14} color="#991B1B" />
                  <Text style={styles.helpStepText}>{errorMessage.helpStep}</Text>
                </View>
              )}

              <View style={styles.errorActions}>
                {isBrowserSpeechSupported && (
                  <TouchableOpacity
                    style={styles.retryBtn}
                    onPress={handleStartRecording}
                  >
                    <RotateCcw size={14} color="#FFFFFF" />
                    <Text style={styles.retryBtnText}>Try Again</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.typeInsteadBtn, { flex: isBrowserSpeechSupported ? 1 : undefined, minWidth: 200 }]}
                  onPress={() => {
                    setErrorMessage(null);
                    inputRef.current?.focus();
                  }}
                >
                  <Keyboard size={14} color={lightColors.text} />
                  <Text style={styles.typeInsteadText}>⌨ Type Instead (Likhkar Bhejein)</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Editable Live Heard / Typed Text Area */}
          <View style={styles.inputCard}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Jaise: 'Ramesh ne 500 ka maal liya'..."
              placeholderTextColor={lightColors.muted}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                !inputText.trim() && styles.sendBtnDisabled,
              ]}
              onPress={() => handleSubmit()}
              disabled={!inputText.trim()}
            >
              <Send size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Tip */}
          <Text style={styles.hintTip}>
            {isBrowserSpeechSupported
              ? '💡 Tip: Phone keyboard ke mic 🎙 button se bhi likh sakte hain.'
              : '💡 Google Chrome browser mein URL kholein to mic kaam karega.'}
          </Text>

          {/* A9. Demo Phrase Chips */}
          <Text style={styles.demoLabel}>Demo Phrases (Tap to try):</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.demoChipsScroll}
          >
            {DEMO_PHRASES.map((phrase, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.demoChip}
                onPress={() => {
                  setInputText(phrase);
                  handleSubmit(phrase);
                }}
              >
                <Volume2 size={13} color={lightColors.primary} />
                <Text style={styles.demoChipText}>"{phrase}"</Text>
                <View style={styles.demoTag}>
                  <Text style={styles.demoTagText}>Demo</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 18, 32, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: lightColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  micIconPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: lightColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  headerSub: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: lightColors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  langLabel: {
    fontSize: 11,
    color: lightColors.muted,
    fontWeight: typography.weights.medium,
  },
  langChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: layout.pillRadius,
    backgroundColor: lightColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  langChipActive: {
    backgroundColor: lightColors.primarySoft,
    borderColor: lightColors.primary,
  },
  langChipText: {
    fontSize: 11,
    color: lightColors.muted,
    fontWeight: typography.weights.medium,
  },
  langChipTextActive: {
    color: lightColors.primary,
    fontWeight: typography.weights.bold,
  },
  micSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    marginBottom: 8,
  },
  waveformBar: {
    width: 6,
    borderRadius: 3,
  },
  micCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  micListening: {
    backgroundColor: lightColors.primary,
    shadowColor: lightColors.primary,
  },
  micIdle: {
    backgroundColor: lightColors.muted,
    shadowColor: '#000',
  },
  stateStatusText: {
    marginTop: 10,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: lightColors.text,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: layout.cardRadius,
    padding: 12,
    marginVertical: 10,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  errorTitle: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: '#991B1B',
    fontWeight: typography.weights.bold,
  },
  helpStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 8,
  },
  helpStepText: {
    flex: 1,
    fontSize: 11,
    color: '#B91C1C',
  },
  errorActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: lightColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: layout.buttonRadius,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  typeInsteadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: lightColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: lightColors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: layout.buttonRadius,
  },
  typeInsteadText: {
    fontSize: 12,
    color: lightColors.text,
    fontWeight: typography.weights.medium,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.background,
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: layout.inputRadius,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: typography.sizes.body,
    color: lightColors.text,
    minHeight: 44,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: lightColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: lightColors.muted,
    opacity: 0.4,
  },
  hintTip: {
    fontSize: 11,
    color: lightColors.muted,
    marginBottom: 10,
  },
  demoLabel: {
    fontSize: 11,
    fontWeight: typography.weights.semibold,
    color: lightColors.muted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demoChipsScroll: {
    gap: 8,
    paddingBottom: 4,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: lightColors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: layout.pillRadius,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  demoChipText: {
    fontSize: 12,
    color: lightColors.text,
    fontWeight: typography.weights.medium,
  },
  demoTag: {
    backgroundColor: lightColors.primarySoft,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  demoTagText: {
    fontSize: 9,
    color: lightColors.primary,
    fontWeight: typography.weights.bold,
  },
  unsupportedBox: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#F97316',
    borderRadius: layout.cardRadius,
    padding: 14,
    marginVertical: 10,
  },
  unsupportedTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#7C2D12',
    marginBottom: 6,
  },
  unsupportedDesc: {
    fontSize: typography.sizes.xs,
    color: '#92400E',
    lineHeight: 18,
    marginBottom: 8,
  },
  unsupportedStep: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#7C2D12',
    marginBottom: 4,
  },
  unsupportedUrl: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.black,
    color: '#166534',
    backgroundColor: '#DCFCE7',
    padding: 8,
    borderRadius: 6,
    fontFamily: 'monospace',
  },
});
