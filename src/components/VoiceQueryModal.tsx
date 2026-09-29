import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';
import { formatINR } from '../core/ledger/ledgerMath';
import { HelpCircle, Volume2, X, Check, ShieldCheck } from 'lucide-react-native';
import * as Speech from 'expo-speech';

export const VoiceQueryModal: React.FC = () => {
  const { voiceQueryAnswer, setVoiceQueryAnswer, speechLocale } = useAppStore();

  if (!voiceQueryAnswer) return null;

  // Speak aloud automatically when opened
  useEffect(() => {
    if (voiceQueryAnswer?.spokenText) {
      speakText(voiceQueryAnswer.spokenText);
    }
  }, [voiceQueryAnswer]);

  const speakText = (text: string) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = speechLocale || 'hi-IN';
        window.speechSynthesis.speak(utterance);
      } else {
        Speech.stop();
        Speech.speak(text, {
          language: speechLocale || 'hi-IN',
        });
      }
    } catch (e) {
      console.warn('TTS playback error:', e);
    }
  };

  const handleClose = () => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      } else {
        Speech.stop();
      }
    } catch {}
    setVoiceQueryAnswer(null);
  };

  return (
    <Modal
      visible={!!voiceQueryAnswer}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <X size={18} color={lightColors.muted} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.iconCircle}>
              <HelpCircle size={22} color={lightColors.primary} />
            </View>
            <View>
              <Text style={styles.headerTitle}>{voiceQueryAnswer.title}</Text>
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>{voiceQueryAnswer.badge || 'Puchho Jawaab'}</Text>
              </View>
            </View>
          </View>

          {/* Answer text */}
          <View style={styles.answerBox}>
            <Text style={styles.answerText}>{voiceQueryAnswer.answerText}</Text>
          </View>

          {/* Read aloud button */}
          <TouchableOpacity
            style={styles.speakBtn}
            onPress={() => speakText(voiceQueryAnswer.spokenText)}
          >
            <Volume2 size={16} color={lightColors.primary} />
            <Text style={styles.speakBtnText}>Bolkar Dobara Sunein</Text>
          </TouchableOpacity>

          {/* Safety note: Questions never modify ledger */}
          <View style={styles.safetyNote}>
            <ShieldCheck size={14} color={lightColors.primary} />
            <Text style={styles.safetyText}>
              Yeh sirf jankari hai • Khate me kuch bhi change nahi hua
            </Text>
          </View>

          {/* Action button */}
          <TouchableOpacity style={styles.okBtn} onPress={handleClose}>
            <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.okBtnText}>Theek Hai</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 18, 32, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: lightColors.surface,
    borderRadius: layout.cardRadius,
    padding: 20,
    position: 'relative',
    elevation: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: lightColors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: lightColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  badgePill: {
    backgroundColor: lightColors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: layout.pillRadius,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  badgeText: {
    fontSize: 10,
    color: lightColors.primary,
    fontWeight: typography.weights.bold,
  },
  answerBox: {
    backgroundColor: lightColors.background,
    borderRadius: layout.inputRadius,
    padding: 14,
    borderWidth: 1,
    borderColor: lightColors.border,
    marginBottom: 12,
  },
  answerText: {
    fontSize: typography.sizes.body,
    color: lightColors.text,
    lineHeight: 24,
    fontWeight: typography.weights.medium,
  },
  speakBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: layout.buttonRadius,
    backgroundColor: lightColors.surfaceSubtle,
    marginBottom: 12,
  },
  speakBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: lightColors.primary,
  },
  safetyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  safetyText: {
    fontSize: 11,
    color: lightColors.muted,
  },
  okBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: lightColors.primary,
    paddingVertical: 12,
    borderRadius: layout.buttonRadius,
    minHeight: layout.minTapTarget,
  },
  okBtnText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
  },
});
