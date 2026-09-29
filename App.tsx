import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  BackHandler,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import './src/i18n';
import { lightColors } from './src/theme/colors';
import { typography, layout } from './src/theme/typography';
import { useAppStore } from './src/store/useAppStore';
import { parseSentenceToEntry } from './src/core/parser/ParserService';
import { formatINR } from './src/core/ledger/ledgerMath';

// Components
import { Header } from './src/components/Header';
import { BottomNav } from './src/components/BottomNav';
import { MicWaveform } from './src/components/MicWaveform';
import { SafetyModals } from './src/components/SafetyModals';
import { ServingModeModal } from './src/components/ServingModeModal';
import { DailyClosingModal } from './src/components/DailyClosingModal';
import { ReceiptModal } from './src/components/ReceiptModal';
import { ShopCalculatorModal } from './src/components/ShopCalculatorModal';
import { ManualEntryModal } from './src/components/ManualEntryModal';
import { QrStandeeModal } from './src/components/QrStandeeModal';
import { VoiceQueryModal } from './src/components/VoiceQueryModal';
import { OnboardingModal } from './src/components/OnboardingModal';

// Screens
import { OverviewScreen } from './src/screens/OverviewScreen';
import { LedgerScreen } from './src/screens/LedgerScreen';
import { CustomerDetailScreen } from './src/screens/CustomerDetailScreen';
import { InventoryScreen } from './src/screens/InventoryScreen';
import { BillsScreen } from './src/screens/BillsScreen';
import { RemindersScreen } from './src/screens/RemindersScreen';
import { InsightsScreen } from './src/screens/InsightsScreen';
import { SuppliersScreen } from './src/screens/SuppliersScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ParserTestsScreen } from './src/screens/ParserTestsScreen';
import { CustomerHomeScreen } from './src/screens/CustomerHomeScreen';

import {
  FileText,
  Bell,
  TrendingUp,
  Truck,
  Settings as SettingsIcon,
  FlaskConical,
  RotateCcw,
  Check,
  ChevronRight,
  Calculator,
  QrCode,
  PlusCircle,
} from 'lucide-react-native';

