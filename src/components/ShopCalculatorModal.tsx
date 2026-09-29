import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';
import { formatINR } from '../core/ledger/ledgerMath';
import { Calculator, X, Delete, ArrowRight, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export const ShopCalculatorModal: React.FC = () => {
  const {
    isCalculatorOpen,
    setIsCalculatorOpen,
    setIsManualEntryOpen,
    setActiveParsedEntry,
  } = useAppStore();

  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');

  if (!isCalculatorOpen) return null;

  const handlePress = (val: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    if (val === 'C') {
      setExpression('');
      setResult('0');
      return;
    }

    if (val === 'DEL') {
      const nextExp = expression.slice(0, -1);
      setExpression(nextExp);
      computeLive(nextExp);
      return;
    }

    if (val === '=') {
      computeFinal();
      return;
    }

    const nextExp = expression + val;
    setExpression(nextExp);
    computeLive(nextExp);
  };

  const computeLive = (exp: string) => {
    try {
      // Clean safe math expression (only digits, +, -, *, /, .)
      const sanitized = exp.replace(/×/g, '*').replace(/÷/g, '/');
      if (/^[0-9+\-*/. ]+$/.test(sanitized)) {
        // Evaluate if doesn't end with an operator
        if (!/[+\-*/.]$/.test(sanitized.trim())) {
          // eslint-disable-next-line no-eval
          const val = Function(`'use strict'; return (${sanitized})`)();
          if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
            setResult(Math.round(val * 100) / 100 + '');
          }
        }
      }
    } catch (e) {
      // Safe fallback
    }
  };

  const computeFinal = () => {
    try {
      const sanitized = expression.replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-eval
      const val = Function(`'use strict'; return (${sanitized})`)();
      if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
        const rounded = Math.round(val * 100) / 100;
        setResult(rounded.toString());
        setExpression(rounded.toString());
      }
    } catch (e) {}
  };

  const handleUseAmount = () => {
    const amt = parseFloat(result) || parseFloat(expression) || 0;
    if (amt <= 0) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}

    setIsCalculatorOpen(false);
    // Pre-fill manual entry with this calculated amount
    setIsManualEntryOpen(true);
  };

  const buttons = [
    ['C', 'DEL', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '−'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  return (
    <Modal
      visible={isCalculatorOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setIsCalculatorOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Calculator size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.title}>Dukaan Calculator</Text>
                <Text style={styles.sub}>Quick Counter Hisaab</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setIsCalculatorOpen(false)}
              style={styles.closeBtn}
            >
              <X size={20} color={lightColors.muted} />
            </TouchableOpacity>
          </View>

          {/* Calculator Tape Display */}
          <View style={styles.displayArea}>
            <Text style={styles.expressionText}>
              {expression || '0'}
            </Text>
            <Text style={styles.resultText}>
              = {formatINR(parseFloat(result) || 0)}
            </Text>
          </View>

          {/* Keypad */}
          <View style={styles.keypad}>
            {buttons.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.row}>
                {row.map((btn) => {
                  const isOp = ['÷', '×', '−', '+', '='].includes(btn);
                  const isAction = ['C', 'DEL'].includes(btn);
                  const isEquals = btn === '=';

                  return (
                    <TouchableOpacity
                      key={btn}
                      style={[
                        styles.key,
                        isOp && styles.keyOp,
                        isAction && styles.keyAction,
                        isEquals && styles.keyEquals,
                        btn === '0' && { flex: 2 },
                        btn === 'C' && { flex: 1.5 },
                        btn === 'DEL' && { flex: 1.5 },
                      ]}
                      onPress={() => handlePress(btn)}
                    >
                      <Text
                        style={[
                          styles.keyText,
                          isOp && styles.keyOpText,
                          isAction && styles.keyActionText,
                          isEquals && styles.keyEqualsText,
                        ]}
                      >
                        {btn}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Quick "Use this amount" action */}
          <TouchableOpacity
            style={[
              styles.useAmountBtn,
              (parseFloat(result) <= 0 && parseFloat(expression) <= 0) &&
                styles.btnDisabled,
            ]}
            disabled={parseFloat(result) <= 0 && parseFloat(expression) <= 0}
            onPress={handleUseAmount}
          >
            <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.useAmountText}>
              Parchi Mein Jodein ({formatINR(parseFloat(result) || 0)})
            </Text>
          </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
  displayArea: {
    backgroundColor: lightColors.background,
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: layout.cardRadius,
    padding: 14,
    marginBottom: 14,
    alignItems: 'flex-end',
  },
  expressionText: {
    fontSize: 18,
    color: lightColors.muted,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    minHeight: 24,
  },
  resultText: {
    fontSize: 32,
    fontWeight: typography.weights.bold,
    color: lightColors.primary,
    marginTop: 4,
  },
  keypad: {
    gap: 8,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  key: {
    flex: 1,
    height: 52,
    backgroundColor: lightColors.surfaceSubtle,
    borderRadius: layout.inputRadius,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  keyText: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  keyOp: {
    backgroundColor: lightColors.primarySoft,
    borderColor: 'rgba(22, 163, 74, 0.3)',
  },
  keyOpText: {
    color: lightColors.primary,
    fontSize: 24,
  },
  keyAction: {
    backgroundColor: lightColors.dangerSoft,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  keyActionText: {
    color: lightColors.danger,
    fontSize: 16,
    fontWeight: typography.weights.bold,
  },
  keyEquals: {
    backgroundColor: lightColors.primary,
    borderColor: lightColors.primary,
  },
  keyEqualsText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  useAmountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: lightColors.primary,
    borderRadius: layout.buttonRadius,
    paddingVertical: 14,
    minHeight: layout.minTapTarget,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  useAmountText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
  },
});
