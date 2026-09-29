import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { ParsedEntry } from '../core/parser/ParserService';
import { formatINR } from '../core/ledger/ledgerMath';
import {
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CreditCard,
  Package,
  CheckCircle,
  Edit2,
  AlertTriangle,
  Receipt,
} from 'lucide-react-native';

interface UnderstandingCardProps {
  entry: ParsedEntry;
  onConfirm: (modifiedEntry: ParsedEntry) => void;
  onCancel: () => void;
  knownCustomerNames: string[];
}

export const UnderstandingCard: React.FC<UnderstandingCardProps> = ({
  entry,
  onConfirm,
  onCancel,
  knownCustomerNames,
}) => {
  const [customerName, setCustomerName] = useState(entry.customerRef);
  const [amount, setAmount] = useState(entry.amount.toString());
  const [type, setType] = useState<'CREDIT' | 'PAYMENT'>(
    entry.type === 'UNKNOWN' ? 'CREDIT' : entry.type
  );
  const [method, setMethod] = useState<'cash' | 'upi' | 'unspecified'>(
    entry.method
  );
  const [isEditing, setIsEditing] = useState(false);

  const isCustomerKnown = knownCustomerNames.some(
    (k) => k.toLowerCase() === customerName.toLowerCase()
  );

  const parsedAmountNum = parseFloat(amount) || 0;
  const hasValidAmount = parsedAmountNum > 0;

  const handleSave = () => {
    if (!hasValidAmount) return;

    onConfirm({
      ...entry,
      customerRef: customerName.trim(),
      amount: parsedAmountNum,
      type,
      method,
    });
  };

  return (
    <View style={styles.card}>
      {/* Parchi Header */}
      <View style={styles.aiBadgeRow}>
        <View style={styles.aiChip}>
          <Receipt size={14} color={lightColors.primary} />
          <Text style={styles.aiChipText}>Parchi Ki Jaanch (Entry Review)</Text>
        </View>
        <Text style={styles.confidenceText}>
          Khate mein jodne se pehle dekhein
        </Text>
      </View>

      {/* Primary Transaction Highlights */}
      <View style={styles.mainDetails}>
        {/* Customer Name */}
        <View style={styles.rowItem}>
          <Text style={styles.fieldLabel}>Customer</Text>
          {isEditing ? (
            <TextInput
              style={styles.inlineInput}
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Customer name"
            />
          ) : (
            <View style={styles.inlineDisplayRow}>
              <Text style={styles.customerValue}>{customerName}</Text>
              {!isCustomerKnown && (
                <View style={styles.newCustTag}>
                  <Text style={styles.newCustTagText}>New</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Transaction Type & Amount */}
        <View style={styles.amountTypeRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Type</Text>
            {isEditing ? (
              <View style={styles.typeToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    type === 'CREDIT' && styles.typeBtnCreditActive,
                  ]}
                  onPress={() => setType('CREDIT')}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      type === 'CREDIT' && styles.typeBtnTextCredit,
                    ]}
                  >
                    + Credit (उधार)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    type === 'PAYMENT' && styles.typeBtnPaymentActive,
                  ]}
                  onPress={() => setType('PAYMENT')}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      type === 'PAYMENT' && styles.typeBtnTextPayment,
                    ]}
                  >
                    − Payment (जमा)
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={[
                  styles.typeBadge,
                  type === 'CREDIT'
                    ? styles.creditTypeBadge
                    : styles.paymentTypeBadge,
                ]}
              >
                {type === 'CREDIT' ? (
                  <ArrowUpRight size={14} color="#172033" />
                ) : (
                  <ArrowDownLeft size={14} color={lightColors.primary} />
                )}
                <Text
                  style={[
                    styles.typeBadgeText,
                    type === 'CREDIT'
                      ? styles.creditBadgeText
                      : styles.paymentBadgeText,
                  ]}
                >
                  {type === 'CREDIT' ? 'Credit / Udhaar' : 'Payment / Jama'}
                </Text>
              </View>
            )}
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.fieldLabel}>Amount</Text>
            {isEditing ? (
              <TextInput
                style={[styles.inlineInput, styles.amountInput]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            ) : (
              <Text
                style={[
                  styles.amountValue,
                  type === 'CREDIT' ? styles.creditAmount : styles.paymentAmount,
                ]}
              >
                {type === 'CREDIT' ? '+' : '−'}
                {formatINR(parsedAmountNum)}
              </Text>
            )}
          </View>
        </View>

        {/* Date & Payment Method */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Calendar size={14} color={lightColors.muted} />
            <Text style={styles.metaText}>{entry.date || 'Today'}</Text>
          </View>
          <View style={styles.metaItem}>
            <CreditCard size={14} color={lightColors.muted} />
            <Text style={styles.metaText}>
              {method === 'cash' ? 'Cash' : method === 'upi' ? 'UPI' : 'Not specified'}
            </Text>
          </View>
        </View>

        {/* Inventory & Bill Impact Notification */}
        {entry.items && entry.items.length > 0 && (
          <View style={styles.inventoryImpactBox}>
            <View style={styles.impactHeader}>
              <Package size={14} color={lightColors.primary} />
              <Text style={styles.impactTitle}>Stock Impact</Text>
            </View>
            <View style={styles.itemsPillRow}>
              {entry.items.map((it, idx) => (
                <View key={idx} style={styles.itemPill}>
                  <Text style={styles.itemPillText}>
                    {it.name} −{it.qty} {it.unit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {type === 'CREDIT' && (
          <View style={styles.billNotice}>
            <Receipt size={14} color={lightColors.info} />
            <Text style={styles.billNoticeText}>
              Sequential Bill (HB-xxxx) will be created automatically
            </Text>
          </View>
        )}

        {/* Ambiguities / Warnings */}
        {(!hasValidAmount || entry.ambiguities.length > 0) && (
          <View style={styles.warningBox}>
            <AlertTriangle size={15} color={lightColors.accent} />
            <Text style={styles.warningText}>
              {!hasValidAmount
                ? 'Amount is missing or 0. Please specify.'
                : 'Please verify unclear details before saving.'}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onCancel}
        >
          <Text style={styles.cancelBtnText}>Radd Karein</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Edit2 size={15} color={lightColors.text} />
          <Text style={styles.editBtnText}>
            {isEditing ? 'Done' : 'Edit'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.confirmBtn,
            !hasValidAmount && styles.confirmBtnDisabled,
          ]}
          onPress={handleSave}
          disabled={!hasValidAmount}
        >
          <CheckCircle size={16} color="#FFFFFF" />
          <Text style={styles.confirmBtnText}>Haan, Likhein</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: lightColors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: 1.5,
    borderColor: lightColors.info,
    padding: 16,
    marginVertical: 12,
    elevation: 4,
    shadowColor: lightColors.info,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  aiBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
  },
  aiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: lightColors.infoSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: layout.pillRadius,
  },
  aiChipText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: lightColors.info,
  },
  confidenceText: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    fontWeight: typography.weights.medium,
  },
  mainDetails: {
    gap: 12,
  },
  rowItem: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    fontWeight: typography.weights.medium,
    textTransform: 'uppercase',
  },
  inlineDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerValue: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  newCustTag: {
    backgroundColor: lightColors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: layout.pillRadius,
  },
  newCustTagText: {
    fontSize: typography.sizes.xs,
    color: '#172033',
    fontWeight: typography.weights.semibold,
  },
  amountTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: layout.pillRadius,
    marginTop: 4,
  },
  creditTypeBadge: {
    backgroundColor: lightColors.accentSoft,
  },
  paymentTypeBadge: {
    backgroundColor: lightColors.primarySoft,
  },
  typeBadgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  creditBadgeText: {
    color: '#172033',
  },
  paymentBadgeText: {
    color: lightColors.primary,
  },
  amountValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.black,
  },
  creditAmount: {
    color: '#B45309',
  },
  paymentAmount: {
    color: lightColors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: typography.sizes.sm,
    color: lightColors.muted,
  },
  inventoryImpactBox: {
    backgroundColor: lightColors.surfaceSubtle,
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  impactTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: lightColors.text,
  },
  itemsPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  itemPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: layout.pillRadius,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  itemPillText: {
    fontSize: typography.sizes.xs,
    color: lightColors.text,
    fontWeight: typography.weights.medium,
  },
  billNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: lightColors.infoSoft,
    padding: 8,
    borderRadius: 8,
  },
  billNoticeText: {
    fontSize: typography.sizes.xs,
    color: lightColors.info,
    fontWeight: typography.weights.medium,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: lightColors.accentSoft,
    padding: 10,
    borderRadius: 8,
  },
  warningText: {
    fontSize: typography.sizes.xs,
    color: '#172033',
    fontWeight: typography.weights.medium,
  },
  inlineInput: {
    backgroundColor: lightColors.surfaceSubtle,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: typography.sizes.body,
    color: lightColors.text,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  amountInput: {
    minWidth: 100,
    textAlign: 'right',
  },
  typeToggleRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  typeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: layout.pillRadius,
    backgroundColor: lightColors.surfaceSubtle,
  },
  typeBtnCreditActive: {
    backgroundColor: lightColors.accent,
  },
  typeBtnPaymentActive: {
    backgroundColor: lightColors.primary,
  },
  typeBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: lightColors.muted,
  },
  typeBtnTextCredit: {
    color: '#172033',
  },
  typeBtnTextPayment: {
    color: '#FFFFFF',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: layout.buttonRadius,
    backgroundColor: lightColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: lightColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.minTapTarget,
  },
  cancelBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: lightColors.muted,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: layout.buttonRadius,
    backgroundColor: lightColors.surfaceSubtle,
    minHeight: layout.minTapTarget,
  },
  editBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: lightColors.text,
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: lightColors.primary,
    borderRadius: layout.buttonRadius,
    paddingVertical: 12,
    minHeight: layout.minTapTarget,
    elevation: 2,
  },
  confirmBtnDisabled: {
    backgroundColor: lightColors.muted,
    opacity: 0.5,
  },
  confirmBtnText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
});
