/**
 * Pure Bill Engine (Framework-free TypeScript)
 * Manages Kirana bills format HB-1042, FIFO payment allocation, and statuses.
 */

export type BillStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";

export interface BillItem {
  name: string;
  qty: number;
  unit: string;
  price?: number;
}

export interface BillRecord {
  id: string;
  billNumber: string; // e.g. "HB-1042"
  shopkeeperId?: string;
  customerId: string;
  customerName: string;
  date: string;
  items: BillItem[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: BillStatus;
  linkedTransactionId: string;
  createdAt: string;
}

/**
 * Generate sequential bill number like HB-1042
 */
export function generateBillNumber(existingBillsCount: number): string {
  const base = 1040 + existingBillsCount + 1;
  return `HB-${base}`;
}

/**
 * Creates a new bill linked atomically with a credit transaction
 */
export function createBillFromTransaction(
  existingBills: BillRecord[],
  tx: {
    id: string;
    customerId: string;
    customerName: string;
    amount: number;
    date: string;
    items?: BillItem[];
    note?: string;
  }
): BillRecord {
  const billNumber = generateBillNumber(existingBills.length);
  const items = tx.items && tx.items.length > 0 ? tx.items : [{ name: tx.note || "Kirana सामान", qty: 1, unit: "pkg", price: tx.amount }];

  return {
    id: tx.id,
    billNumber,
    customerId: tx.customerId,
    customerName: tx.customerName,
    date: tx.date,
    items,
    totalAmount: tx.amount,
    paidAmount: 0,
    remainingAmount: tx.amount,
    status: "UNPAID",
    linkedTransactionId: tx.id,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Applies customer payments against oldest unpaid bills using FIFO (First In First Out)
 */
export function applyPaymentFIFO(
  bills: BillRecord[],
  customerId: string,
  paymentAmount: number
): BillRecord[] {
  let paymentLeft = paymentAmount;

  return bills.map((bill) => {
    if (bill.customerId !== customerId || bill.status === "PAID" || bill.status === "CANCELLED") {
      return bill;
    }

    if (paymentLeft <= 0) {
      return bill;
    }

    const remainingDue = bill.remainingAmount;
    if (paymentLeft >= remainingDue) {
      paymentLeft -= remainingDue;
      return {
        ...bill,
        paidAmount: bill.totalAmount,
        remainingAmount: 0,
        status: "PAID",
      };
    } else {
      const newPaid = bill.paidAmount + paymentLeft;
      const newRemaining = bill.totalAmount - newPaid;
      paymentLeft = 0;
      return {
        ...bill,
        paidAmount: newPaid,
        remainingAmount: newRemaining,
        status: "PARTIALLY_PAID",
      };
    }
  });
}
