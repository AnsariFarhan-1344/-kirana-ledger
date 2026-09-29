import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';
import { formatINR } from '../core/ledger/ledgerMath';
import { findPotentialDuplicateCustomers } from '../core/ledger/customerHelpers';
import { Customer } from '../db/schema';
import {
  PlusCircle,
  X,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  Smartphone,
  FileText,
  Check,
  AlertCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

export const ManualEntryModal: React.FC = () => {
  const {
    isManualEntryOpen,
    setIsManualEntryOpen,
    customers,
    addCustomer,
    commitTransaction,
  } = useAppStore();

  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'CREDIT' | 'PAYMENT'>('CREDIT');
  const [method, setMethod] = useState<'cash' | 'upi'>('cash');
  const [note, setNote] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fuzzyDuplicate, setFuzzyDuplicate] = useState<Customer | null>(null);

  if (!isManualEntryOpen) return null;

  const handleSelectCustomer = (name: string) => {
    setCustomerName(name);
    setValidationError(null);
    setFuzzyDuplicate(null);
  };

  const executeCommit = (cust: Customer, cleanAmt: number) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}

    commitTransaction({
      customerId: cust.id,
      customerName: cust.name,
      amount: cleanAmt,
      type,
      method,
      date: new Date().toISOString().split('T')[0],
      note: note.trim() || (type === 'CREDIT' ? 'Kirana सामान' : 'Payment received'),
      source: 'manual',
    });

    // Reset and close
    setCustomerName('');
    setAmount('');
    setNote('');
    setValidationError(null);
    setFuzzyDuplicate(null);
    setIsManualEntryOpen(false);
  };

  const handleSave = () => {
    const cleanName = customerName.trim();
    const cleanAmt = parseFloat(amount);

    if (!cleanName) {
      setValidationError('Kripya customer ka naam likhein ya chunein');
      return;
    }

    if (!cleanAmt || isNaN(cleanAmt) || cleanAmt <= 0) {
      setValidationError('Kripya valid rupaye darj karein (₹0 se zyada)');
      return;
    }

    // Exact match
    const exactCust = customers.find(
      (c) => c.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (exactCust) {
      executeCommit(exactCust, cleanAmt);
      return;
    }

    // Check fuzzy duplicate before creating
    const duplicate = findPotentialDuplicateCustomers(cleanName, customers);
    if (duplicate && !fuzzyDuplicate) {
      setFuzzyDuplicate(duplicate);
      return;
    }

    // New customer
    const newCust = addCustomer({
      name: cleanName,
      phone: '9820100000',
      language: 'Hinglish',
      creditLimit: 5000,
      aliases: [cleanName],
    });

    executeCommit(newCust, cleanAmt);
  };

  return (
    <Modal
      visible={isManualEntryOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setIsManualEntryOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <PlusCircle size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.title}>Naya Hisaab (Add Entry)</Text>
                <Text style={styles.sub}>Bahi-Khata entry darj karein</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setIsManualEntryOpen(false)}
              style={styles.closeBtn}
            >
              <X size={20} color={lightColors.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Validation alert */}
            {validationError && (
              <View style={styles.errorAlert}>
                <Text style={styles.errorAlertText}>⚠️ {validationError}</Text>
              </View>
            )}

            {/* 1. Customer Selection */}
            <Text style={styles.sectionLabel}>Grahak Ka Naam (Customer)</Text>
            <View style={styles.inputRow}>
              <User size={18} color={lightColors.muted} />
              <TextInput
                style={styles.textInput}
                value={customerName}
                onChangeText={(val) => {
                  setCustomerName(val);
                  setValidationError(null);
                }}
                placeholder="Customer ka naam likhein..."
                placeholderTextColor={lightColors.muted}
              />
            </View>

            {/* Quick Customer Suggestions */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsScroll}
            >
              {customers.slice(0, 6).map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.custChip,
                    customerName.toLowerCase() === c.name.toLowerCase() &&
                      styles.custChipActive,
                  ]}
                  onPress={() => handleSelectCustomer(c.name)}
                >
                  <Text
                    style={[
                      styles.custChipText,
                      customerName.toLowerCase() === c.name.toLowerCase() &&
                        styles.custChipTextActive,
                    ]}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Duplicate Customer Prompt */}
            {fuzzyDuplicate && (
              <View style={styles.duplicateBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={16} color="#B45309" />
                  <Text style={styles.duplicateTitle}>Milta-julta grahak pehle se hai:</Text>
                </View>
                <Text style={styles.duplicateQuestion}>
                  Kya ye "{fuzzyDuplicate.name}" hain?
                </Text>
                <View style={styles.duplicateBtnRow}>
                  <TouchableOpacity
                    style={styles.duplicateConfirmBtn}
                    onPress={() => {
                      const cleanAmt = parseFloat(amount) || 0;
                      executeCommit(fuzzyDuplicate, cleanAmt);
                    }}
                  >
                    <Check size={14} color="#FFFFFF" />
                    <Text style={styles.duplicateConfirmText}>Haan, wahi hai</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.duplicateNewBtn}
                    onPress={() => {
                      const cleanAmt = parseFloat(amount) || 0;
                      const cleanName = customerName.trim();
                      const newCust = addCustomer({
                        name: cleanName,
                        phone: '9820100000',
                        language: 'Hinglish',
                        creditLimit: 5000,
                        aliases: [cleanName],
                      });
                      executeCommit(newCust, cleanAmt);
                    }}
                  >
                    <Text style={styles.duplicateNewText}>Nahi, naya customer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 2. Amount Input */}
            <Text style={styles.sectionLabel}>Rupaye (Amount)</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.rupeePrefix}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={(val) => {
                  setAmount(val);
                  setValidationError(null);
                }}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor={lightColors.muted}
              />
            </View>

            {/* Quick Amount Chips */}
            <View style={styles.quickAmtsRow}>
              {QUICK_AMOUNTS.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[
                    styles.quickAmtChip,
                    amount === amt.toString() && styles.quickAmtChipActive,
                  ]}
                  onPress={() => {
                    setAmount(amt.toString());
                    setValidationError(null);
                  }}
                >
                  <Text
                    style={[
                      styles.quickAmtText,
                      amount === amt.toString() && styles.quickAmtTextActive,
                    ]}
                  >
                    ₹{amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 3. Transaction Type (Credit vs Payment) */}
            <Text style={styles.sectionLabel}>Len-Den Type</Text>
            <View style={styles.typeToggleRow}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  type === 'CREDIT' && styles.typeBtnCreditActive,
                ]}
                onPress={() => setType('CREDIT')}
              >
                <ArrowUpRight
                  size={18}
                  color={type === 'CREDIT' ? '#991B1B' : lightColors.muted}
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    type === 'CREDIT' && styles.typeBtnTextCredit,
                  ]}
                >
                  Udhaar Diya (Credit)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  type === 'PAYMENT' && styles.typeBtnPaymentActive,
                ]}
                onPress={() => setType('PAYMENT')}
              >
                <ArrowDownLeft
                  size={18}
                  color={type === 'PAYMENT' ? lightColors.primary : lightColors.muted}
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    type === 'PAYMENT' && styles.typeBtnTextPayment,
                  ]}
                >
                  Paisa Aaya (Jama)
                </Text>
              </TouchableOpacity>
            </View>

            {/* 4. Payment Mode (Cash vs UPI) */}
            <Text style={styles.sectionLabel}>Madhyam (Payment Mode)</Text>
            <View style={styles.modeToggleRow}>
              <TouchableOpacity
                style={[
                  styles.modeBtn,
                  method === 'cash' && styles.modeBtnActive,
                ]}
                onPress={() => setMethod('cash')}
              >
                <Banknote
                  size={16}
                  color={method === 'cash' ? lightColors.primary : lightColors.muted}
                />
                <Text
                  style={[
                    styles.modeBtnText,
                    method === 'cash' && styles.modeBtnTextActive,
                  ]}
                >
                  नकद (Cash)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeBtn,
                  method === 'upi' && styles.modeBtnActive,
                ]}
                onPress={() => setMethod('upi')}
              >
                <Smartphone
                  size={16}
                  color={method === 'upi' ? lightColors.primary : lightColors.muted}
                />
                <Text
                  style={[
                    styles.modeBtnText,
                    method === 'upi' && styles.modeBtnTextActive,
                  ]}
                >
                  UPI / Online
                </Text>
              </TouchableOpacity>
            </View>

            {/* 5. Notes / Items */}
            <Text style={styles.sectionLabel}>Samaan / Note (Optional)</Text>
            <View style={styles.inputRow}>
              <FileText size={18} color={lightColors.muted} />
              <TextInput
                style={styles.textInput}
                value={note}
                onChangeText={setNote}
                placeholder="Jaise: 2 kilo cheeni, tel, etc."
                placeholderTextColor={lightColors.muted}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
            >
              <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.saveBtnText}>
                {type === 'CREDIT' ? 'Khate Mein Udhaar Likh' : 'Paisa Jama Karein'}
              </Text>
            </TouchableOpacity>
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
  dialog: {
    backgroundColor: lightColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: lightColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  sub: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: lightColors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorAlert: {
    backgroundColor: lightColors.dangerSoft,
    padding: 10,
    borderRadius: layout.buttonRadius,
    marginBottom: 12,
  },
  errorAlertText: {
    fontSize: typography.sizes.xs,
    color: lightColors.danger,
    fontWeight: typography.weights.semibold,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: typography.weights.semibold,
    color: lightColors.muted,
    marginBottom: 6,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: lightColors.background,
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: layout.inputRadius,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    fontSize: typography.sizes.body,
    color: lightColors.text,
  },
  suggestionsScroll: {
    gap: 8,
    marginTop: 8,
    marginBottom: 10,
  },
  custChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: layout.pillRadius,
    backgroundColor: lightColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  custChipActive: {
    backgroundColor: lightColors.primarySoft,
    borderColor: lightColors.primary,
  },
  custChipText: {
    fontSize: typography.sizes.sm,
    color: lightColors.text,
    fontWeight: typography.weights.medium,
  },
  custChipTextActive: {
    color: lightColors.primary,
    fontWeight: typography.weights.bold,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.background,
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: layout.inputRadius,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  rupeePrefix: {
    fontSize: 26,
    fontWeight: typography.weights.bold,
    color: lightColors.primary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  quickAmtsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 10,
  },
  quickAmtChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: layout.pillRadius,
    backgroundColor: lightColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  quickAmtChipActive: {
    backgroundColor: lightColors.primarySoft,
    borderColor: lightColors.primary,
  },
  quickAmtText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: lightColors.text,
  },
  quickAmtTextActive: {
    color: lightColors.primary,
  },
  typeToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: layout.buttonRadius,
    backgroundColor: lightColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  typeBtnCreditActive: {
    backgroundColor: lightColors.dangerSoft,
    borderColor: lightColors.danger,
  },
  typeBtnPaymentActive: {
    backgroundColor: lightColors.primarySoft,
    borderColor: lightColors.primary,
  },
  typeBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: lightColors.muted,
  },
  typeBtnTextCredit: {
    color: '#991B1B',
    fontWeight: typography.weights.bold,
  },
  typeBtnTextPayment: {
    color: lightColors.primary,
    fontWeight: typography.weights.bold,
  },
  modeToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: layout.buttonRadius,
    backgroundColor: lightColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  modeBtnActive: {
    backgroundColor: lightColors.primarySoft,
    borderColor: lightColors.primary,
  },
  modeBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: lightColors.muted,
  },
  modeBtnTextActive: {
    color: lightColors.primary,
    fontWeight: typography.weights.bold,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: lightColors.primary,
    borderRadius: layout.buttonRadius,
    paddingVertical: 14,
    marginTop: 18,
    minHeight: layout.minTapTarget,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
  },
  duplicateBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: layout.cardRadius,
    padding: 12,
    marginVertical: 10,
  },
  duplicateTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#92400E',
  },
  duplicateQuestion: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
    marginVertical: 6,
  },
  duplicateBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  duplicateConfirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: lightColors.primary,
    paddingVertical: 10,
    borderRadius: layout.buttonRadius,
  },
  duplicateConfirmText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  duplicateNewBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: lightColors.border,
    paddingVertical: 10,
    borderRadius: layout.buttonRadius,
  },
  duplicateNewText: {
    color: lightColors.text,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
});
