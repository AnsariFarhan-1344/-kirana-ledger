import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
} from 'react-native';
import { lightColors } from '../theme/colors';
import { typography, layout } from '../theme/typography';
import { formatINR } from '../core/ledger/ledgerMath';
import {
  Truck,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Building2,
} from 'lucide-react-native';

interface SupplierRecord {
  id: string;
  name: string;
  category: string;
  phone: string;
  balanceDue: number; // what shopkeeper owes them
  lastPaymentDate: string;
}

const INITIAL_SUPPLIERS: SupplierRecord[] = [
  {
    id: 'sup-1',
    name: 'Sharma Traders (Atta & Grains)',
    category: 'Grains & Atta',
    phone: '9820111222',
    balanceDue: 8500,
    lastPaymentDate: '2026-09-24',
  },
  {
    id: 'sup-2',
    name: 'Mahalaxmi Rice Mill',
    category: 'Rice & Pulses',
    phone: '9820133444',
    balanceDue: 12400,
    lastPaymentDate: '2026-09-20',
  },
  {
    id: 'sup-3',
    name: 'Hindustan Agency (Soaps & FMCG)',
    category: 'FMCG & Personal Care',
    phone: '9820155666',
    balanceDue: 4200,
    lastPaymentDate: '2026-09-26',
  },
  {
    id: 'sup-4',
    name: 'Balaji Oil Depot',
    category: 'Cooking Oils & Ghee',
    phone: '9820177888',
    balanceDue: 0,
    lastPaymentDate: '2026-09-28',
  },
];

export const SuppliersScreen: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(INITIAL_SUPPLIERS);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierRecord | null>(null);
  const [payAmount, setPayAmount] = useState('');

  const totalPayable = suppliers.reduce((sum, s) => sum + s.balanceDue, 0);

  const handlePaySupplier = () => {
    if (!selectedSupplier || !payAmount) return;

    const amt = parseFloat(payAmount);
    setSuppliers(
      suppliers.map((s) =>
        s.id === selectedSupplier.id
          ? {
              ...s,
              balanceDue: Math.max(0, s.balanceDue - amt),
              lastPaymentDate: new Date().toISOString().split('T')[0],
            }
          : s
      )
    );

    setIsPayModalOpen(false);
    setPayAmount('');
  };

  return (
    <View style={styles.container}>
      {/* Total Wholesaler Payable Banner */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <Building2 size={20} color={lightColors.primary} />
          <Text style={styles.summaryTitle}>Wholesaler Khata (Vyapari)</Text>
        </View>
        <Text style={styles.summaryLabel}>Total Payable to Wholesalers</Text>
        <Text style={styles.summaryAmount}>{formatINR(totalPayable)}</Text>
        <Text style={styles.summaryHint}>
          Voice prompt: "Sharma traders ko 5000 diye"
        </Text>
      </View>

      {/* Supplier List */}
      <FlatList
        data={suppliers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.supplierCard}>
            <View style={styles.supLeft}>
              <Text style={styles.supName}>{item.name}</Text>
              <Text style={styles.supMeta}>
                {item.category} • {item.phone}
              </Text>
              <Text style={styles.supLastDate}>
                Last paid: {item.lastPaymentDate}
              </Text>
            </View>

            <View style={styles.supRight}>
              <Text
                style={[
                  styles.supBalance,
                  item.balanceDue > 0 ? styles.balanceDue : styles.balanceNil,
                ]}
              >
                {item.balanceDue > 0 ? formatINR(item.balanceDue) : 'NIL ✓'}
              </Text>

              {item.balanceDue > 0 && (
                <TouchableOpacity
                  style={styles.payBtn}
                  onPress={() => {
                    setSelectedSupplier(item);
                    setPayAmount(item.balanceDue.toString());
                    setIsPayModalOpen(true);
                  }}
                >
                  <Text style={styles.payBtnText}>Pay Supplier</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />

      {/* Pay Supplier Modal */}
      <Modal
        visible={isPayModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsPayModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Supplier Payment</Text>
              <TouchableOpacity onPress={() => setIsPayModalOpen(false)}>
                <X size={20} color={lightColors.muted} />
              </TouchableOpacity>
            </View>

            {selectedSupplier && (
              <View>
                <Text style={styles.payToName}>{selectedSupplier.name}</Text>
                <Text style={styles.payToSub}>
                  Current Due: {formatINR(selectedSupplier.balanceDue)}
                </Text>

                <TextInput
                  style={styles.payInput}
                  value={payAmount}
                  onChangeText={setPayAmount}
                  placeholder="Amount Paid (₹)"
                  keyboardType="numeric"
                />

                <TouchableOpacity
                  style={styles.confirmPayBtn}
                  onPress={handlePaySupplier}
                >
                  <Text style={styles.confirmPayText}>Save Payment</Text>
                </TouchableOpacity>
              </View>
            )}
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
  summaryCard: {
    backgroundColor: lightColors.surface,
    borderRadius: layout.cardRadius,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  summaryLabel: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
  },
  summaryAmount: {
    fontSize: 26,
    fontWeight: typography.weights.black,
    color: '#B45309',
    marginVertical: 4,
  },
  summaryHint: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  supplierCard: {
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
  supLeft: {
    flex: 1,
    gap: 2,
  },
  supName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  supMeta: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
  },
  supLastDate: {
    fontSize: typography.sizes.micro,
    color: lightColors.muted,
    marginTop: 2,
  },
  supRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  supBalance: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
  },
  balanceDue: {
    color: '#B45309',
  },
  balanceNil: {
    color: lightColors.primary,
  },
  payBtn: {
    backgroundColor: lightColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: layout.pillRadius,
  },
  payBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
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
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  payToName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
  },
  payToSub: {
    fontSize: typography.sizes.xs,
    color: lightColors.muted,
    marginBottom: 14,
  },
  payInput: {
    backgroundColor: lightColors.surfaceSubtle,
    borderRadius: layout.inputRadius,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: typography.sizes.money,
    fontWeight: typography.weights.bold,
    color: lightColors.text,
    borderWidth: 1,
    borderColor: lightColors.border,
    marginBottom: 16,
  },
  confirmPayBtn: {
    backgroundColor: lightColors.primary,
    borderRadius: layout.buttonRadius,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.minTapTarget,
  },
  confirmPayText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: '#FFFFFF',
  },
});
