import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from 'react-i18next';
import { formatINR } from '../core/ledger/ledgerMath';
import { Receipt, Share2, ChevronRight } from 'lucide-react-native';

export const BillsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { bills, setReceiptBill } = useAppStore();

  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'UNPAID' | 'PARTIALLY_PAID' | 'PAID'
  >('ALL');

  const filteredBills = bills.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, statusFilter === 'ALL' && styles.tabActive]}
          onPress={() => setStatusFilter('ALL')}
        >
          <Text
            style={[styles.tabText, statusFilter === 'ALL' && styles.tabTextActive]}
          >
            All ({bills.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, statusFilter === 'UNPAID' && styles.tabActive]}
          onPress={() => setStatusFilter('UNPAID')}
        >
          <Text
            style={[
              styles.tabText,
              statusFilter === 'UNPAID' && styles.tabTextActive,
            ]}
          >
            Unpaid (बाकी)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, statusFilter === 'PAID' && styles.tabActive]}
          onPress={() => setStatusFilter('PAID')}
        >
          <Text
            style={[styles.tabText, statusFilter === 'PAID' && styles.tabTextActive]}
          >
            Paid (पूर्ण)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bills List */}
      <FlatList
        data={filteredBills}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              style={styles.billCard}
              onPress={() => setReceiptBill(item)}
            >
              <View style={styles.billIconWrap}>
                <Receipt size={22} color={lightColors.primary} />
              </View>

              <View style={styles.billInfo}>
                <View style={styles.billHeaderRow}>
                  <Text style={styles.billNumber}>{item.billNumber}</Text>
                  {/* Status Badge */}
                  <View
                    style={[
                      styles.statusBadge,
                      item.status === 'PAID'
                        ? styles.badgePaid
                        : item.status === 'PARTIALLY_PAID'
                        ? styles.badgePartial
                        : styles.badgeUnpaid,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        item.status === 'PAID'
                          ? styles.statusTextPaid
                          : item.status === 'PARTIALLY_PAID'
                          ? styles.statusTextPartial
                          : styles.statusTextUnpaid,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.custName}>{item.customerName}</Text>
                <Text style={styles.billMeta}>
                  {item.date} • {item.items ? item.items.length : 1} items
                </Text>
              </View>

              <View style={styles.amountCol}>
                <Text style={styles.billAmount}>
                  {formatINR(item.totalAmount)}
                </Text>
                <Text style={styles.shareHint}>Tap to view parchi</Text>
              </View>

              <ChevronRight size={18} color={lightColors.muted} />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: layout.pillRadius,
    backgroundColor: lightColors.surface,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  tabActive: {
    backgroundColor: lightColors.primarySoft,
    borderColor: lightColors.primary,
  },
  tabText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: lightColors.muted,
  },
  tabTextActive: {
    color: lightColors.primary,
    fontWeight: typography.weights.bold,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  billCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.surface,
    borderRadius: layout.cardRadius,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  billIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: lightColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  billInfo: {
    flex: 1,
  },
  billHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  billNumber: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgePaid: {
    backgroundColor: lightColors.primarySoft,
  },
  badgePartial: {
    backgroundColor: lightColors.infoSoft,
  },
  badgeUnpaid: {
    backgroundColor: lightColors.accentSoft,
  },
  statusText: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.bold,
  },
  statusTextPaid: {
    color: lightColors.primary,
  },
  statusTextPartial: {
    color: lightColors.info,
  },
  statusTextUnpaid: {
    color: '#B45309',
  },
  custName: {
    fontSize: typography.sizes.sm,
    color: lightColors.text,
    fontWeight: typography.weights.medium,
    marginTop: 2,
  },
  billMeta: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    marginTop: 2,
  },
  amountCol: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  billAmount: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  shareHint: {
    fontSize: typography.sizes.micro,
    color: lightColors.info,
  },
});
