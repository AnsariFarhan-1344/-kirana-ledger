import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';
import {
  Mic,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  FileSpreadsheet,
  Store,
} from 'lucide-react-native';

const SLIDES = [
  {
    step: 1,
    title: '1. Bolke hisaab rakho',
    sub: 'Speak instead of typing long forms',
    desc: 'Dukaan par jab grahak ki bheed ho, bas mic dabakar boliye — koi bada form bharne ki zaroorat nahi.',
    icon: Mic,
    iconColor: '#16A34A',
    iconBg: '#DCFCE7',
    badge: 'Fast & Natural',
  },
  {
    step: 2,
    title: '2. HISABAI khud samjhega',
    sub: 'Smart Bahi-Khata Understanding',
    exampleSpeech: '"Ramesh ne 500 ka maal liya"',
    exampleParsed: [
      { k: 'Customer', v: 'Ramesh' },
      { k: 'Type', v: 'Credit (Udhaar)' },
      { k: 'Amount', v: '₹500' },
    ],
    desc: 'Hinglish, Hindi ya Marathi me bolega — app apne aap customer, type aur rupaye pehchan legi.',
    icon: Sparkles,
    iconColor: '#F59E0B',
    iconBg: '#FEF3C7',
    badge: 'AI Understood',
  },
  {
    step: 3,
    title: '3. Hisaab ka proof rakho',
    sub: 'Provable records & WhatsApp receipts',
    desc: 'Digital parchi, WhatsApp reminder aur customer acknowledgement se hisaab me koi jhagda nahi.',
    icon: ShieldCheck,
    iconColor: '#2563EB',
    iconBg: '#DBEAFE',
    badge: 'Hara Bharosa',
  },
];

