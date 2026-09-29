import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from 'react-i18next';
import { parseSentenceToEntry, ParsedEntry } from '../core/parser/ParserService';
import { evaluateVoiceQuery } from '../core/parser/voiceQueryEngine';
import { calculateLedgerMetrics, getDebtorStatus, formatINR } from '../core/ledger/ledgerMath';
import {
  calculateBharosaBadge,
  calculatePaisaFasaHai,
} from '../core/ledger/customerHelpers';
import { UnderstandingCard } from '../components/UnderstandingCard';
import { Transaction } from '../db/schema';
import {
  Mic,
  Send,
  UserPlus,
  CreditCard,
  FileText,
  PackagePlus,
  Bell,
  Clock,
  Flame,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Share2,
  Store,
  HelpCircle,
  HelpCircle as QuestionIcon,
} from 'lucide-react-native';

interface OverviewScreenProps {
  onOpenMic: () => void;
}

const TRY_SAYING_CHIPS = [
  'Ramesh ne 500 rupaye ka maal liya',
  'Amit ne 200 de diye',
  'Ramesh ka kitna baaki hai?',
  'Priya ne 2 kilo sugar liya 180 ki',
  'Aaj kitna mila?',
  'Amit kal dega',
];

export const OverviewScreen: React.FC<OverviewScreenProps> = ({ onOpenMic }) => {
  const { t } = useTranslation();
  const {
    customers,
    transactions,
    products,
    profile,
    commitTransaction,
    setActiveCustomer,
    setActiveTab,
    setSafetyModal,
    addPromise,
    activeParsedEntry,
    setActiveParsedEntry,
    setIsManualEntryOpen,
    setIsQrStandeeOpen,
    stockTrackingEnabled,
    streakDays,
    setVoiceQueryAnswer,
    badaTextMode,
  } = useAppStore();

  const [inputText, setInputText] = useState('');
  const [helpTooltip, setHelpTooltip] = useState<string | null>(null);

  const metrics = calculateLedgerMetrics(customers, transactions);
  const lowStockCount = products.filter(
    (p) => p.currentStock <= p.lowStockThreshold
  ).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPayments = transactions
    .filter((t) => t.type === 'PAYMENT' && t.date === todayStr)
    .reduce((sum, t) => sum + t.amount, 0);

  const paisaFasa = calculatePaisaFasaHai(customers, transactions);

  // Process text or voice input
  const handleProcessInput = (sentenceToRun?: string) => {
    const text = sentenceToRun || inputText;
    if (!text.trim()) return;

    const parsed = parseSentenceToEntry(text, customers);

    // F1. VOICE QUERY / QUESTION ("Ramesh ka kitna baaki hai?", "Aaj kitna mila?")
    if (parsed.isQuestion) {
      const answer = evaluateVoiceQuery(text, customers, transactions, products);
      setVoiceQueryAnswer(answer);
      setInputText('');
      return;
    }

    // Strict validation
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

    // If promise to pay detected
    if (parsed.isPromise && parsed.promiseDate) {
      const cust = customers.find((c) =>
        c.name.toLowerCase().includes(parsed.promiseCustomer!.toLowerCase())
      );
      if (cust) {
        addPromise({
          customerId: cust.id,
          customerName: cust.name,
          promiseDate: parsed.promiseDate,
          note: parsed.promiseNote || text,
          status: 'PENDING',
        });
      }
    }

    const entry = parsed.entries[0];

    // Check ambiguities: Unclear Amount
    if (entry.ambiguities.includes('UNCLEAR_AMOUNT') || entry.amount <= 0) {
      setSafetyModal({
        type: 'UNCLEAR_AMOUNT',
        payload: {
          customerName: entry.customerRef,
          onSelectAmount: (amt: number) => {
            setActiveParsedEntry({ ...entry, amount: amt });
          },
        },
      });
      return;
    }

    // Check ambiguities: Unclear Type
    if (entry.ambiguities.includes('UNCLEAR_TYPE')) {
      setSafetyModal({
        type: 'UNCLEAR_TYPE',
        payload: {
          sentence: text,
          onSelectType: (t: 'CREDIT' | 'PAYMENT') => {
            setActiveParsedEntry({ ...entry, type: t });
          },
        },
      });
      return;
    }

    // Route to confirmation card (NEVER commit directly!)
    setActiveParsedEntry(entry);
    setInputText('');
  };

  const handleConfirmUnderstanding = (entry: ParsedEntry) => {
    const cust = customers.find(
      (c) => c.name.toLowerCase() === entry.customerRef.toLowerCase()
    );

    commitTransaction({
      customerId: cust ? cust.id : `cust-${Date.now()}`,
      customerName: entry.customerRef,
      amount: entry.amount,
      type: entry.type === 'UNKNOWN' ? 'CREDIT' : entry.type,
      method: entry.method,
      date: entry.date,
      note: entry.note,
      items: entry.items,
      source: 'voice',
    });

    setActiveParsedEntry(null);
  };

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Greeting & Date */}
      <View style={styles.greetingHeader}>
        <View style={styles.shopMetaRow}>
          <Store size={20} color={lightColors.primary} />
          <View>
            <Text style={[styles.shopName, badaTextMode && styles.textBada]}>
              {profile.name || 'Patil Kirana Store'}
            </Text>
            <Text style={styles.dateSub}>
              {formattedDate} • Aaj
            </Text>
          </View>
        </View>

        {/* Small ? Help icon */}
        <TouchableOpacity
          style={styles.helpIconBtn}
          onPress={() =>
            setHelpTooltip(
              helpTooltip
                ? null
                : 'HisabAI me bolkar ya likhkar hisaab likhein. Grahak ka naam aur rupaye bolne par parchi banti hai.'
            )
          }
        >
          <HelpCircle size={18} color={lightColors.muted} />
        </TouchableOpacity>
      </View>

      {/* Inline Help Tooltip if open */}
      {helpTooltip && (
        <View style={styles.helpTooltipBox}>
          <Text style={styles.helpTooltipText}>{helpTooltip}</Text>
        </View>
      )}

      {/* 2. Four Cards: [Total Lena Hai] [Aaj Mila] [Pending Grahak] [Low Stock] */}
      <View style={styles.fourCardsGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Lena Hai</Text>
          <Text style={[styles.summaryMoney, { color: '#B45309' }]}>
            {formatINR(metrics.totalOutstanding)}
          </Text>
          <Text style={styles.summarySub}>{metrics.debtorsCount} grahak</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Aaj Mila</Text>
          <Text style={[styles.summaryMoney, { color: lightColors.primary }]}>
            {formatINR(todayPayments)}
          </Text>
          <Text style={styles.summarySub}>Cash & UPI</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Pending Grahak</Text>
          <Text style={[styles.summaryMoney, { color: lightColors.text }]}>
            {metrics.debtorsCount}
          </Text>
          <Text style={styles.summarySub}>Bahi-Khata</Text>
        </View>

        {stockTrackingEnabled && (
          <TouchableOpacity
            style={styles.summaryCard}
            onPress={() => setActiveTab('inventory')}
          >
            <Text style={styles.summaryLabel}>Low Stock</Text>
            <Text
              style={[
                styles.summaryMoney,
                { color: lowStockCount > 0 ? '#DC2626' : lightColors.primary },
              ]}
            >
              {lowStockCount} items
            </Text>
            <Text style={styles.summarySub}>
              {lowStockCount > 0 ? 'Reorder karein' : 'Sab theek'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 3. F4 Paisa Fasa Hai Line + F5 Roz Ka Streak */}
      <View style={styles.paisaFasaRow}>
        <View style={styles.fasaLeft}>
          <AlertTriangle size={15} color="#B45309" />
          <Text style={styles.fasaText}>{paisaFasa.displayText}</Text>
        </View>
        <View style={styles.streakBadge}>
          <Flame size={14} color="#EA580C" />
          <Text style={styles.streakText}>{streakDays} din 🔥</Text>
        </View>
      </View>

      {/* 4. HUGE Button: 🎙 Bolke Hisaab Likho */}
      <TouchableOpacity
        style={[styles.bigMicButton, badaTextMode && styles.btnBada]}
        onPress={onOpenMic}
        activeOpacity={0.85}
      >
        <Mic size={26} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={[styles.bigMicText, badaTextMode && styles.textBadaBold]}>
          🎙 Bolke hisaab likho
        </Text>
      </TouchableOpacity>

      {/* Conversational Text Box right under big mic */}
      <View style={styles.inputCard}>
        <TextInput
          style={[styles.textInput, badaTextMode && styles.textBada]}
          placeholder="Yahan type karein ya mic dabayein..."
          placeholderTextColor={lightColors.muted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleProcessInput()}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            !inputText.trim() && styles.sendBtnDisabled,
          ]}
          onPress={() => handleProcessInput()}
          disabled={!inputText.trim()}
        >
          <Send size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Try saying demo phrase chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tryChipsRow}
      >
        {TRY_SAYING_CHIPS.map((chip, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.tryChip}
            onPress={() => {
              setInputText(chip);
              handleProcessInput(chip);
            }}
          >
            <Text style={styles.tryChipText}>"{chip}"</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 5. Quick Actions: Add by Voice · New Customer · Record Payment · Create Bill · Add Stock · Send Reminder */}
      <Text style={styles.sectionHeading}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity style={styles.quickActionCard} onPress={onOpenMic}>
          <Mic size={18} color={lightColors.primary} />
          <Text style={styles.quickActionLabel}>Add by Voice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => setIsManualEntryOpen(true)}
        >
          <UserPlus size={18} color={lightColors.text} />
          <Text style={styles.quickActionLabel}>New Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => setIsManualEntryOpen(true)}
        >
          <CreditCard size={18} color={lightColors.primary} />
          <Text style={styles.quickActionLabel}>Record Payment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => setActiveTab('bills')}
        >
          <FileText size={18} color={lightColors.text} />
          <Text style={styles.quickActionLabel}>Create Bill</Text>
        </TouchableOpacity>

        {stockTrackingEnabled && (
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => setActiveTab('inventory')}
          >
            <PackagePlus size={18} color={lightColors.text} />
            <Text style={styles.quickActionLabel}>Add Stock</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => setActiveTab('reminders')}
        >
          <Bell size={18} color="#B45309" />
          <Text style={styles.quickActionLabel}>Send Reminder</Text>
        </TouchableOpacity>
      </View>

      {/* 6. Understanding Card (when active, confirmed here) */}
      {activeParsedEntry && (
        <UnderstandingCard
          entry={activeParsedEntry}
          knownCustomerNames={customers.map((c) => c.name)}
          onConfirm={handleConfirmUnderstanding}
          onCancel={() => setActiveParsedEntry(null)}
        />
      )}

      {/* 7. Who owes the most? Debtor list with Bharosa Badges */}
      <View style={styles.debtorsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kiska kitna baaki hai?</Text>
          <TouchableOpacity onPress={() => setActiveTab('ledger')}>
            <Text style={styles.viewAllText}>Sabhi Dekhein</Text>
          </TouchableOpacity>
        </View>

        {metrics.topDebtors.slice(0, 5).map((debtor) => {
          const bharosa = calculateBharosaBadge(debtor, transactions);
          return (
            <TouchableOpacity
              key={debtor.id}
              style={styles.debtorRow}
              onPress={() => {
                setActiveCustomer(debtor);
                setActiveTab('ledger');
              }}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {debtor.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.debtorInfo}>
                <View style={styles.debtorNameRow}>
                  <Text style={[styles.debtorName, badaTextMode && styles.textBada]}>
                    {debtor.name}
                  </Text>
                  {/* F3. Bharosa Badge */}
                  <View style={[styles.bharosaPill, { backgroundColor: bharosa.bg }]}>
                    <Text style={[styles.bharosaText, { color: bharosa.color }]}>
                      {bharosa.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.debtorMeta}>
                  Aakhiri len-den: {debtor.lastTxDate || 'N/A'} • {debtor.phone}
                </Text>
              </View>

              <View style={styles.debtorBalanceCol}>
                <Text style={[styles.debtorBalance, badaTextMode && styles.textBadaBold]}>
                  {formatINR(debtor.balance)}
                </Text>
                <Text style={styles.dueLabel}>Dena Hai</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
    padding: 16,
  },
  greetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  shopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shopName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  dateSub: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
  },
  helpIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: lightColors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTooltipBox: {
    backgroundColor: lightColors.surfaceSubtle,
    borderRadius: layout.inputRadius,
    padding: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: lightColors.primary,
  },
  helpTooltipText: {
    fontSize: typography.sizes.xs,
    color: lightColors.text,
    lineHeight: 18,
  },
  fourCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: lightColors.surface,
    borderRadius: layout.cardRadius,
    padding: 12,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  summaryLabel: {
    fontSize: 11,
    color: lightColors.muted,
    fontWeight: typography.weights.semibold,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  summaryMoney: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
    fontVariant: ['tabular-nums'],
  },
  summarySub: {
    fontSize: 11,
    color: lightColors.muted,
  },
  paisaFasaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: layout.inputRadius,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  fasaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  fasaText: {
    fontSize: 11,
    fontWeight: typography.weights.medium,
    color: '#92400E',
    flex: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: layout.pillRadius,
  },
  streakText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: '#EA580C',
  },
  bigMicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: lightColors.primary,
    borderRadius: layout.cardRadius,
    paddingVertical: 18,
    minHeight: 56,
    elevation: 4,
    shadowColor: lightColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 12,
  },
  bigMicText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.surface,
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: layout.inputRadius,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    fontSize: typography.sizes.body,
    color: lightColors.text,
    minHeight: 44,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: lightColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: lightColors.muted,
    opacity: 0.4,
  },
  tryChipsRow: {
    gap: 8,
    paddingBottom: 14,
  },
  tryChip: {
    backgroundColor: lightColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: layout.pillRadius,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  tryChipText: {
    fontSize: 11,
    color: lightColors.text,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: lightColors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: lightColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: layout.buttonRadius,
    borderWidth: 1,
    borderColor: lightColors.border,
    minHeight: layout.minTapTarget,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: typography.weights.semibold,
    color: lightColors.text,
  },
  debtorsSection: {
    backgroundColor: lightColors.surface,
    borderRadius: layout.cardRadius,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  viewAllText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: lightColors.primary,
  },
  debtorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: lightColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: lightColors.primary,
  },
  debtorInfo: {
    flex: 1,
  },
  debtorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  debtorName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  bharosaPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  bharosaText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
  },
  debtorMeta: {
    fontSize: 11,
    color: lightColors.muted,
    marginTop: 2,
  },
  debtorBalanceCol: {
    alignItems: 'flex-end',
  },
  debtorBalance: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#B45309',
    fontVariant: ['tabular-nums'],
  },
  dueLabel: {
    fontSize: 10,
    color: lightColors.muted,
  },
  textBada: {
    fontSize: 18,
  },
  textBadaBold: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
  },
  btnBada: {
    paddingVertical: 22,
    minHeight: 64,
  },
});
