import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';
import { Bill } from '../db/schema';
import { formatINR } from '../core/ledger/ledgerMath';
import { BRAND_NAME, TAGLINE } from '../config/brand';
import {
  Receipt,
  X,
  Share2,
  CheckCircle,
  QrCode,
  Download,
} from 'lucide-react-native';

export const ReceiptModal: React.FC = () => {
  const { activeReceiptBill, setReceiptBill, profile } = useAppStore();

  if (!activeReceiptBill) return null;

  const bill = activeReceiptBill;
  const upiUrl = `upi://pay?pa=${profile.upiId}&pn=${encodeURIComponent(
    profile.shopName
  )}&am=${bill.totalDue}&cu=INR&tn=${encodeURIComponent(bill.billNumber)}`;

  const handleShareReceipt = async () => {
    const itemsText = bill.items
      ? bill.items
          .map((i) => `  • ${i.name}: ${i.qty} ${i.unit} ${i.price ? `(₹${i.price})` : ''}`)
          .join('\n')
      : '  • Kirana Items';

    const cleanReceipt = `*${profile.shopName}*\n` +
      `_Parchi No: ${bill.billNumber}_ | Date: ${bill.date}\n` +
      `Customer: ${bill.customerName}\n` +
      `--------------------------------\n` +
      `Items:\n${itemsText}\n` +
      `--------------------------------\n` +
      `Bill Amount: ${formatINR(bill.totalAmount)}\n` +
      `Previous Due: ${formatINR(bill.previousDue)}\n` +
      `*Total Due: ${formatINR(bill.totalDue)}*\n\n` +
      `Pay via UPI: ${profile.upiId}\n` +
      `_Hisaab recorded via ${BRAND_NAME}_`;

    try {
      await Share.share({ message: cleanReceipt });
    } catch (e) {}
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent
      onRequestClose={() => setReceiptBill(null)}
    >
      <View style={styles.overlay}>
        <View style={styles.cardContainer}>
          {/* Header */}
          <View style={styles.receiptHeader}>
            <View>
              <Text style={styles.shopName}>{profile.shopName}</Text>
              <Text style={styles.shopSub}>{profile.address || 'Kirana Store'}</Text>
              <Text style={styles.billNumberBadge}>{bill.billNumber}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setReceiptBill(null)}
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.receiptBody} showsVerticalScrollIndicator={false}>
            {/* Meta */}
            <View style={styles.metaRow}>
              <View>
                <Text style={styles.metaLabel}>Grahak / Customer</Text>
                <Text style={styles.custName}>{bill.customerName}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.metaLabel}>Date</Text>
                <Text style={styles.metaVal}>{bill.date}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Items table */}
            <Text style={styles.itemsTitle}>Items (सामान)</Text>
            {bill.items && bill.items.length > 0 ? (
              bill.items.map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Text style={styles.itemName}>
                    {item.name} ({item.qty} {item.unit})
                  </Text>
                  <Text style={styles.itemPrice}>
                    {item.price ? formatINR(item.price) : '−'}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.itemRow}>
                <Text style={styles.itemName}>Kirana Groceries / Maal</Text>
                <Text style={styles.itemPrice}>{formatINR(bill.totalAmount)}</Text>
              </View>
            )}

            <View style={styles.divider} />

            {/* Totals Calculation */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Current Bill:</Text>
              <Text style={styles.totalVal}>{formatINR(bill.totalAmount)}</Text>
            </View>

            {bill.previousDue > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.subTotalLabel}>Previous Balance (Purani Baaki):</Text>
                <Text style={styles.subTotalVal}>{formatINR(bill.previousDue)}</Text>
              </View>
            )}

            <View style={styles.grandTotalBox}>
              <Text style={styles.grandLabel}>Total Outstanding (कुल बाकी):</Text>
              <Text style={styles.grandVal}>{formatINR(bill.totalDue)}</Text>
            </View>

            {/* Merchant UPI QR code for scan & pay */}
            <View style={styles.qrSection}>
              <Text style={styles.qrTitle}>Scan to Pay via Any UPI App</Text>
              <View style={styles.qrWrapper}>
                <QRCode value={upiUrl} size={130} />
              </View>
              <Text style={styles.upiIdText}>UPI ID: {profile.upiId}</Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsFooter}>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShareReceipt}
            >
              <Share2 size={18} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>Share on WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => setReceiptBill(null)}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 18, 32, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: lightColors.surface,
    borderRadius: layout.cardRadius,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  receiptHeader: {
    backgroundColor: lightColors.primary,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  shopName: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  shopSub: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  billNumberBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    color: '#FFFFFF',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: layout.pillRadius,
    marginTop: 8,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptBody: {
    padding: 18,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
  },
  custName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
    marginTop: 2,
  },
  metaVal: {
    fontSize: typography.sizes.body,
    color: lightColors.text,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: lightColors.border,
    marginVertical: 14,
  },
  itemsTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: lightColors.muted,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemName: {
    fontSize: typography.sizes.sm,
    color: lightColors.text,
  },
  itemPrice: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: lightColors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  totalLabel: {
    fontSize: typography.sizes.sm,
    color: lightColors.text,
  },
  totalVal: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  subTotalLabel: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
  },
  subTotalVal: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
  },
  grandTotalBox: {
    backgroundColor: lightColors.surfaceSubtle,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  grandLabel: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  grandVal: {
    fontSize: typography.sizes.money,
    fontWeight: typography.weights.black,
    color: '#B45309',
  },
  qrSection: {
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
  },
  qrTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: lightColors.muted,
    marginBottom: 10,
  },
  qrWrapper: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  upiIdText: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    marginTop: 8,
    fontWeight: typography.weights.medium,
  },
  actionsFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
    flexDirection: 'row',
    gap: 10,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: lightColors.primary,
    borderRadius: layout.buttonRadius,
    paddingVertical: 12,
    minHeight: layout.minTapTarget,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
  },
  doneBtn: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightColors.surfaceSubtle,
    borderRadius: layout.buttonRadius,
    minHeight: layout.minTapTarget,
  },
  doneBtnText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
    color: lightColors.text,
  },
});
