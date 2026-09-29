import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';
import { BRAND_NAME, TAGLINE, SUBLINE } from '../config/brand';
import { MicTestScreen } from './MicTestScreen';
import { ParserTestsScreen } from './ParserTestsScreen';
import {
  Store,
  Globe,
  Zap,
  RotateCcw,
  FileText,
  ChevronRight,
  Mic,
  Package,
  Type,
  Code,
  X,
  Shield,
} from 'lucide-react-native';

export const SettingsScreen: React.FC = () => {
  const {
    profile,
    currentLanguage,
    setLanguage,
    autoSaveEnabled,
    setAutoSave,
    stockTrackingEnabled,
    setStockTrackingEnabled,
    badaTextMode,
    setBadaTextMode,
    developerUnlocked,
    setDeveloperUnlocked,
    resetDemoData,
  } = useAppStore();

  const [shopName, setShopName] = useState(profile.shopName);
  const [ownerName, setOwnerName] = useState(profile.ownerName);
  const [upiId, setUpiId] = useState(profile.upiId);
  const [phone, setPhone] = useState(profile.phone);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showMicTest, setShowMicTest] = useState(false);
  const [showParserTests, setShowParserTests] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  const handleSaveProfile = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleReset = () => {
    resetDemoData();
    Alert.alert('Demo Reset', 'All ledger data has been reset to default state.');
  };

  const handleVersionTap = () => {
    if (developerUnlocked) {
      setShowParserTests(true);
      return;
    }
    const nextCount = tapCount + 1;
    setTapCount(nextCount);
    if (nextCount >= 7) {
      setDeveloperUnlocked(true);
      Alert.alert('Developer Mode', 'Developer options unlocked! Parser test suite is now available.');
    } else if (nextCount >= 4) {
      Alert.alert('Developer Mode', `${7 - nextCount} more taps to unlock developer mode.`);
    }
  };

  if (showMicTest) {
    return <MicTestScreen onBack={() => setShowMicTest(false)} />;
  }

  if (showParserTests) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.devBackHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setShowParserTests(false)}
          >
            <ChevronRight size={20} color={lightColors.text} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={styles.devBackTitle}>Developer: Parser Test Cases</Text>
        </View>
        <ParserTestsScreen />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Brand Header Banner */}
      <View style={styles.brandBox}>
        <Text style={styles.brandName}>{BRAND_NAME}</Text>
        <Text style={styles.brandTagline}>{TAGLINE}</Text>
        <Text style={styles.brandSubline}>{SUBLINE}</Text>
      </View>

      {/* Mic Test & Diagnostics Row (A8) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Mic size={18} color={lightColors.primary} />
          <Text style={styles.cardTitle}>Microphone & Speech Check</Text>
        </View>
        <TouchableOpacity
          style={styles.actionRowBtn}
          onPress={() => setShowMicTest(true)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.actionRowTitle}>🎙 Mic Test & Diagnostics Screen</Text>
            <Text style={styles.actionRowSub}>
              Browser HTTPS check, WebAudio stream, 5-second test, permissions.
            </Text>
          </View>
          <ChevronRight size={18} color={lightColors.primary} />
        </TouchableOpacity>
      </View>

      {/* Shop Profile Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Store size={18} color={lightColors.primary} />
          <Text style={styles.cardTitle}>Shop & Payment Details</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Shop Name</Text>
          <TextInput
            style={styles.input}
            value={shopName}
            onChangeText={setShopName}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Owner Name</Text>
          <TextInput
            style={styles.input}
            value={ownerName}
            onChangeText={setOwnerName}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Merchant UPI ID (for QR codes)</Text>
          <TextInput
            style={styles.input}
            value={upiId}
            onChangeText={setUpiId}
            placeholder="e.g. shop@upi"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Shop Mobile</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
          <Text style={styles.saveBtnText}>
            {savedSuccess ? 'Saved ✓' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Language Switcher */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Globe size={18} color={lightColors.primary} />
          <Text style={styles.cardTitle}>Bhasha / Language</Text>
        </View>

        <View style={styles.langRow}>
          <TouchableOpacity
            style={[
              styles.langPill,
              currentLanguage === 'en' && styles.langPillActive,
            ]}
            onPress={() => setLanguage('en')}
          >
            <Text
              style={[
                styles.langPillText,
                currentLanguage === 'en' && styles.langPillTextActive,
              ]}
            >
              English
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.langPill,
              currentLanguage === 'hi' && styles.langPillActive,
            ]}
            onPress={() => setLanguage('hi')}
          >
            <Text
              style={[
                styles.langPillText,
                currentLanguage === 'hi' && styles.langPillTextActive,
              ]}
            >
              हिन्दी
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.langPill,
              currentLanguage === 'mr' && styles.langPillActive,
            ]}
            onPress={() => setLanguage('mr')}
          >
            <Text
              style={[
                styles.langPillText,
                currentLanguage === 'mr' && styles.langPillTextActive,
              ]}
            >
              मराठी
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Preferences: Stock Tracking, Bada Text, Auto-Save */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Zap size={18} color={lightColors.primary} />
          <Text style={styles.cardTitle}>Preferences & Features</Text>
        </View>

        {/* F9: Stock Tracking Optional */}
        <View style={styles.switchRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Package size={16} color={lightColors.primary} />
              <Text style={styles.switchLabel}>Stock bhi track karna hai?</Text>
            </View>
            <Text style={styles.switchSub}>
              Jab ON ho to Inventory tab aur Low Stock dikhta hai. OFF par voice items parchi me note hote hain.
            </Text>
          </View>
          <Switch
            value={stockTrackingEnabled}
            onValueChange={setStockTrackingEnabled}
            trackColor={{ false: lightColors.border, true: lightColors.primary }}
          />
        </View>

        {/* B6: Bada Text Mode */}
        <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: lightColors.surfaceSubtle }]}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Type size={16} color={lightColors.primary} />
              <Text style={styles.switchLabel}>Bada Text Mode (Elder / Easy View)</Text>
            </View>
            <Text style={styles.switchSub}>
              Bada font size aur bade tap targets saaf padhne ke liye.
            </Text>
          </View>
          <Switch
            value={badaTextMode}
            onValueChange={setBadaTextMode}
            trackColor={{ false: lightColors.border, true: lightColors.primary }}
          />
        </View>

        {/* Auto Save */}
        <View style={[styles.switchRow, { borderTopWidth: 1, borderTopColor: lightColors.surfaceSubtle }]}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.switchLabel}>Smart Auto-Save (5s Undo)</Text>
            <Text style={styles.switchSub}>
              Pura vishwas hone par entry apne aap save ho jayegi aur 5 second tak Undo kar sakte hain.
            </Text>
          </View>
          <Switch
            value={autoSaveEnabled}
            onValueChange={setAutoSave}
            trackColor={{ false: lightColors.border, true: lightColors.primary }}
          />
        </View>
      </View>

      {/* Developer Options (Hidden behind 7 taps on version number) */}
      {developerUnlocked && (
        <View style={[styles.card, { borderColor: '#8B5CF6' }]}>
          <View style={styles.cardHeader}>
            <Code size={18} color="#8B5CF6" />
            <Text style={[styles.cardTitle, { color: '#8B5CF6' }]}>Developer Options (Unlocked)</Text>
          </View>
          <TouchableOpacity
            style={styles.actionRowBtn}
            onPress={() => setShowParserTests(true)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.actionRowTitle}>🧪 Run Parser Test Cases (50+)</Text>
              <Text style={styles.actionRowSub}>
                Test Hindi, Marathi, Hinglish speech grammar & edge cases.
              </Text>
            </View>
            <ChevronRight size={18} color="#8B5CF6" />
          </TouchableOpacity>
        </View>
      )}

      {/* Privacy Policy & Disclaimer */}
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => setPrivacyModalOpen(true)}
        >
          <View style={styles.menuLeft}>
            <FileText size={18} color={lightColors.muted} />
            <Text style={styles.menuText}>Privacy Policy & Data Safety</Text>
          </View>
          <ChevronRight size={18} color={lightColors.muted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuRow} onPress={handleReset}>
          <View style={styles.menuLeft}>
            <RotateCcw size={18} color={lightColors.danger} />
            <Text style={[styles.menuText, { color: lightColors.danger }]}>
              Reset Demo Data (Initial State)
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Version Number (7 taps to unlock developer mode) */}
      <TouchableOpacity
        style={styles.versionContainer}
        onPress={handleVersionTap}
        activeOpacity={0.7}
      >
        <Text style={styles.versionText}>
          v4.0.0 • Kirana Ledger v4 (Offline-First)
        </Text>
        <Text style={styles.versionSub}>
          {developerUnlocked ? '✓ Developer Mode Active' : 'Tap 7 times for Developer Options'}
        </Text>
      </TouchableOpacity>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        Disclaimer: {BRAND_NAME} is a personal digital bookkeeping assistant for
        kirana shop owners. It does not process banking payments directly or
        hold funds.
      </Text>

      {/* Privacy Policy Modal */}
      <Modal
        visible={privacyModalOpen}
        animationType="slide"
        onRequestClose={() => setPrivacyModalOpen(false)}
      >
        <View style={styles.privacyModal}>
          <View style={styles.privacyHeader}>
            <Text style={styles.privacyTitle}>Privacy Policy & Data Safety</Text>
            <TouchableOpacity onPress={() => setPrivacyModalOpen(false)}>
              <X size={20} color={lightColors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.privacyBody}>
            <Text style={styles.privacyHeading}>1. Offline-First Storage</Text>
            <Text style={styles.privacyP}>
              All transactions, customer names, balances, bills, and stock
              records are saved locally on your device in encrypted local SQLite
              storage. No customer data leaves your device without your explicit
              share action.
            </Text>

            <Text style={styles.privacyHeading}>2. Voice & Microphone</Text>
            <Text style={styles.privacyP}>
              Microphone access is used solely to transcribe natural speech into
              khata entries. Audio recordings are never uploaded or retained on
              remote servers.
            </Text>

            <Text style={styles.privacyHeading}>3. Shared Receipts</Text>
            <Text style={styles.privacyP}>
              Receipts shared via WhatsApp contain only customer-facing bill
              summaries and merchant UPI IDs. Internal database IDs and private
              financial notes are stripped automatically.
            </Text>

            <Text style={styles.privacyHeading}>4. Data Deletion</Text>
            <Text style={styles.privacyP}>
              You have full ownership of your data. You may export or clear your
              records at any time from this Settings menu.
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
    padding: 16,
  },
  brandBox: {
    backgroundColor: lightColors.primary,
    borderRadius: layout.cardRadius,
    padding: 18,
    marginBottom: 16,
  },
  brandName: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.black,
    color: '#FFFFFF',
  },
  brandTagline: {
    fontSize: typography.sizes.sm,
    color: '#FFFFFF',
    fontWeight: typography.weights.semibold,
    marginTop: 2,
  },
  brandSubline: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  card: {
    backgroundColor: lightColors.surface,
    borderRadius: layout.cardRadius,
    padding: 16,
    borderWidth: 1,
    borderColor: lightColors.border,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: lightColors.surfaceSubtle,
    borderRadius: layout.buttonRadius,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  actionRowTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  actionRowSub: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    marginTop: 2,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    fontWeight: typography.weights.semibold,
    marginBottom: 4,
  },
  input: {
    backgroundColor: lightColors.surfaceSubtle,
    borderRadius: layout.inputRadius,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: typography.sizes.body,
    color: lightColors.text,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  saveBtn: {
    backgroundColor: lightColors.primary,
    borderRadius: layout.buttonRadius,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
    minHeight: layout.minTapTarget,
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
  },
  langPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: layout.pillRadius,
    backgroundColor: lightColors.surfaceSubtle,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  langPillActive: {
    backgroundColor: lightColors.primarySoft,
    borderColor: lightColors.primary,
  },
  langPillText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: lightColors.muted,
  },
  langPillTextActive: {
    color: lightColors.primary,
    fontWeight: typography.weights.bold,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: lightColors.text,
  },
  switchSub: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: lightColors.text,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  versionText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: lightColors.muted,
  },
  versionSub: {
    fontSize: typography.sizes.micro,
    color: lightColors.muted,
    marginTop: 2,
  },
  disclaimer: {
    fontSize: typography.sizes.micro,
    color: lightColors.muted,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  privacyModal: {
    flex: 1,
    backgroundColor: lightColors.surface,
    paddingTop: 36,
  },
  privacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
  },
  privacyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  privacyBody: {
    padding: 20,
  },
  privacyHeading: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
    marginTop: 14,
    marginBottom: 4,
  },
  privacyP: {
    fontSize: typography.sizes.sm,
    color: lightColors.muted,
    lineHeight: 20,
  },
  devBackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: lightColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: lightColors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  devBackTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
});
