import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Share,
} from 'react-native';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';
import { calculateLedgerMetrics, formatINR } from '../core/ledger/ledgerMath';
import { generateReminderMessage, buildWhatsAppReminderUrl } from '../core/reminders/reminderTemplates';
import {
  Bell,
  MessageCircle,
  Copy,
  Calendar,
  Sparkles,
  ChevronRight,
  Clock,
} from 'lucide-react-native';

export const RemindersScreen: React.FC = () => {
  const { customers, transactions, promises, profile } = useAppStore();
  const metrics = calculateLedgerMetrics(customers, transactions);

  const [selectedTone, setSelectedTone] = useState<'soft' | 'normal' | 'firm'>('normal');

  // Filter customers who owe money
  const debtors = metrics.topDebtors.filter((d) => d.balance > 0);

  const handleSendReminder = (customer: any) => {
    const text = generateReminderMessage({
      shopName: profile.shopName,
      customerName: customer.name,
      amount: customer.balance,
      upiId: profile.upiId,
      language: (customer.language as any) || 'Hinglish',
      tone: selectedTone,
    });

    const url = buildWhatsAppReminderUrl(customer.phone, text);
    Linking.openURL(url).catch(() => {
      Share.share({ message: text });
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Month-start / Salary-day tip banner */}
      <View style={styles.tipBanner}>
        <Sparkles size={16} color="#B45309" />
        <Text style={styles.tipText}>
          Month-start tip: 1st se 7th tareekh salary ke din hote hain. Polite
          reminders bhejne ka sabse behtareen samay!
        </Text>
      </View>

      {/* Tone selection */}
      <View style={styles.toneSection}>
        <Text style={styles.sectionLabel}>Reminder Ki Bhasha Ka Tone:</Text>
        <View style={styles.toneRow}>
          <TouchableOpacity
            style={[styles.toneBtn, selectedTone === 'soft' && styles.toneBtnActive]}
            onPress={() => setSelectedTone('soft')}
          >
            <Text
              style={[
                styles.toneText,
                selectedTone === 'soft' && styles.toneTextActive,
              ]}
            >
              Komal (Soft)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toneBtn, selectedTone === 'normal' && styles.toneBtnActive]}
            onPress={() => setSelectedTone('normal')}
          >
            <Text
              style={[
                styles.toneText,
                selectedTone === 'normal' && styles.toneTextActive,
              ]}
            >
              Sadharan (Normal)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toneBtn, selectedTone === 'firm' && styles.toneBtnActive]}
            onPress={() => setSelectedTone('firm')}
          >
            <Text
              style={[
                styles.toneText,
                selectedTone === 'firm' && styles.toneTextActive,
              ]}
            >
              Kathor (Firm)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Promises to Pay Follow-ups */}
      {promises.length > 0 && (
        <View style={styles.promisesSection}>
          <View style={styles.promiseHeader}>
            <Clock size={16} color={lightColors.primary} />
            <Text style={styles.promiseTitle}>Vaade (Promises to Pay):</Text>
          </View>
          {promises.map((p) => (
            <View key={p.id} style={styles.promiseCard}>
              <View>
                <Text style={styles.promiseCust}>{p.customerName}</Text>
                <Text style={styles.promiseNote}>
                  "{p.note}" • Tareekh: {p.promiseDate}
                </Text>
              </View>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>{p.status}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Pending Dues Customer Reminders */}
      <Text style={styles.sectionTitle}>
        Baqi Wale Grahak ({debtors.length})
      </Text>

      {debtors.map((cust) => (
        <View key={cust.id} style={styles.debtorCard}>
          <View style={styles.debtorLeft}>
            <Text style={styles.debtorName}>{cust.name}</Text>
            <Text style={styles.debtorPhone}>
              {cust.phone} • {cust.language || 'Hinglish'}
            </Text>
            <Text style={styles.debtorDue}>
              Baqi: {formatINR(cust.balance)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.sendWhatsAppBtn}
            onPress={() => handleSendReminder(cust)}
          >
            <MessageCircle size={16} color="#FFFFFF" />
            <Text style={styles.sendWhatsAppText}>WhatsApp Reminder</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
    padding: 16,
  },
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: lightColors.accentSoft,
    padding: 12,
    borderRadius: layout.cardRadius,
    marginBottom: 16,
  },
  tipText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: '#172033',
    lineHeight: 18,
  },
  toneSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: lightColors.muted,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  toneRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toneBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: layout.buttonRadius,
    backgroundColor: lightColors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  toneBtnActive: {
    backgroundColor: lightColors.accentSoft,
    borderColor: lightColors.accent,
  },
  toneText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: lightColors.muted,
  },
  toneTextActive: {
    color: '#172033',
    fontWeight: typography.weights.bold,
  },
  promisesSection: {
    backgroundColor: lightColors.surface,
    borderRadius: layout.cardRadius,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  promiseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  promiseTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: lightColors.primary,
    textTransform: 'uppercase',
  },
  promiseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
  },
  promiseCust: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  promiseNote: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    marginTop: 2,
  },
  pendingBadge: {
    backgroundColor: lightColors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: layout.pillRadius,
  },
  pendingText: {
    fontSize: typography.sizes.micro,
    color: '#B45309',
    fontWeight: typography.weights.bold,
  },
  sectionTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
    marginBottom: 12,
  },
  debtorCard: {
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
  debtorLeft: {
    flex: 1,
  },
  debtorName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  debtorPhone: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    marginTop: 2,
  },
  debtorDue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#B45309',
    marginTop: 4,
  },
  sendWhatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#25D366',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: layout.buttonRadius,
    minHeight: layout.minTapTarget,
  },
  sendWhatsAppText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
});
