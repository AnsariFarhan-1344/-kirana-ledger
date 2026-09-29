import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
} from 'react-native';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';
import { calculateDailyClosing, formatINR } from '../core/ledger/ledgerMath';
import { BRAND_NAME } from '../config/brand';
import {
  Sun,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Share2,
  Calendar,
  Banknote,
  Smartphone,
} from 'lucide-react-native';

export const DailyClosingModal: React.FC = () => {
  const { isDailyClosingOpen, setDailyClosing, transactions, profile } =
    useAppStore();

  if (!isDailyClosingOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const summary = calculateDailyClosing(transactions, todayStr);

  const handleShareSummary = async () => {
    const text = `*${profile.shopName} — Roz Ka Hisaab (${todayStr})*\n\n` +
      `• Total Credit (उधार दिया): ${formatINR(summary.totalCredit)}\n` +
      `• Cash Jama: ${formatINR(summary.totalCashPayment)}\n` +
      `• UPI Jama: ${formatINR(summary.totalUpiPayment)}\n` +
      `• Total Jama: ${formatINR(summary.totalPayment)}\n` +
      `• Net Cashflow: ${summary.netChange >= 0 ? '+' : ''}${formatINR(summary.netChange)}\n\n` +
      `_Recorded via ${BRAND_NAME}_`;

    try {
      await Share.share({ message: text });
    } catch (e) {}
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent
      onRequestClose={() => setDailyClosing(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Sun size={22} color={lightColors.accent} />
              <View>
                <Text style={styles.title}>Roz Ka Hisaab (Daily Closing)</Text>
                <Text style={styles.subtitle}>
                  {profile.shopName} • {todayStr}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setDailyClosing(false)}
            >
              <X size={20} color={lightColors.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Net Change Big Metric */}
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>Net Daily Cashflow</Text>
              <Text
                style={[
                  styles.heroAmount,
                  summary.netChange >= 0 ? styles.posText : styles.negText,
                ]}
              >
                {summary.netChange >= 0 ? '+' : ''}
                {formatINR(summary.netChange)}
              </Text>
              <Text style={styles.heroHint}>
                (Total Collected − Total Udhaar given today)
              </Text>
            </View>

            {/* Breakdown Cards */}
            <View style={styles.gridRow}>
              <View style={styles.statBox}>
                <View style={styles.statTop}>
                  <ArrowUpRight size={16} color="#B45309" />
                  <Text style={styles.statLabel}>Credit Given</Text>
                </View>
                <Text style={[styles.statValue, { color: '#B45309' }]}>
                  {formatINR(summary.totalCredit)}
                </Text>
              </View>

              <View style={styles.statBox}>
                <View style={styles.statTop}>
                  <ArrowDownLeft size={16} color={lightColors.primary} />
                  <Text style={styles.statLabel}>Total Collected</Text>
                </View>
                <Text style={[styles.statValue, { color: lightColors.primary }]}>
                  {formatINR(summary.totalPayment)}
                </Text>
              </View>
            </View>

            {/* Cash vs UPI split */}
            <View style={styles.splitCard}>
              <Text style={styles.splitTitle}>Collection Method Breakdown</Text>
              <View style={styles.splitRow}>
                <View style={styles.splitItem}>
                  <Banknote size={18} color={lightColors.primary} />
                  <View>
                    <Text style={styles.splitSub}>Cash In Hand</Text>
                    <Text style={styles.splitAmt}>
                      {formatINR(summary.totalCashPayment)}
                    </Text>
                  </View>
                </View>

                <View style={styles.splitDivider} />

                <View style={styles.splitItem}>
                  <Smartphone size={18} color={lightColors.info} />
                  <View>
                    <Text style={styles.splitSub}>UPI Digital</Text>
                    <Text style={styles.splitAmt}>
                      {formatINR(summary.totalUpiPayment)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Plain language takeaway */}
            <View style={styles.takeawayBox}>
              <Text style={styles.takeawayTitle}>Aaj Ka Vishleshan:</Text>
              <Text style={styles.takeawayText}>
                {summary.totalPayment > summary.totalCredit
                  ? `Shabash! Aaj jama hui raqam (${formatINR(summary.totalPayment)}) diye gaye udhaar (${formatINR(summary.totalCredit)}) se adhik rahi. Dukaan ka cashflow swasth hai.`
                  : `Aaj diye gaye udhaar (${formatINR(summary.totalCredit)}) jama hui raqam se adhik hai. Kal subah purane grahakon ko WhatsApp reminder bhejna sujhav hai.`}
              </Text>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShareSummary}
            >
              <Share2 size={18} color="#FFFFFF" />
              <Text style={styles.shareBtnText}>Share Roz Ka Hisaab</Text>
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
    backgroundColor: 'rgba(11, 18, 32, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: lightColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  subtitle: {
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
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  heroCard: {
    backgroundColor: lightColors.surfaceSubtle,
    borderRadius: layout.cardRadius,
    padding: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  heroLabel: {
    fontSize: typography.sizes.sm,
    color: lightColors.muted,
    fontWeight: typography.weights.medium,
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: typography.weights.black,
    marginVertical: 4,
  },
  posText: {
    color: lightColors.primary,
  },
  negText: {
    color: lightColors.danger,
  },
  heroHint: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: lightColors.surface,
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: layout.cardRadius,
    padding: 12,
  },
  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
  },
  statValue: {
    fontSize: typography.sizes.money,
    fontWeight: typography.weights.bold,
  },
  splitCard: {
    backgroundColor: lightColors.surface,
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: layout.cardRadius,
    padding: 14,
    marginBottom: 14,
  },
  splitTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: lightColors.muted,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  splitSub: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
  },
  splitAmt: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  splitDivider: {
    width: 1,
    height: 32,
    backgroundColor: lightColors.border,
    marginHorizontal: 12,
  },
  takeawayBox: {
    backgroundColor: lightColors.primarySoft,
    borderRadius: layout.cardRadius,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: lightColors.primary,
  },
  takeawayTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: lightColors.primary,
    marginBottom: 4,
  },
  takeawayText: {
    fontSize: typography.sizes.sm,
    color: lightColors.text,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: lightColors.primary,
    borderRadius: layout.buttonRadius,
    paddingVertical: 14,
    minHeight: layout.minTapTarget,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
  },
});
