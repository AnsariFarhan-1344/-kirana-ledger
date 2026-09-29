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
import { parseSentenceToEntry } from '../core/parser/ParserService';
import { formatINR } from '../core/ledger/ledgerMath';
import {
  Mic,
  X,
  Layers,
  CheckCheck,
  Check,
  Trash2,
  Send,
  Zap,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export const ServingModeModal: React.FC = () => {
  const {
    isServingModeOpen,
    setServingMode,
    servingDrafts,
    addServingDraft,
    confirmServingDraft,
    clearServingDrafts,
  } = useAppStore();

  const [inputVal, setInputVal] = useState('');

  if (!isServingModeOpen) return null;

  const handleQuickAdd = (sentence?: string) => {
    const text = sentence || inputVal;
    if (!text.trim()) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    const parsed = parseSentenceToEntry(text);
    if (parsed.entries && parsed.entries.length > 0) {
      parsed.entries.forEach((e) => addServingDraft(e));
    }
    setInputVal('');
  };

  const handleConfirmAll = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}

    // Confirm all drafts iteratively
    while (servingDrafts.length > 0) {
      confirmServingDraft(0);
    }
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      onRequestClose={() => setServingMode(false)}
    >
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Zap size={22} color={lightColors.primary} />
            <View>
              <Text style={styles.headerTitle}>Serving Mode (Rush Hour)</Text>
              <Text style={styles.headerSubtitle}>
                Hands-free voice queue. Entries save as drafts.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setServingMode(false)}
          >
            <X size={20} color={lightColors.text} />
          </TouchableOpacity>
        </View>

        {/* Giant Centered Mic */}
        <View style={styles.micSection}>
          <TouchableOpacity
            style={styles.giantMicBtn}
            onPress={() =>
              handleQuickAdd('Ramesh ne 300 rupaye ka atta liya')
            }
            activeOpacity={0.8}
          >
            <Mic size={54} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.micHint}>
            Tap mic to record voice entry or type below
          </Text>
        </View>

        {/* Quick text input */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.inputField}
            placeholder="Jaise: 'Amit 250 cash de gaya'..."
            placeholderTextColor={lightColors.muted}
            value={inputVal}
            onChangeText={setInputVal}
            onSubmitEditing={() => handleQuickAdd()}
          />
          <TouchableOpacity
            style={styles.addDraftBtn}
            onPress={() => handleQuickAdd()}
          >
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Drafts Queue Section */}
        <View style={styles.queueHeader}>
          <View style={styles.queueTitleRow}>
            <Layers size={18} color={lightColors.text} />
            <Text style={styles.queueTitle}>
              Drafts Queue ({servingDrafts.length})
            </Text>
          </View>
          {servingDrafts.length > 0 && (
            <TouchableOpacity
              style={styles.confirmAllBtn}
              onPress={handleConfirmAll}
            >
              <CheckCheck size={16} color="#FFFFFF" />
              <Text style={styles.confirmAllText}>Confirm All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Draft List */}
        <ScrollView style={styles.draftsList}>
          {servingDrafts.length === 0 ? (
            <View style={styles.emptyDrafts}>
              <Text style={styles.emptyTitle}>No pending drafts</Text>
              <Text style={styles.emptySub}>
                Entries spoken here stay in draft until you confirm. Nothing
                touches balances or stock prematurely.
              </Text>
            </View>
          ) : (
            servingDrafts.map((draft, idx) => (
              <View key={idx} style={styles.draftCard}>
                <View style={styles.draftLeft}>
                  <Text style={styles.draftCustomer}>{draft.customerRef}</Text>
                  <View style={styles.draftTags}>
                    <Text
                      style={[
                        styles.draftType,
                        draft.type === 'CREDIT'
                          ? styles.draftCredit
                          : styles.draftPayment,
                      ]}
                    >
                      {draft.type}
                    </Text>
                    {draft.items && draft.items.length > 0 && (
                      <Text style={styles.draftItems}>
                        {draft.items.map((i) => `${i.name} (${i.qty})`).join(', ')}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.draftRight}>
                  <Text style={styles.draftAmount}>
                    {formatINR(draft.amount)}
                  </Text>
                  <TouchableOpacity
                    style={styles.confirmSingleBtn}
                    onPress={() => confirmServingDraft(idx)}
                  >
                    <Check size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
    paddingTop: Platform.OS === 'android' ? 36 : 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
    backgroundColor: lightColors.surface,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  headerSubtitle: {
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
  micSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: lightColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
  },
  giantMicBtn: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: lightColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: lightColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  micHint: {
    marginTop: 16,
    fontSize: typography.sizes.sm,
    color: lightColors.muted,
    fontWeight: typography.weights.medium,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: lightColors.surface,
    gap: 8,
  },
  inputField: {
    flex: 1,
    backgroundColor: lightColors.surfaceSubtle,
    borderRadius: layout.inputRadius,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: typography.sizes.body,
    color: lightColors.text,
  },
  addDraftBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: lightColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  queueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  queueTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  confirmAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: lightColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: layout.pillRadius,
  },
  confirmAllText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
  draftsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyDrafts: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: typography.sizes.sm,
    color: lightColors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  draftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: lightColors.surface,
    borderRadius: layout.cardRadius,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  draftLeft: {
    flex: 1,
    gap: 4,
  },
  draftCustomer: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  draftTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  draftType: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  draftCredit: {
    backgroundColor: lightColors.accentSoft,
    color: '#B45309',
  },
  draftPayment: {
    backgroundColor: lightColors.primarySoft,
    color: lightColors.primary,
  },
  draftItems: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
  },
  draftRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  draftAmount: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  confirmSingleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: lightColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