export const OnboardingModal: React.FC = () => {
  const { isOnboardingDone, setIsOnboardingDone, resetDemoData } = useAppStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedMode, setSelectedMode] = useState<'DEMO' | 'EMPTY'>('DEMO');

  if (isOnboardingDone) return null;

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleStartShop = () => {
    if (selectedMode === 'EMPTY') {
      // Clear all demo data for empty shop
      resetDemoData();
    }
    setIsOnboardingDone(true);
  };

  const slide = SLIDES[currentSlide];
  const IconComp = slide.icon;
  const isLastSlide = currentSlide === SLIDES.length - 1;

  return (
    <Modal visible={!isOnboardingDone} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top Skip button */}
          <View style={styles.topRow}>
            <View style={styles.indicatorRow}>
              {SLIDES.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    currentSlide === idx && styles.dotActive,
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity onPress={() => setIsOnboardingDone(true)}>
              <Text style={styles.skipText}>Skip karein</Text>
            </TouchableOpacity>
          </View>

          {/* Slide Content */}
          <View style={styles.slideBody}>
            <View style={[styles.iconCircle, { backgroundColor: slide.iconBg }]}>
              <IconComp size={36} color={slide.iconColor} />
            </View>

            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideSub}>{slide.sub}</Text>
            <Text style={styles.slideDesc}>{slide.desc}</Text>

            {/* Slide 2 Parser Example Box */}
            {slide.exampleSpeech && (
              <View style={styles.exampleBox}>
                <Text style={styles.exampleSpeechLabel}>Aapne bola:</Text>
                <Text style={styles.exampleSpeechText}>{slide.exampleSpeech}</Text>
                <View style={styles.parsedDivider} />
                <View style={styles.parsedGrid}>
                  {slide.exampleParsed?.map((item, i) => (
                    <View key={i} style={styles.parsedChip}>
                      <Text style={styles.parsedKey}>{item.k}</Text>
                      <Text style={styles.parsedVal}>{item.v}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Slide 3 Mode Selection: Demo or Empty Shop */}
            {isLastSlide && (
              <View style={styles.modeSelectBox}>
                <Text style={styles.modePrompt}>Aap kaise shuru karna chahenge?</Text>
                <View style={styles.modeOptionRow}>
                  <TouchableOpacity
                    style={[
                      styles.modeOption,
                      selectedMode === 'DEMO' && styles.modeOptionActive,
                    ]}
                    onPress={() => setSelectedMode('DEMO')}
                  >
                    <FileSpreadsheet
                      size={18}
                      color={selectedMode === 'DEMO' ? lightColors.primary : lightColors.muted}
                    />
                    <Text
                      style={[
                        styles.modeOptionTitle,
                        selectedMode === 'DEMO' && styles.modeOptionTitleActive,
                      ]}
                    >
                      Demo data ke saath
                    </Text>
                    <Text style={styles.modeOptionSub}>Test customers & sample entries</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modeOption,
                      selectedMode === 'EMPTY' && styles.modeOptionActive,
                    ]}
                    onPress={() => setSelectedMode('EMPTY')}
                  >
                    <Store
                      size={18}
                      color={selectedMode === 'EMPTY' ? lightColors.primary : lightColors.muted}
                    />
                    <Text
                      style={[
                        styles.modeOptionTitle,
                        selectedMode === 'EMPTY' && styles.modeOptionTitleActive,
                      ]}
                    >
                      Khali naya khata
                    </Text>
                    <Text style={styles.modeOptionSub}>Fresh shop, 0 balance</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.footer}>
            {!isLastSlide ? (
              <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                <Text style={styles.nextBtnText}>Aage Badhein</Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.startBtn} onPress={handleStartShop}>
                <CheckCircle size={20} color="#FFFFFF" />
                <Text style={styles.startBtnText}>Start My Shop 🚀</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: lightColors.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: lightColors.border,
  },
  dotActive: {
    backgroundColor: lightColors.primary,
    width: 32,
  },
  skipText: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    fontWeight: typography.weights.semibold,
  },
  slideBody: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  slideTitle: {
    fontSize: 20,
    fontWeight: typography.weights.black,
    color: lightColors.text,
    textAlign: 'center',
  },
  slideSub: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: lightColors.primary,
    marginTop: 2,
    marginBottom: 8,
  },
  slideDesc: {
    fontSize: typography.sizes.sm,
    color: lightColors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  exampleBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: lightColors.border,
    padding: 14,
    width: '100%',
    marginVertical: 8,
  },
  exampleSpeechLabel: {
    fontSize: typography.sizes.micro,
    color: lightColors.muted,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  exampleSpeechText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
    marginTop: 2,
    fontStyle: 'italic',
  },
  parsedDivider: {
    height: 1,
    backgroundColor: lightColors.border,
    marginVertical: 10,
  },
  parsedGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  parsedChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: lightColors.border,
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  parsedKey: {
    fontSize: typography.sizes.micro,
    color: lightColors.muted,
  },
  parsedVal: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: lightColors.primary,
    marginTop: 2,
  },
  modeSelectBox: {
    width: '100%',
    marginTop: 4,
    marginBottom: 10,
  },
  modePrompt: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modeOptionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeOption: {
    flex: 1,
    padding: 10,
    borderRadius: layout.buttonRadius,
    backgroundColor: lightColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: lightColors.border,
    alignItems: 'center',
  },
  modeOptionActive: {
    backgroundColor: lightColors.primarySoft,
    borderColor: lightColors.primary,
  },
  modeOptionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
    marginTop: 4,
    textAlign: 'center',
  },
  modeOptionTitleActive: {
    color: lightColors.primary,
  },
  modeOptionSub: {
    fontSize: typography.sizes.micro,
    color: lightColors.muted,
    textAlign: 'center',
    marginTop: 2,
  },
  footer: {
    marginTop: 18,
    width: '100%',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: lightColors.primary,
    borderRadius: layout.buttonRadius,
    paddingVertical: 14,
    minHeight: layout.minTapTarget,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: lightColors.primary,
    borderRadius: layout.buttonRadius,
    paddingVertical: 14,
    minHeight: layout.minTapTarget,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
  },
});
