import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';
import { formatINR, calculateCustomerLedger } from '../core/ledger/ledgerMath';
import { BRAND_NAME } from '../config/brand';
import {
  Store,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  QrCode,
  X,
  MessageSquare,
  Calendar,
} from 'lucide-react-native';

const DISPUTE_REASONS = [
  'Yeh samaan maine nahi liya',
  'Raqam (Amount) galat hai',
  'Maine pehle hi paise de diye the',
  'Duplicate entry likhi hai',
];

export const CustomerHomeScreen: React.FC = () => {
  const {
    profile,
    transactions,
    confirmCustomerAck,
    raiseDispute,
    addPromise,
  } = useAppStore();

  // For customer view, we track the shopkeeper's transactions with customer "Ramesh Patil" (cust-1)
  const customerId = 'cust-1';
  const customerName = 'Ramesh Patil';
  const ledger = calculateCustomerLedger(customerId, transactions);

  const [activeDisputeTxId, setActiveDisputeTxId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState(DISPUTE_REASONS[0]);
  const [customDisputeText, setCustomDisputeText] = useState('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [promiseSent, setPromiseSent] = useState(false);

  const handleKalDunga = () => {
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    const tmrIso = tmr.toISOString().split('T')[0];

    addPromise({
      customerId,
      customerName,
      promiseDate: tmrIso,
      note: 'Grahak ne bola: Kal payment karenge',
      status: 'PENDING',
    });

    setPromiseSent(true);
  };

  const upiUrl = `upi://pay?pa=${profile.upiId}&pn=${encodeURIComponent(
    profile.shopName
  )}&am=${ledger.balance}&cu=INR&tn=Kirana%20Khata%20Payment`;

  const handleConfirmDispute = () => {
    if (!activeDisputeTxId) return;

    raiseDispute({
      transactionId: activeDisputeTxId,
      customerId,
      customerName,
      reason: selectedReason,
      status: 'OPEN',
      note: customDisputeText,
    });

    setActiveDisputeTxId(null);
    setCustomDisputeText('');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Customer Mode Header */}
      <View style={styles.heroShopCard}>
        <View style={styles.shopRow}>
          <View style={styles.shopIcon}>
            <Store size={22} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.shopName}>{profile.shopName}</Text>
            <Text style={styles.shopOwner}>Dukaandar: {profile.ownerName}</Text>
          </View>
        </View>

        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Aapka Kul Dena (Total Due)</Text>
          <Text
            style={[
              styles.balanceVal,
              ledger.balance > 0 ? styles.dueColor : styles.clearColor,
            ]}
          >
            {ledger.balance > 0 ? formatINR(ledger.balance) : 'All Paid ✓'}
          </Text>
        </View>

        {/* Pay via UPI & Kal Dunga Promise Buttons */}
        {ledger.balance > 0 && (
          <View style={{ gap: 8, marginTop: 14 }}>
            <TouchableOpacity
              style={styles.payUpiHeroBtn}
              onPress={() => setIsQrModalOpen(true)}
            >
              <CreditCard size={18} color="#FFFFFF" />
              <Text style={styles.payUpiText}>Pay via UPI (GPay / PhonePe / Paytm)</Text>
            </TouchableOpacity>

            {promiseSent ? (
              <View style={styles.promiseSentTag}>
                <CheckCircle size={16} color={lightColors.primary} />
                <Text style={styles.promiseSentText}>
                  ✓ Dukaandar ko bhej diya: Kal payment karenge
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.kalDungaBtn}
                onPress={handleKalDunga}
              >
                <Calendar size={18} color="#92400E" />
                <Text style={styles.kalDungaText}>🗓 Kal Dunga (Promise Date Send Karein)</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Timeline Section */}
      <Text style={styles.sectionHeader}>Aapki Khata Parchi & Transactions</Text>
      <Text style={styles.sectionSubtitle}>
        Dukaandar dwaara likhi gayi pratyek entry ko jaanchkar verify karein:
      </Text>

      {ledger.transactions.map((tx) => (
        <View key={tx.id} style={styles.txCard}>
          <View style={styles.txTop}>
            <View style={styles.txTypeWrap}>
              {tx.type === 'CREDIT' ? (
                <ArrowUpRight size={16} color="#B45309" />
              ) : (
                <ArrowDownLeft size={16} color={lightColors.primary} />
              )}
              <Text
                style={[
                  styles.txTypeText,
                  tx.type === 'CREDIT' ? styles.typeCredit : styles.typePayment,
                ]}
              >
                {tx.type === 'CREDIT' ? 'Maal Liya (Credit)' : 'Paise Diye (Payment)'}
              </Text>
            </View>

            <Text
              style={[
                styles.txAmt,
                tx.type === 'CREDIT' ? styles.amtCredit : styles.amtPayment,
              ]}
            >
              {tx.type === 'CREDIT' ? '+' : '−'}
              {formatINR(tx.amount)}
            </Text>
          </View>

          <Text style={styles.txDetails}>
            {tx.note || 'Kirana Maal'} • Tareekh: {tx.date}
          </Text>

          {/* Customer Acknowledgement / Dispute Row */}
          <View style={styles.ackRow}>
            {tx.confirmedByCustomer ? (
              <View style={styles.verifiedTag}>
                <CheckCircle size={14} color={lightColors.primary} />
                <Text style={styles.verifiedText}>
                  Aapne Sahi Maana Hai (Confirmed ✓)
                </Text>
              </View>
            ) : (
              <View style={styles.decisionBtns}>
                <TouchableOpacity
                  style={styles.sahiBtn}
                  onPress={() => confirmCustomerAck(tx.id)}
                >
                  <CheckCircle size={14} color={lightColors.primary} />
                  <Text style={styles.sahiText}>Sahi hai ✓</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.galatBtn}
                  onPress={() => setActiveDisputeTxId(tx.id)}
                >
                  <AlertTriangle size={14} color={lightColors.danger} />
                  <Text style={styles.galatText}>Galat hai</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      ))}

      {/* Dispute Modal */}
      <Modal
        visible={!!activeDisputeTxId}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveDisputeTxId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Galat Entry Par Aapti</Text>
              <TouchableOpacity onPress={() => setActiveDisputeTxId(null)}>
                <X size={20} color={lightColors.muted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.disputePrompt}>Karan chuniye:</Text>
            {DISPUTE_REASONS.map((r, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.reasonChip,
                  selectedReason === r && styles.reasonChipActive,
                ]}
                onPress={() => setSelectedReason(r)}
              >
                <Text
                  style={[
                    styles.reasonText,
                    selectedReason === r && styles.reasonTextActive,
                  ]}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}

            <TextInput
              style={styles.disputeInput}
              placeholder="Kuch aur batana chahein to likhein..."
              value={customDisputeText}
              onChangeText={setCustomDisputeText}
            />

            <TouchableOpacity
              style={styles.submitDisputeBtn}
              onPress={handleConfirmDispute}
            >
              <Text style={styles.submitDisputeText}>Send to Dukaandar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* UPI QR Modal */}
      <Modal
        visible={isQrModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsQrModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pay {profile.shopName}</Text>
              <TouchableOpacity onPress={() => setIsQrModalOpen(false)}>
                <X size={20} color={lightColors.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.qrCodeWrapper}>
              <QRCode value={upiUrl} size={160} />
            </View>

            <Text style={styles.qrAmt}>{formatINR(ledger.balance)}</Text>
            <Text style={styles.qrUpiId}>UPI ID: {profile.upiId}</Text>
            <Text style={styles.qrHelp}>
              Scan using any UPI app (Google Pay, PhonePe, Paytm, BHIM)
            </Text>

            <TouchableOpacity
              style={styles.openUpiBtn}
              onPress={() => Linking.openURL(upiUrl).catch(() => {})}
            >
              <Text style={styles.openUpiText}>Open UPI App Directly</Text>
            </TouchableOpacity>
          </View>
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
  heroShopCard: {
    backgroundColor: lightColors.surface,
    borderRadius: layout.cardRadius,
    padding: 18,
    borderWidth: 1,
    borderColor: lightColors.border,
    marginBottom: 20,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  shopIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: lightColors.info,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  shopOwner: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
  },
  balanceSection: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: lightColors.surfaceSubtle,
    borderRadius: layout.cardRadius,
    marginBottom: 14,
  },
  balanceLabel: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    fontWeight: typography.weights.medium,
  },
  balanceVal: {
    fontSize: 32,
    fontWeight: typography.weights.black,
    marginVertical: 2,
  },
  dueColor: {
    color: '#B45309',
  },
  clearColor: {
    color: lightColors.primary,
  },
  payUpiHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: lightColors.primary,
    borderRadius: layout.buttonRadius,
    paddingVertical: 14,
    minHeight: layout.minTapTarget,
  },
  payUpiText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
  },
  sectionHeader: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    marginBottom: 12,
  },
  txCard: {
    backgroundColor: lightColors.surface,
    borderRadius: layout.cardRadius,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  txTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txTypeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txTypeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  typeCredit: {
    color: '#B45309',
  },
  typePayment: {
    color: lightColors.primary,
  },
  txAmt: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
  },
  amtCredit: {
    color: '#B45309',
  },
  amtPayment: {
    color: lightColors.primary,
  },
  txDetails: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    marginVertical: 6,
  },
  ackRow: {
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
    paddingTop: 10,
    marginTop: 4,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedText: {
    fontSize: typography.sizes.xs,
    color: lightColors.primary,
    fontWeight: typography.weights.semibold,
  },
  decisionBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  sahiBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: lightColors.primarySoft,
    paddingVertical: 8,
    borderRadius: layout.buttonRadius,
    minHeight: layout.minTapTarget,
  },
  sahiText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: lightColors.primary,
  },
  galatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: lightColors.dangerSoft,
    paddingVertical: 8,
    borderRadius: layout.buttonRadius,
    minHeight: layout.minTapTarget,
  },
  galatText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: lightColors.danger,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 18, 32, 0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: lightColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  qrSheet: {
    backgroundColor: lightColors.surface,
    borderRadius: layout.cardRadius,
    margin: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  disputePrompt: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: lightColors.muted,
    marginBottom: 10,
  },
  reasonChip: {
    padding: 10,
    borderRadius: layout.inputRadius,
    backgroundColor: lightColors.surfaceSubtle,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  reasonChipActive: {
    borderColor: lightColors.danger,
    backgroundColor: lightColors.dangerSoft,
  },
  reasonText: {
    fontSize: typography.sizes.sm,
    color: lightColors.text,
  },
  reasonTextActive: {
    color: lightColors.danger,
    fontWeight: typography.weights.bold,
  },
  disputeInput: {
    backgroundColor: lightColors.surfaceSubtle,
    borderRadius: layout.inputRadius,
    padding: 10,
    fontSize: typography.sizes.sm,
    color: lightColors.text,
    borderWidth: 1,
    borderColor: lightColors.border,
    marginVertical: 10,
  },
  submitDisputeBtn: {
    backgroundColor: lightColors.danger,
    borderRadius: layout.buttonRadius,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    minHeight: layout.minTapTarget,
    justifyContent: 'center',
  },
  submitDisputeText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
  },
  qrCodeWrapper: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: lightColors.border,
    marginVertical: 14,
  },
  qrAmt: {
    fontSize: 26,
    fontWeight: typography.weights.black,
    color: '#B45309',
    marginBottom: 4,
  },
  qrUpiId: {
    fontSize: typography.sizes.sm,
    color: lightColors.text,
    fontWeight: typography.weights.semibold,
  },
  qrHelp: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    textAlign: 'center',
    marginVertical: 10,
  },
  openUpiBtn: {
    backgroundColor: lightColors.primary,
    borderRadius: layout.buttonRadius,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 6,
    minHeight: layout.minTapTarget,
    justifyContent: 'center',
  },
  openUpiText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  kalDungaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: layout.buttonRadius,
    paddingVertical: 12,
    minHeight: layout.minTapTarget,
  },
  kalDungaText: {
    color: '#92400E',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  promiseSentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: lightColors.primarySoft,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: layout.buttonRadius,
    borderWidth: 1,
    borderColor: lightColors.primary,
  },
  promiseSentText: {
    color: lightColors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
});

