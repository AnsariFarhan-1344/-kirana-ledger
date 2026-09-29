import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';
import { formatINR } from '../core/ledger/ledgerMath';
import {
  UserPlus,
  AlertTriangle,
  HelpCircle,
  Copy,
  TrendingUp,
  PackageX,
  X,
  Check,
} from 'lucide-react-native';

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

export const SafetyModals: React.FC = () => {
  const { activeSafetyModal, setSafetyModal, addCustomer, commitTransaction } =
    useAppStore();

  const [enteredAmount, setEnteredAmount] = useState('');
  const [selectedCustId, setSelectedCustId] = useState('');

  if (!activeSafetyModal) return null;

  const { type, payload } = activeSafetyModal;
  const onClose = () => setSafetyModal(null);

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={18} color={lightColors.muted} />
          </TouchableOpacity>

          {/* 1. NEW CUSTOMER MODAL */}
          {type === 'NEW_CUSTOMER' && (
            <View style={styles.content}>
              <View style={styles.iconCircle}>
                <UserPlus size={26} color={lightColors.primary} />
              </View>
              <Text style={styles.title}>Naya Grahak (New Customer)</Text>
              <Text style={styles.desc}>
                "{payload.customerName}" is not yet in your ledger. Would you
                like to add them?
              </Text>

              <View style={styles.buttonStack}>
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => {
                    const newC = addCustomer({
                      name: payload.customerName,
                      phone: '9820100000',
                      language: 'Hinglish',
                      creditLimit: 5000,
                    });
                    if (payload.pendingTx) {
                      commitTransaction({
                        ...payload.pendingTx,
                        customerId: newC.id,
                        customerName: newC.name,
                      });
                    }
                    onClose();
                  }}
                >
                  <Text style={styles.primaryActionText}>
                    + Add "{payload.customerName}"
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
                  <Text style={styles.secondaryBtnText}>Choose Existing</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 2. UNCLEAR AMOUNT MODAL */}
          {type === 'UNCLEAR_AMOUNT' && (
            <View style={styles.content}>
              <View style={[styles.iconCircle, { backgroundColor: lightColors.accentSoft }]}>
                <HelpCircle size={26} color="#B45309" />
              </View>
              <Text style={styles.title}>Kitne ka tha? (Enter Amount)</Text>
              <Text style={styles.desc}>
                For {payload.customerName}: please enter the exact amount.
              </Text>

              {/* Quick Select Chips */}
              <View style={styles.chipsRow}>
                {QUICK_AMOUNTS.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={styles.amtChip}
                    onPress={() => setEnteredAmount(amt.toString())}
                  >
                    <Text style={styles.amtChipText}>₹{amt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.input}
                value={enteredAmount}
                onChangeText={setEnteredAmount}
                placeholder="₹ Amount"
                keyboardType="numeric"
                autoFocus
              />

              <TouchableOpacity
                style={[
                  styles.primaryActionBtn,
                  !enteredAmount && styles.btnDisabled,
                ]}
                disabled={!enteredAmount}
                onPress={() => {
                  const amtNum = parseFloat(enteredAmount);
                  if (amtNum > 0 && payload.onSelectAmount) {
                    payload.onSelectAmount(amtNum);
                  }
                  onClose();
                }}
              >
                <Text style={styles.primaryActionText}>Confirm Amount</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 3. UNCLEAR TYPE MODAL */}
          {type === 'UNCLEAR_TYPE' && (
            <View style={styles.content}>
              <View style={[styles.iconCircle, { backgroundColor: lightColors.accentSoft }]}>
                <HelpCircle size={26} color="#B45309" />
              </View>
              <Text style={styles.title}>Credit ya Payment?</Text>
              <Text style={styles.desc}>
                "{payload.sentence}" ke liye kya likhein?
              </Text>

              <View style={styles.buttonStack}>
                <TouchableOpacity
                  style={[styles.primaryActionBtn, { backgroundColor: lightColors.accent }]}
                  onPress={() => {
                    if (payload.onSelectType) payload.onSelectType('CREDIT');
                    onClose();
                  }}
                >
                  <Text style={[styles.primaryActionText, { color: '#172033' }]}>
                    + Credit (उधार दिया)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => {
                    if (payload.onSelectType) payload.onSelectType('PAYMENT');
                    onClose();
                  }}
                >
                  <Text style={styles.primaryActionText}>
                    − Payment (पैसे जमा हुए)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 4. DUPLICATE DETECTION MODAL */}
          {type === 'DUPLICATE' && (
            <View style={styles.content}>
              <View style={[styles.iconCircle, { backgroundColor: lightColors.accentSoft }]}>
                <Copy size={26} color="#B45309" />
              </View>
              <Text style={styles.title}>Pehle hi likha hai?</Text>
              <Text style={styles.desc}>
                A similar entry of {formatINR(payload.amount)} for{' '}
                {payload.customerName} was recorded recently. Save anyway?
              </Text>

              <View style={styles.buttonStack}>
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => {
                    if (payload.onConfirmDuplicate) payload.onConfirmDuplicate();
                    onClose();
                  }}
                >
                  <Text style={styles.primaryActionText}>Yes, Save Duplicate</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
                  <Text style={styles.secondaryBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 5. OVERPAYMENT ADVANCE MODAL */}
          {type === 'OVERPAYMENT' && (
            <View style={styles.content}>
              <View style={[styles.iconCircle, { backgroundColor: lightColors.primarySoft }]}>
                <TrendingUp size={26} color={lightColors.primary} />
              </View>
              <Text style={styles.title}>Advance Payment</Text>
              <Text style={styles.desc}>
                Payment is higher than the outstanding balance. Record{' '}
                {formatINR(payload.advanceAmount)} as advance balance?
              </Text>

              <View style={styles.buttonStack}>
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => {
                    if (payload.onConfirmAdvance) payload.onConfirmAdvance();
                    onClose();
                  }}
                >
                  <Text style={styles.primaryActionText}>
                    Yes, Keep as Advance
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
                  <Text style={styles.secondaryBtnText}>Adjust Amount</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 6. CREDIT LIMIT EXCEEDED */}
          {type === 'CREDIT_LIMIT' && (
            <View style={styles.content}>
              <View style={[styles.iconCircle, { backgroundColor: lightColors.dangerSoft }]}>
                <AlertTriangle size={26} color={lightColors.danger} />
              </View>
              <Text style={styles.title}>Credit Limit Exceeded</Text>
              <Text style={styles.desc}>
                {payload.customerName}'s balance will exceed their limit of{' '}
                {formatINR(payload.limit)}.
              </Text>

              <View style={styles.buttonStack}>
                <TouchableOpacity
                  style={[styles.primaryActionBtn, { backgroundColor: lightColors.danger }]}
                  onPress={() => {
                    if (payload.onAllowOnce) payload.onAllowOnce();
                    onClose();
                  }}
                >
                  <Text style={styles.primaryActionText}>Allow Once</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
                  <Text style={styles.secondaryBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 7. LOW / INSUFFICIENT STOCK */}
          {type === 'LOW_STOCK' && (
            <View style={styles.content}>
              <View style={[styles.iconCircle, { backgroundColor: lightColors.accentSoft }]}>
                <PackageX size={26} color="#B45309" />
              </View>
              <Text style={styles.title}>Insufficient Stock</Text>
              <Text style={styles.desc}>
                Only {payload.availableQty} {payload.unit} of {payload.productName} is
                available in shop stock (requested {payload.requestedQty}).
              </Text>

              <View style={styles.buttonStack}>
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => {
                    if (payload.onSellAvailable) payload.onSellAvailable();
                    onClose();
                  }}
                >
                  <Text style={styles.primaryActionText}>
                    Sell available {payload.availableQty} {payload.unit}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => {
                    if (payload.onContinueAnyway) payload.onContinueAnyway();
                    onClose();
                  }}
                >
                  <Text style={styles.secondaryBtnText}>Continue Anyway</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 8. INVALID INPUT / GIBBERISH */}
          {type === 'INVALID_INPUT' && (
            <View style={styles.content}>
              <View style={[styles.iconCircle, { backgroundColor: lightColors.dangerSoft }]}>
                <AlertTriangle size={26} color={lightColors.danger} />
              </View>
              <Text style={styles.title}>Hisaab Samajh Nahi Aaya</Text>
              <Text style={styles.desc}>
                {payload.message ||
                  "Kripya customer ka naam aur rupaye dono sahi se batayein. Jaise: 'Ramesh 500 udhaar'."}
              </Text>

              <View style={styles.buttonStack}>
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={onClose}
                >
                  <Text style={styles.primaryActionText}>Theek Hai (Dobara Bolein)</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  dialog: {
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
  content: {
    alignItems: 'center',
    paddingTop: 8,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: lightColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  desc: {
    fontSize: typography.sizes.sm,
    color: lightColors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 12,
  },
  amtChip: {
    backgroundColor: lightColors.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: layout.pillRadius,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  amtChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: lightColors.text,
  },
  input: {
    width: '100%',
    backgroundColor: lightColors.surfaceSubtle,
    borderRadius: layout.inputRadius,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: typography.sizes.money,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
    textAlign: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  buttonStack: {
    width: '100%',
    gap: 10,
  },
  primaryActionBtn: {
    width: '100%',
    backgroundColor: lightColors.primary,
    borderRadius: layout.buttonRadius,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.minTapTarget,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
  },
  secondaryBtn: {
    width: '100%',
    backgroundColor: lightColors.surfaceSubtle,
    borderRadius: layout.buttonRadius,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.minTapTarget,
  },
  secondaryBtnText: {
    color: lightColors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