export default function App() {
  const {
    role,
    activeTab,
    setActiveTab,
    activeCustomer,
    setActiveCustomer,
    customers,
    commitTransaction,
    undoToast,
    undoTransaction,
    clearUndoToast,
    setSafetyModal,
    addPromise,
    activeParsedEntry,
    setActiveParsedEntry,
    isCalculatorOpen,
    setIsCalculatorOpen,
    isManualEntryOpen,
    setIsManualEntryOpen,
    isQrStandeeOpen,
    setIsQrStandeeOpen,
  } = useAppStore();

  const [isMicModalOpen, setIsMicModalOpen] = useState(false);

  // Handle Android Hardware Back Button
  useEffect(() => {
    const onBackPress = () => {
      if (activeCustomer) {
        setActiveCustomer(null);
        return true;
      }
      if (activeTab !== 'overview') {
        setActiveTab('overview');
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [activeCustomer, activeTab]);

  // Undo Toast Countdown Timer
  useEffect(() => {
    if (!undoToast) return;
    const interval = setInterval(() => {
      clearUndoToast();
    }, 5000);
    return () => clearInterval(interval);
  }, [undoToast]);

  // Handle voice or text from Mic Waveform modal
  const handleMicSubmit = (sentence: string) => {
    const parsed = parseSentenceToEntry(sentence, customers);

    // Strict Validation: reject gibberish/missing fields immediately
    if (!parsed.isValid || parsed.entries.length === 0) {
      setSafetyModal({
        type: 'INVALID_INPUT',
        payload: {
          message:
            parsed.validationError ||
            "Hisaab samajh nahi aaya. Kripya customer ka naam aur rupaye dono sahi se batayein. Jaise: 'Ramesh 500 udhaar'.",
        },
      });
      return;
    }

    // If promise to pay detected, record promise
    if (parsed.isPromise && parsed.promiseDate) {
      let cust = customers.find((c) =>
        c.name.toLowerCase().includes(parsed.promiseCustomer!.toLowerCase())
      );
      if (cust) {
        addPromise({
          customerId: cust.id,
          customerName: cust.name,
          promiseDate: parsed.promiseDate,
          note: parsed.promiseNote || sentence,
          status: 'PENDING',
        });
      }
    }

    const entry = parsed.entries[0];

    // Ambiguity check: Unclear Amount
    if (entry.ambiguities.includes('UNCLEAR_AMOUNT') || entry.amount <= 0) {
      setSafetyModal({
        type: 'UNCLEAR_AMOUNT',
        payload: {
          customerName: entry.customerRef,
          onSelectAmount: (amt: number) => {
            setActiveParsedEntry({ ...entry, amount: amt });
            setActiveTab('overview');
          },
        },
      });
      return;
    }

    // Ambiguity check: Unclear Type
    if (entry.ambiguities.includes('UNCLEAR_TYPE')) {
      setSafetyModal({
        type: 'UNCLEAR_TYPE',
        payload: {
          sentence,
          onSelectType: (t: 'CREDIT' | 'PAYMENT') => {
            setActiveParsedEntry({ ...entry, type: t });
            setActiveTab('overview');
          },
        },
      });
      return;
    }

    // Route to confirmation card (NEVER commit silently without shopkeeper review!)
    setActiveParsedEntry(entry);
    setActiveTab('overview');
  };

  const renderActiveScreen = () => {
    // If in Customer Mode
    if (role === 'customer') {
      return <CustomerHomeScreen />;
    }

    // If viewing customer detail in Shopkeeper Mode
    if (activeCustomer) {
      return (
        <CustomerDetailScreen
          customer={activeCustomer}
          onBack={() => setActiveCustomer(null)}
        />
      );
    }

    // Tab Router
    switch (activeTab) {
      case 'overview':
        return <OverviewScreen onOpenMic={() => setIsMicModalOpen(true)} />;
      case 'ledger':
        return <LedgerScreen />;
      case 'inventory':
        return <InventoryScreen />;
      case 'bills':
        return <BillsScreen />;
      case 'reminders':
        return <RemindersScreen />;
      case 'insights':
        return <InsightsScreen />;
      case 'suppliers':
        return <SuppliersScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'tests':
        return <ParserTestsScreen />;
      case 'more':
        return (
          <View style={styles.moreMenuContainer}>
            <Text style={styles.moreTitle}>More Features & Tools</Text>

            <TouchableOpacity
              style={styles.moreRow}
              onPress={() => setActiveTab('bills')}
            >
              <View style={styles.moreLeft}>
                <FileText size={20} color={lightColors.primary} />
                <Text style={styles.moreLabel}>Bills & Digital Parchis</Text>
              </View>
              <ChevronRight size={18} color={lightColors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreRow}
              onPress={() => setActiveTab('reminders')}
            >
              <View style={styles.moreLeft}>
                <Bell size={20} color={lightColors.accent} />
                <Text style={styles.moreLabel}>Reminders & Payment Follow-ups</Text>
              </View>
              <ChevronRight size={18} color={lightColors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreRow}
              onPress={() => setActiveTab('insights')}
            >
              <View style={styles.moreLeft}>
                <TrendingUp size={20} color={lightColors.info} />
                <Text style={styles.moreLabel}>Analytics & Cashflow Insights</Text>
              </View>
              <ChevronRight size={18} color={lightColors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreRow}
              onPress={() => setActiveTab('suppliers')}
            >
              <View style={styles.moreLeft}>
                <Truck size={20} color={lightColors.text} />
                <Text style={styles.moreLabel}>Wholesaler Khata (Suppliers)</Text>
              </View>
              <ChevronRight size={18} color={lightColors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreRow}
              onPress={() => setActiveTab('tests')}
            >
              <View style={styles.moreLeft}>
                <FlaskConical size={20} color={lightColors.info} />
                <Text style={styles.moreLabel}>Parser Test Cases (40+ sentences)</Text>
              </View>
              <ChevronRight size={18} color={lightColors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreRow}
              onPress={() => setIsManualEntryOpen(true)}
            >
              <View style={styles.moreLeft}>
                <PlusCircle size={20} color={lightColors.primary} />
                <Text style={styles.moreLabel}>+ Naya Hisaab (Manual Entry)</Text>
              </View>
              <ChevronRight size={18} color={lightColors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreRow}
              onPress={() => setIsCalculatorOpen(true)}
            >
              <View style={styles.moreLeft}>
                <Calculator size={20} color={lightColors.text} />
                <Text style={styles.moreLabel}>Counter Hisaab Calculator</Text>
              </View>
              <ChevronRight size={18} color={lightColors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreRow}
              onPress={() => setIsQrStandeeOpen(true)}
            >
              <View style={styles.moreLeft}>
                <QrCode size={20} color="#B45309" />
                <Text style={styles.moreLabel}>Dukaan Ka QR Standee (Print)</Text>
              </View>
              <ChevronRight size={18} color={lightColors.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreRow}
              onPress={() => setActiveTab('settings')}
            >
              <View style={styles.moreLeft}>
                <SettingsIcon size={20} color={lightColors.muted} />
                <Text style={styles.moreLabel}>Shop Profile & Settings</Text>
              </View>
              <ChevronRight size={18} color={lightColors.muted} />
            </TouchableOpacity>
          </View>
        );
      default:
        return <OverviewScreen onOpenMic={() => setIsMicModalOpen(true)} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <Header />

          {/* Floating 5-Second Undo Toast */}
          {undoToast && (
            <View style={styles.undoToast}>
              <View style={styles.undoLeft}>
                <Check size={18} color="#FFFFFF" />
                <View>
                  <Text style={styles.undoTitle}>
                    Saved: {undoToast.customerName} ({undoToast.type})
                  </Text>
                  <Text style={styles.undoSub}>
                    {formatINR(undoToast.amount)} recorded • Tap Undo to reverse
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.undoBtn}
                onPress={() => undoTransaction(undoToast.txId)}
              >
                <RotateCcw size={14} color="#172033" />
                <Text style={styles.undoBtnText}>Undo</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Main Screen Content */}
          <View style={styles.content}>{renderActiveScreen()}</View>

          {/* Bottom Navigation with Center Mic */}
          <BottomNav onOpenMic={() => setIsMicModalOpen(true)} />

          {/* Global Modals */}
          <MicWaveform
            visible={isMicModalOpen}
            onClose={() => setIsMicModalOpen(false)}
            onSubmitText={handleMicSubmit}
          />
          <SafetyModals />
          <ServingModeModal />
          <DailyClosingModal />
          <ReceiptModal />
          <ShopCalculatorModal />
          <ManualEntryModal />
          <QrStandeeModal />
          <VoiceQueryModal />
          <OnboardingModal />
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate-900 background on widescreen/desktop
    alignItems: 'center',
  },
  appShell: {
    flex: 1,
    width: '100%',
    maxWidth: 480, // Mobile-first constraint (C1)
    backgroundColor: lightColors.surface,
  },
  content: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  undoToast: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 70 : 54,
    left: 16,
    right: 16,
    zIndex: 999,
    backgroundColor: '#1E293B',
    borderRadius: layout.cardRadius,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  undoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  undoTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  undoSub: {
    fontSize: typography.sizes.xs,
    color: '#94A3B8',
    marginTop: 1,
  },
  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: layout.pillRadius,
  },
  undoBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#172033',
  },
  moreMenuContainer: {
    flex: 1,
    padding: 16,
  },
  moreTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
    marginBottom: 16,
  },
  moreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: lightColors.surface,
    padding: 16,
    borderRadius: layout.cardRadius,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  moreLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moreLabel: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
    color: lightColors.text,
  },
});
