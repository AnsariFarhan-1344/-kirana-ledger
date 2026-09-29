import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Linking,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';
import { Customer } from '../db/schema';
import { calculateCustomerLedger, formatINR } from '../core/ledger/ledgerMath';
import { calculateBharosaBadge } from '../core/ledger/customerHelpers';
import { generateReminderMessage, buildWhatsAppReminderUrl } from '../core/reminders/reminderTemplates';
import { BRAND_NAME } from '../config/brand';
import { parseSentenceToEntry } from '../core/parser/ParserService';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  MessageCircle,
  QrCode,
  Send,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Phone,
  HelpCircle,
  PlusCircle,
  DollarSign,
  RotateCcw,
  X,
  ShieldCheck,
} from 'lucide-react-native';

interface CustomerDetailScreenProps {
  customer: Customer;
  onBack: () => void;
}

export const CustomerDetailScreen: React.FC<CustomerDetailScreenProps> = ({
  customer,
  onBack,
}) => {
  const {
    customers,
    transactions,
    bills,
    profile,
    commitTransaction,
    setReceiptBill,
    repeatCustomerOrder,
    mergeCustomers,
  } = useAppStore();

  const [inlineInput, setInlineInput] = useState('');
  const [showBharosaInfo, setShowBharosaInfo] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmountStr, setPaymentAmountStr] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI'>('CASH');
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  // Derive ledger calculations & Bharosa Badge
  const ledger = calculateCustomerLedger(customer.id, transactions);
  const bharosa = calculateBharosaBadge(customer, transactions);

  // Quick inline transaction handler
  const handleQuickAdd = () => {
    if (!inlineInput.trim()) return;

    // Prepend customer name to ensure parser identifies customer
    const fullSentence = `${customer.name} ${inlineInput}`;
    const parsed = parseSentenceToEntry(fullSentence);

    if (parsed.entries && parsed.entries.length > 0) {
      const entry = parsed.entries[0];
      commitTransaction({
        customerId: customer.id,
        customerName: customer.name,
        amount: entry.amount,
        type: entry.type === 'UNKNOWN' ? 'CREDIT' : entry.type,
        method: entry.method,
        date: entry.date,
        note: entry.note,
        items: entry.items,
        source: 'text',
      });
      setInlineInput('');
    }
  };

  // WhatsApp Reminder Link
  const handleSendReminder = () => {
    const text = generateReminderMessage({
      shopName: profile.shopName,
      customerName: customer.name,
      amount: ledger.balance,
      upiId: profile.upiId,
      language: (customer.language as any) || 'Hinglish',
      tone: 'normal',
    });

    const url = buildWhatsAppReminderUrl(customer.phone, text);
    Linking.openURL(url).catch(() => {});
  };

  // Record Payment Modal Save
  const handleSavePayment = () => {
    const amt = parseFloat(paymentAmountStr);
    if (!amt || isNaN(amt) || amt <= 0) return;

    commitTransaction({
      customerId: customer.id,
      customerName: customer.name,
      amount: amt,
      type: 'PAYMENT',
      method: paymentMethod,
      date: new Date().toISOString().split('T')[0],
      note: `Payment via ${paymentMethod}`,
      source: 'manual',
    });

    setIsPaymentModalOpen(false);
    setPaymentAmountStr('');
  };

  const parsedPaymentAmt = parseFloat(paymentAmountStr) || 0;
  const isAdvancePayment = ledger.balance > 0 && parsedPaymentAmt > ledger.balance;

  return (
    <View style={styles.container}>
      {/* Top Navigation */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={20} color={lightColors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerName}>{customer.name}</Text>
          <Text style={styles.headerPhone}>{customer.phone}</Text>
        </View>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => Linking.openURL(`tel:${customer.phone}`)}
        >
          <Phone size={18} color={lightColors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Outstanding Balance Banner */}
        <View style={styles.balanceCard}>
          {/* Bharosa Badge row */}
          <TouchableOpacity
            style={[styles.bharosaChip, { backgroundColor: bharosa.bg, borderColor: bharosa.color }]}
            onPress={() => setShowBharosaInfo(true)}
          >
            <ShieldCheck size={14} color={bharosa.color} />
            <Text style={[styles.bharosaText, { color: bharosa.color }]}>{bharosa.label}</Text>
            <HelpCircle size={14} color={bharosa.color} />
          </TouchableOpacity>

          <Text style={styles.balanceLabel}>Total Dena Hai (Outstanding)</Text>
          <Text
            style={[
              styles.balanceValue,
              ledger.balance > 0 ? styles.creditColor : styles.clearColor,
            ]}
          >
            {ledger.balance > 0 ? formatINR(ledger.balance) : 'All Clear ✓'}
          </Text>
          <Text style={styles.balanceSub}>
            Credit Limit: {formatINR(customer.creditLimit || 5000)} • Bhasha:{' '}
            {customer.language || 'Hinglish'}
          </Text>

          {/* Repeat Order Button (F2) */}
          {ledger.transactions.some((t) => t.type === 'CREDIT') && (
            <TouchableOpacity
              style={styles.repeatOrderBtn}
              onPress={() => {
                repeatCustomerOrder(customer.id);
                onBack();
              }}
            >
              <RotateCcw size={15} color="#166534" />
              <Text style={styles.repeatOrderText}>🔁 Dobara wahi maal (Repeat Order)</Text>
            </TouchableOpacity>
          )}

          {/* 4 Primary Action Buttons (H1) */}
          <View style={styles.fourBtnGrid}>
            <TouchableOpacity
              style={styles.actionBtnPrimary}
              onPress={() => setInlineInput('₹')}
            >
              <PlusCircle size={16} color="#FFFFFF" />
              <Text style={styles.actionBtnTextPrimary}>+ Add Entry</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={() => {
                setPaymentAmountStr(ledger.balance > 0 ? String(ledger.balance) : '');
                setIsPaymentModalOpen(true);
              }}
            >
              <DollarSign size={16} color={lightColors.primary} />
              <Text style={styles.actionBtnTextSecondary}>💰 Record Payment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnOutline}
              onPress={() => {
                const bill = bills.find((b) => b.customerId === customer.id);
                if (bill) setReceiptBill(bill);
                else {
                  Alert.alert('Parchi', 'Is customer ke liye abhi koi bill generate nahi hua.');
                }
              }}
            >
              <Receipt size={16} color={lightColors.text} />
              <Text style={styles.actionBtnTextOutline}>🧾 View Bills</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnWhatsapp}
              onPress={handleSendReminder}
            >
              <MessageCircle size={16} color="#FFFFFF" />
              <Text style={styles.actionBtnTextPrimary}>🔔 Send Reminder</Text>
            </TouchableOpacity>
          </View>

          {/* Merge Customer Link */}
          <TouchableOpacity
            style={styles.mergeLinkBtn}
            onPress={() => setIsMergeModalOpen(true)}
          >
            <Text style={styles.mergeLinkText}>🔗 Duplicate khata milayein (Merge Customer)</Text>
          </TouchableOpacity>
        </View>

        {/* Chronological Ledger Timeline with Icon + Text */}
        <Text style={styles.timelineTitle}>Recent Hisaab Timeline</Text>
        {ledger.transactions.length === 0 ? (
          <View style={styles.emptyTimeline}>
            <Text style={styles.emptyTimelineText}>Abhi tak koi hisaab nahi hai.</Text>
          </View>
        ) : (
          ledger.transactions.map((tx) => {
            const isCredit = tx.type === 'CREDIT';
            const daysSince = Math.floor(
              (new Date().getTime() - new Date(tx.date).getTime()) / (1000 * 3600 * 24)
            );
            const isOverdue = isCredit && daysSince > 30 && ledger.balance > 0;

            return (
              <View key={tx.id} style={styles.txRow}>
                <View style={styles.txLeft}>
                  <View
                    style={[
                      styles.txIconWrap,
                      isCredit ? styles.creditIcon : styles.paymentIcon,
                    ]}
                  >
                    {isCredit ? (
                      <ArrowUpRight size={16} color="#B45309" />
                    ) : (
                      <ArrowDownLeft size={16} color={lightColors.primary} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.txNote}>{tx.note || (isCredit ? 'Udhaar Maal' : 'Payment')}</Text>
                      {/* Explicit Text Badge */}
                      <View
                        style={[
                          styles.typeTag,
                          isCredit ? styles.typeTagCredit : styles.typeTagPayment,
                        ]}
                      >
                        <Text
                          style={[
                            styles.typeTagText,
                            isCredit ? styles.typeTagTextCredit : styles.typeTagTextPayment,
                          ]}
                        >
                          {isCredit ? 'Udhaar' : 'Payment'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.txDate}>
                      {tx.date} • {tx.method} • {tx.addedBy || 'Shopkeeper'}
                    </Text>

                    {isOverdue && (
                      <View style={styles.overdueBadge}>
                        <AlertTriangle size={12} color="#DC2626" />
                        <Text style={styles.overdueText}>Overdue ({daysSince} din purana)</Text>
                      </View>
                    )}

                    {tx.confirmedByCustomer && (
                      <View style={styles.confirmedBadge}>
                        <CheckCircle2 size={12} color={lightColors.primary} />
                        <Text style={styles.confirmedText}>
                          Customer ne confirm kiya ✓
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.txRight}>
                  <Text
                    style={[
                      styles.txAmount,
                      isCredit ? styles.creditAmount : styles.paymentAmount,
                    ]}
                  >
                    {isCredit ? '+' : '−'}
                    {formatINR(tx.amount)}
                  </Text>
                  {tx.billId && (
                    <TouchableOpacity
                      style={styles.viewBillBtn}
                      onPress={() => {
                        const b = bills.find((item) => item.id === tx.billId);
                        if (b) setReceiptBill(b);
                      }}
                    >
                      <Receipt size={12} color={lightColors.info} />
                      <Text style={styles.viewBillText}>Parchi</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Bottom Inline Voice/Text Input */}
      <View style={styles.inlineBottomBar}>
        <TextInput
          style={styles.inlineInput}
          placeholder={`"${customer.name} ke liye likho: 200 udhaar"...`}
          placeholderTextColor={lightColors.muted}
          value={inlineInput}
          onChangeText={setInlineInput}
          onSubmitEditing={handleQuickAdd}
        />
        <TouchableOpacity
          style={[
            styles.inlineSendBtn,
            !inlineInput.trim() && styles.inlineSendDisabled,
          ]}
          onPress={handleQuickAdd}
          disabled={!inlineInput.trim()}
        >
          <Send size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Bharosa Badge Rule Info Modal */}
      <Modal
        visible={showBharosaInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBharosaInfo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.infoModalBox}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={20} color={bharosa.color} />
                <Text style={styles.infoModalTitle}>Bharosa Badge: {bharosa.label}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowBharosaInfo(false)}>
                <X size={20} color={lightColors.muted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.infoModalBody}>{bharosa.ruleExplanation}</Text>
            <View style={styles.ruleHelpBox}>
              <Text style={styles.ruleHelpHead}>Badge Rules (Asli Len-den Se):</Text>
              <Text style={styles.ruleHelpItem}>• Samay par deta hai: 75%+ payments waqt par</Text>
              <Text style={styles.ruleHelpItem}>• Kabhi kabhi der: 40% - 74% payments</Text>
              <Text style={styles.ruleHelpItem}>• Aksar der: Udhaar 30+ din se bacha hua hai</Text>
              <Text style={styles.ruleHelpItem}>• Naya customer: Pehle koi hisaab nahi</Text>
            </View>

            <TouchableOpacity
              style={styles.infoModalCloseBtn}
              onPress={() => setShowBharosaInfo(false)}
            >
              <Text style={styles.infoModalCloseText}>Samajh Gaya ✓</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Record Payment Sheet (H2) */}
      <Modal
        visible={isPaymentModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPaymentModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.paymentSheet}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.infoModalTitle}>💰 Record Payment for {customer.name}</Text>
              <TouchableOpacity onPress={() => setIsPaymentModalOpen(false)}>
                <X size={20} color={lightColors.muted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sheetSub}>
              Baaki Udhaar: <Text style={{ fontWeight: 'bold' }}>{formatINR(ledger.balance)}</Text>
            </Text>

            {/* Quick Amount Chips */}
            <View style={styles.chipRow}>
              {[100, 200, 500, 1000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[
                    styles.amtChip,
                    paymentAmountStr === String(amt) && styles.amtChipActive,
                  ]}
                  onPress={() => setPaymentAmountStr(String(amt))}
                >
                  <Text
                    style={[
                      styles.amtChipText,
                      paymentAmountStr === String(amt) && styles.amtChipTextActive,
                    ]}
                  >
                    ₹{amt}
                  </Text>
                </TouchableOpacity>
              ))}
              {ledger.balance > 0 && (
                <TouchableOpacity
                  style={[
                    styles.amtChip,
                    paymentAmountStr === String(ledger.balance) && styles.amtChipActive,
                  ]}
                  onPress={() => setPaymentAmountStr(String(ledger.balance))}
                >
                  <Text
                    style={[
                      styles.amtChipText,
                      paymentAmountStr === String(ledger.balance) && styles.amtChipTextActive,
                    ]}
                  >
                    Poora ₹{ledger.balance}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Custom Amount Input */}
            <TextInput
              style={styles.amountInput}
              placeholder="Raqam darj karein (e.g. 500)"
              placeholderTextColor={lightColors.muted}
              keyboardType="numeric"
              value={paymentAmountStr}
              onChangeText={setPaymentAmountStr}
            />

            {/* Payment Method Toggle */}
            <View style={styles.methodToggleRow}>
              <TouchableOpacity
                style={[
                  styles.methodBtn,
                  paymentMethod === 'CASH' && styles.methodBtnActive,
                ]}
                onPress={() => setPaymentMethod('CASH')}
              >
                <Text
                  style={[
                    styles.methodBtnText,
                    paymentMethod === 'CASH' && styles.methodBtnTextActive,
                  ]}
                >
                  💵 Cash Mila
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.methodBtn,
                  paymentMethod === 'UPI' && styles.methodBtnActive,
                ]}
                onPress={() => setPaymentMethod('UPI')}
              >
                <Text
                  style={[
                    styles.methodBtnText,
                    paymentMethod === 'UPI' && styles.methodBtnTextActive,
                  ]}
                >
                  📱 Online / UPI Mila
                </Text>
              </TouchableOpacity>
            </View>

            {/* Advance Warning if amount > due */}
            {isAdvancePayment && (
              <View style={styles.advanceWarningBox}>
                <AlertTriangle size={16} color="#B45309" />
                <Text style={styles.advanceWarningText}>
                  Advance ₹{parsedPaymentAmt - ledger.balance}. Advance ke roop me rakhein?
                </Text>
              </View>
            )}

            {/* Save Payment Button */}
            <TouchableOpacity
              style={[
                styles.savePaymentBtn,
                (!parsedPaymentAmt || parsedPaymentAmt <= 0) && styles.savePaymentBtnDisabled,
              ]}
              disabled={!parsedPaymentAmt || parsedPaymentAmt <= 0}
              onPress={handleSavePayment}
            >
              <Text style={styles.savePaymentText}>Save Payment (₹{parsedPaymentAmt || 0})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Merge Customers Modal (E1) */}
      <Modal
        visible={isMergeModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsMergeModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.paymentSheet}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.infoModalTitle}>🔗 Merge {customer.name} Khata</Text>
              <TouchableOpacity onPress={() => setIsMergeModalOpen(false)}>
                <X size={20} color={lightColors.muted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sheetSub}>
              Agar '{customer.name}' ka duplicate khata ban gaya hai, to use dusre grahak me jodkar saare len-den shift kar sakte hain:
            </Text>

            <Text style={{ fontSize: typography.sizes.xs, fontWeight: 'bold', color: lightColors.text, marginTop: 8, marginBottom: 6 }}>
              Kisme merge karna hai (Target Grahak):
            </Text>

            <ScrollView style={{ maxHeight: 220, marginVertical: 8 }} showsVerticalScrollIndicator={false}>
              {customers
                .filter((c) => c.id !== customer.id)
                .map((target) => (
                  <TouchableOpacity
                    key={target.id}
                    style={[
                      styles.mergeTargetRow,
                      selectedTargetId === target.id && styles.mergeTargetRowActive,
                    ]}
                    onPress={() => setSelectedTargetId(target.id)}
                  >
                    <Text style={styles.mergeTargetName}>{target.name}</Text>
                    <Text style={styles.mergeTargetPhone}>{target.phone}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.savePaymentBtn,
                !selectedTargetId && styles.savePaymentBtnDisabled,
                { marginTop: 12 },
              ]}
              disabled={!selectedTargetId}
              onPress={() => {
                if (!selectedTargetId) return;
                mergeCustomers(customer.id, selectedTargetId);
                setIsMergeModalOpen(false);
                onBack();
              }}
            >
              <Text style={styles.savePaymentText}>Merge & Move Transactions ✓</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: lightColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
    paddingTop: Platform.OS === 'android' ? 36 : 14,
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
  headerTitleCol: {
    flex: 1,
  },
  headerName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  headerPhone: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
  },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: lightColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    padding: 16,
  },
  balanceCard: {
    backgroundColor: lightColors.surface,
    borderRadius: layout.cardRadius,
    padding: 16,
    borderWidth: 1,
    borderColor: lightColors.border,
    alignItems: 'center',
    marginBottom: 16,
  },
  bharosaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  bharosaText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  balanceLabel: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    fontWeight: typography.weights.medium,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: typography.weights.black,
    marginVertical: 4,
  },
  creditColor: {
    color: '#B45309',
  },
  clearColor: {
    color: lightColors.primary,
  },
  balanceSub: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    marginBottom: 12,
  },
  repeatOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: layout.buttonRadius,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    width: '100%',
  },
  repeatOrderText: {
    color: '#166534',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  fourBtnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },
  actionBtnPrimary: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: lightColors.primary,
    borderRadius: layout.buttonRadius,
    paddingVertical: 10,
    minHeight: layout.minTapTarget,
  },
  actionBtnTextPrimary: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  actionBtnSecondary: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: lightColors.primarySoft,
    borderRadius: layout.buttonRadius,
    paddingVertical: 10,
    minHeight: layout.minTapTarget,
  },
  actionBtnTextSecondary: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: lightColors.primary,
  },
  actionBtnOutline: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: lightColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: layout.buttonRadius,
    paddingVertical: 10,
    minHeight: layout.minTapTarget,
  },
  actionBtnTextOutline: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  actionBtnWhatsapp: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#25D366',
    borderRadius: layout.buttonRadius,
    paddingVertical: 10,
    minHeight: layout.minTapTarget,
  },
  timelineTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: lightColors.muted,
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  emptyTimeline: {
    padding: 24,
    alignItems: 'center',
  },
  emptyTimelineText: {
    color: lightColors.muted,
    fontSize: typography.sizes.sm,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: lightColors.surface,
    padding: 12,
    borderRadius: layout.cardRadius,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  txIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  creditIcon: {
    backgroundColor: lightColors.accentSoft,
  },
  paymentIcon: {
    backgroundColor: lightColors.primarySoft,
  },
  txNote: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  typeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeTagCredit: {
    backgroundColor: '#FEF3C7',
  },
  typeTagPayment: {
    backgroundColor: lightColors.primarySoft,
  },
  typeTagText: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.bold,
  },
  typeTagTextCredit: {
    color: '#B45309',
  },
  typeTagTextPayment: {
    color: lightColors.primary,
  },
  txDate: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    marginTop: 2,
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  overdueText: {
    fontSize: typography.sizes.micro,
    color: '#DC2626',
    fontWeight: typography.weights.bold,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  confirmedText: {
    fontSize: typography.sizes.micro,
    color: lightColors.primary,
    fontWeight: typography.weights.semibold,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
  },
  creditAmount: {
    color: '#B45309',
  },
  paymentAmount: {
    color: lightColors.primary,
  },
  viewBillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  viewBillText: {
    fontSize: typography.sizes.micro,
    color: lightColors.info,
    fontWeight: typography.weights.semibold,
  },
  inlineBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: lightColors.surface,
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
    gap: 8,
  },
  inlineInput: {
    flex: 1,
    backgroundColor: lightColors.surfaceSubtle,
    borderRadius: layout.inputRadius,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: typography.sizes.body,
    color: lightColors.text,
  },
  inlineSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: lightColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineSendDisabled: {
    backgroundColor: lightColors.muted,
    opacity: 0.4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  infoModalBox: {
    backgroundColor: lightColors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoModalTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  infoModalBody: {
    fontSize: typography.sizes.sm,
    color: lightColors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  ruleHelpBox: {
    backgroundColor: lightColors.surfaceSubtle,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 4,
  },
  ruleHelpHead: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
    marginBottom: 4,
  },
  ruleHelpItem: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
  },
  infoModalCloseBtn: {
    backgroundColor: lightColors.primary,
    borderRadius: layout.buttonRadius,
    paddingVertical: 12,
    alignItems: 'center',
  },
  infoModalCloseText: {
    color: '#FFFFFF',
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  paymentSheet: {
    backgroundColor: lightColors.surface,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 420,
  },
  sheetSub: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    marginBottom: 14,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  amtChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: layout.buttonRadius,
    backgroundColor: lightColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  amtChipActive: {
    backgroundColor: lightColors.primarySoft,
    borderColor: lightColors.primary,
  },
  amtChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: lightColors.text,
  },
  amtChipTextActive: {
    color: lightColors.primary,
    fontWeight: typography.weights.bold,
  },
  amountInput: {
    backgroundColor: lightColors.surfaceSubtle,
    borderRadius: layout.inputRadius,
    borderWidth: 1,
    borderColor: lightColors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
    marginBottom: 14,
  },
  methodToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: layout.buttonRadius,
    alignItems: 'center',
    backgroundColor: lightColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  methodBtnActive: {
    backgroundColor: lightColors.primarySoft,
    borderColor: lightColors.primary,
  },
  methodBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: lightColors.muted,
  },
  methodBtnTextActive: {
    color: lightColors.primary,
    fontWeight: typography.weights.bold,
  },
  advanceWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  advanceWarningText: {
    color: '#92400E',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    flex: 1,
  },
  savePaymentBtn: {
    backgroundColor: lightColors.primary,
    borderRadius: layout.buttonRadius,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.minTapTarget,
  },
  savePaymentBtnDisabled: {
    backgroundColor: lightColors.muted,
    opacity: 0.5,
  },
  savePaymentText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
  },
  mergeLinkBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  mergeLinkText: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    textDecorationLine: 'underline',
  },
  mergeTargetRow: {
    padding: 12,
    borderRadius: layout.inputRadius,
    backgroundColor: lightColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: lightColors.border,
    marginBottom: 6,
  },
  mergeTargetRowActive: {
    backgroundColor: lightColors.primarySoft,
    borderColor: lightColors.primary,
  },
  mergeTargetName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  mergeTargetPhone: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    marginTop: 2,
  },
});
