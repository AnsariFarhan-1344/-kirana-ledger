import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
} from 'react-native';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from 'react-i18next';
import {
  calculateLedgerMetrics,
  getDebtorStatus,
  formatINR,
} from '../core/ledger/ledgerMath';
import { Customer } from '../db/schema';
import {
  Search,
  UserPlus,
  ArrowUpRight,
  ChevronRight,
  Filter,
  X,
} from 'lucide-react-native';

export const LedgerScreen: React.FC = () => {
  const { t } = useTranslation();
  const {
    customers,
    transactions,
    setActiveCustomer,
    addCustomer,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'DUES' | 'OVERDUE'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Customer form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLimit, setNewLimit] = useState('5000');

  const metrics = calculateLedgerMetrics(customers, transactions);

  // Filter customers based on search and selected filter
  const filteredCustomers = customers.filter((c) => {
    const custMetrics = metrics.customerBalances[c.id] || { balance: 0, lastTxDate: null };
    const status = getDebtorStatus(custMetrics.lastTxDate, custMetrics.balance);

    // Tab filter
    if (filterMode === 'DUES' && custMetrics.balance <= 0) return false;
    if (filterMode === 'OVERDUE' && status !== 'OVERDUE') return false;

    // Search query filter (name, phone, aliases)
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchName = c.name.toLowerCase().includes(q);
    const matchPhone = c.phone.includes(q);
    const matchAlias = c.aliases && c.aliases.some((a) => a.toLowerCase().includes(q));

    return matchName || matchPhone || matchAlias;
  });

  const handleCreateCustomer = () => {
    if (!newName.trim()) return;

    addCustomer({
      name: newName.trim(),
      phone: newPhone.trim() || '9820100000',
      language: 'Hinglish',
      creditLimit: parseFloat(newLimit) || 5000,
      aliases: [newName.trim(), `${newName.trim().split(' ')[0]} bhai`],
    });

    setNewName('');
    setNewPhone('');
    setIsAddModalOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Search & Add Bar */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Search size={18} color={lightColors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name, phone, alias..."
            placeholderTextColor={lightColors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={lightColors.muted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setIsAddModalOpen(true)}
          accessibilityLabel="Add New Customer"
        >
          <UserPlus size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.tab, filterMode === 'ALL' && styles.tabActive]}
          onPress={() => setFilterMode('ALL')}
        >
          <Text
            style={[
              styles.tabText,
              filterMode === 'ALL' && styles.tabTextActive,
            ]}
          >
            All ({customers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, filterMode === 'DUES' && styles.tabActive]}
          onPress={() => setFilterMode('DUES')}
        >
          <Text
            style={[
              styles.tabText,
              filterMode === 'DUES' && styles.tabTextActive,
            ]}
          >
            Dues ({metrics.debtorsCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, filterMode === 'OVERDUE' && styles.tabActive]}
          onPress={() => setFilterMode('OVERDUE')}
        >
          <Text
            style={[
              styles.tabText,
              filterMode === 'OVERDUE' && styles.tabTextActive,
            ]}
          >
            Overdue &gt;30d
          </Text>
        </TouchableOpacity>
      </View>

      {/* Customer List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const custMetrics = metrics.customerBalances[item.id] || {
            balance: 0,
            lastTxDate: null,
          };
          const status = getDebtorStatus(
            custMetrics.lastTxDate,
            custMetrics.balance
          );

          return (
            <TouchableOpacity
              style={styles.customerCard}
              onPress={() => setActiveCustomer(item)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.cardInfo}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.custName}>{item.name}</Text>
                  <View
                    style={[
                      styles.dot,
                      status === 'OVERDUE'
                        ? styles.dotRed
                        : status === 'DUE_SOON'
                        ? styles.dotAmber
                        : styles.dotGreen,
                    ]}
                  />
                </View>
                <Text style={styles.custPhone}>
                  {item.phone} • {item.language || 'Hinglish'}
                </Text>
                {status === 'OVERDUE' && (
                  <Text style={styles.overdueBadge}>Overdue &gt;30 days</Text>
                )}
              </View>

              <View style={styles.balanceCol}>
                <Text
                  style={[
                    styles.balanceAmt,
                    custMetrics.balance > 0
                      ? styles.balanceCredit
                      : styles.balanceClear,
                  ]}
                >
                  {custMetrics.balance > 0
                    ? formatINR(custMetrics.balance)
                    : 'Clear ✓'}
                </Text>
                {custMetrics.balance > 0 && (
                  <Text style={styles.dueLabel}>{t('ledger.due')}</Text>
                )}
              </View>

              <ChevronRight size={18} color={lightColors.muted} />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No customers found</Text>
            <Text style={styles.emptySubtitle}>
              Try searching by another name or tap + to add a customer.
            </Text>
          </View>
        }
      />

      {/* Add Customer Modal */}
      <Modal
        visible={isAddModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Naya Grahak Jodein</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <X size={20} color={lightColors.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Customer Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Jaise: Rajesh Yadav"
                value={newName}
                onChangeText={setNewName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Mobile Number</Text>
              <TextInput
                style={styles.formInput}
                placeholder="10-digit number"
                keyboardType="phone-pad"
                value={newPhone}
                onChangeText={setNewPhone}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Credit Limit (₹)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="5000"
                keyboardType="numeric"
                value={newLimit}
                onChangeText={setNewLimit}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.saveCustomerBtn,
                !newName.trim() && styles.saveBtnDisabled,
              ]}
              disabled={!newName.trim()}
              onPress={handleCreateCustomer}
            >
              <Text style={styles.saveCustomerBtnText}>Save Customer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.surface,
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: layout.inputRadius,
    paddingHorizontal: 12,
    height: layout.minTapTarget,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.body,
    color: lightColors.text,
  },
  addBtn: {
    width: layout.minTapTarget,
    height: layout.minTapTarget,
    borderRadius: layout.buttonRadius,
    backgroundColor: lightColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.surface,
    borderRadius: layout.cardRadius,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: lightColors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  cardInfo: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  custName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotGreen: {
    backgroundColor: lightColors.primary,
  },
  dotAmber: {
    backgroundColor: lightColors.accent,
  },
  dotRed: {
    backgroundColor: lightColors.danger,
  },
  custPhone: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    marginTop: 2,
  },
  overdueBadge: {
    fontSize: typography.sizes.micro,
    color: lightColors.danger,
    fontWeight: typography.weights.bold,
    marginTop: 2,
  },
  balanceCol: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  balanceAmt: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
  },
  balanceCredit: {
    color: '#B45309',
  },
  balanceClear: {
    color: lightColors.primary,
  },
  dueLabel: {
    fontSize: typography.sizes.micro,
    color: lightColors.muted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: lightColors.muted,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 18, 32, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: lightColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: lightColors.muted,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: lightColors.surfaceSubtle,
    borderRadius: layout.inputRadius,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: typography.sizes.body,
    color: lightColors.text,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  saveCustomerBtn: {
    backgroundColor: lightColors.primary,
    borderRadius: layout.buttonRadius,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: layout.minTapTarget,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveCustomerBtnText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
  },
});
