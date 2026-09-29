import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from 'react-i18next';
import { getProductStockStatus } from '../core/inventory/inventoryEngine';
import { formatINR } from '../core/ledger/ledgerMath';
import {
  Search,
  Package,
  Plus,
  Minus,
  AlertTriangle,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export const InventoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const { products, adjustProductStock } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');

  const filteredProducts = products.filter((p) => {
    const status = getProductStockStatus(p);

    if (filterMode === 'LOW' && status !== 'LOW_STOCK') return false;
    if (filterMode === 'OUT' && status !== 'OUT_OF_STOCK') return false;

    if (!searchQuery.trim()) return true;
    return (
      p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleStockChange = (productId: string, change: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    adjustProductStock(productId, change);
  };

  const lowStockCount = products.filter(
    (p) => getProductStockStatus(p) === 'LOW_STOCK'
  ).length;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Search size={18} color={lightColors.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search 25+ kirana items (rice, sugar, oil)..."
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

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, filterMode === 'ALL' && styles.filterChipActive]}
          onPress={() => setFilterMode('ALL')}
        >
          <Text
            style={[
              styles.filterText,
              filterMode === 'ALL' && styles.filterTextActive,
            ]}
          >
            All ({products.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterMode === 'LOW' && styles.filterChipActive]}
          onPress={() => setFilterMode('LOW')}
        >
          <Text
            style={[
              styles.filterText,
              filterMode === 'LOW' && styles.filterTextActive,
            ]}
          >
            Low Stock ({lowStockCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterMode === 'OUT' && styles.filterChipActive]}
          onPress={() => setFilterMode('OUT')}
        >
          <Text
            style={[
              styles.filterText,
              filterMode === 'OUT' && styles.filterTextActive,
            ]}
          >
            Out of Stock
          </Text>
        </TouchableOpacity>
      </View>

      {/* Products FlatList */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const status = getProductStockStatus(item);

          return (
            <View style={styles.productCard}>
              <View style={styles.productLeft}>
                <View style={styles.prodHeaderRow}>
                  <Text style={styles.prodName}>{item.productName}</Text>
                  {/* Status Badge */}
                  <View
                    style={[
                      styles.statusBadge,
                      status === 'IN_STOCK'
                        ? styles.badgeInStock
                        : status === 'LOW_STOCK'
                        ? styles.badgeLowStock
                        : styles.badgeOutOfStock,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        status === 'IN_STOCK'
                          ? styles.badgeTextIn
                          : status === 'LOW_STOCK'
                          ? styles.badgeTextLow
                          : styles.badgeTextOut,
                      ]}
                    >
                      {status === 'IN_STOCK'
                        ? 'In Stock'
                        : status === 'LOW_STOCK'
                        ? 'Low Stock'
                        : 'Out of Stock'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.prodMeta}>
                  {item.category} • Rate: {formatINR(item.sellingPrice)} /{' '}
                  {item.unit}
                </Text>
                <Text style={styles.stockCount}>
                  Available:{' '}
                  <Text style={{ fontWeight: typography.weights.bold }}>
                    {item.currentStock} {item.unit}
                  </Text>
                </Text>
              </View>

              {/* Inline Stock Adjustment Buttons */}
              <View style={styles.stockActions}>
                <TouchableOpacity
                  style={[styles.stockBtn, styles.stockMinusBtn]}
                  onPress={() => handleStockChange(item.productId, -1)}
                  disabled={item.currentStock <= 0}
                >
                  <Minus size={16} color={lightColors.text} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.stockBtn, styles.stockPlusBtn]}
                  onPress={() => handleStockChange(item.productId, 1)}
                >
                  <Plus size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.surface,
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: layout.inputRadius,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    height: layout.minTapTarget,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.body,
    color: lightColors.text,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: layout.pillRadius,
    backgroundColor: lightColors.surface,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  filterChipActive: {
    backgroundColor: lightColors.primarySoft,
    borderColor: lightColors.primary,
  },
  filterText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: lightColors.muted,
  },
  filterTextActive: {
    color: lightColors.primary,
    fontWeight: typography.weights.bold,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: lightColors.surface,
    borderRadius: layout.cardRadius,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  productLeft: {
    flex: 1,
    gap: 2,
  },
  prodHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prodName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: layout.pillRadius,
  },
  badgeInStock: {
    backgroundColor: lightColors.primarySoft,
  },
  badgeLowStock: {
    backgroundColor: lightColors.accentSoft,
  },
  badgeOutOfStock: {
    backgroundColor: lightColors.dangerSoft,
  },
  badgeText: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.bold,
  },
  badgeTextIn: {
    color: lightColors.primary,
  },
  badgeTextLow: {
    color: '#B45309',
  },
  badgeTextOut: {
    color: lightColors.danger,
  },
  prodMeta: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
  },
  stockCount: {
    fontSize: typography.sizes.xs,
    color: lightColors.text,
    marginTop: 2,
  },
  stockActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.minTapTarget,
    minWidth: 38,
  },
  stockMinusBtn: {
    backgroundColor: lightColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  stockPlusBtn: {
    backgroundColor: lightColors.primary,
  },
});
