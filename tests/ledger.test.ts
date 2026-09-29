import {
  calculateCustomerLedger,
  calculateLedgerMetrics,
  calculateDailyClosing,
  getDebtorStatus,
  formatINR,
} from '../src/core/ledger/ledgerMath';
import { applyPaymentFIFO, createBillFromTransaction } from '../src/core/bills/billEngine';
import { repository } from '../src/db/repository';

describe('Kirana Ledger - Financial Math & Reversal Test Suite', () => {
  const dummyTransactions = [
    {
      id: 'tx-1',
      customerId: 'cust-1',
      customerName: 'Ramesh Patil',
      amount: 500,
      type: 'CREDIT' as const,
      method: 'unspecified' as const,
      date: '2026-09-25',
      note: 'Groceries',
      source: 'voice' as const,
      addedBy: 'Shopkeeper',
      confirmedByCustomer: false,
      createdAt: '2026-09-25T10:00:00Z',
    },
    {
      id: 'tx-2',
      customerId: 'cust-1',
      customerName: 'Ramesh Patil',
      amount: 200,
      type: 'PAYMENT' as const,
      method: 'cash' as const,
      date: '2026-09-26',
      note: 'Cash payment',
      source: 'voice' as const,
      addedBy: 'Shopkeeper',
      confirmedByCustomer: true,
      createdAt: '2026-09-26T12:00:00Z',
    },
    {
      id: 'tx-3',
      customerId: 'cust-1',
      customerName: 'Ramesh Patil',
      amount: 150,
      type: 'CREDIT' as const,
      method: 'unspecified' as const,
      date: '2026-09-28',
      note: 'Atta & Sugar',
      source: 'voice' as const,
      addedBy: 'Shopkeeper',
      confirmedByCustomer: false,
      createdAt: '2026-09-28T09:00:00Z',
    },
  ];

  test('Balance is strictly derived as sum(CREDIT) - sum(PAYMENT)', () => {
    const res = calculateCustomerLedger('cust-1', dummyTransactions);
    // 500 credit - 200 payment + 150 credit = 450 outstanding
    expect(res.totalCredit).toBe(650);
    expect(res.totalPayment).toBe(200);
    expect(res.balance).toBe(450);
  });

  test('Debtor status rules: CLEAR, RECENT, DUE_SOON, OVERDUE', () => {
    const today = new Date().toISOString().split('T')[0];
    const oldDate = '2026-08-01'; // >30 days ago

    expect(getDebtorStatus(today, 0)).toBe('CLEAR');
    expect(getDebtorStatus(today, 500)).toBe('RECENT');
    expect(getDebtorStatus(oldDate, 500)).toBe('OVERDUE');
  });

  test('FIFO Bill Payment Application reduces oldest unpaid bills first', () => {
    const bills = [
      {
        id: 'bill-1',
        billNumber: 'HB-1001',
        customerId: 'cust-1',
        customerName: 'Ramesh',
        date: '2026-09-10',
        items: [{ name: 'Rice', qty: 2, unit: 'kg', price: 300 }],
        totalAmount: 300,
        paidAmount: 0,
        remainingAmount: 300,
        status: 'UNPAID' as const,
        linkedTransactionId: 'tx-1',
        createdAt: '2026-09-10T10:00:00Z',
      },
      {
        id: 'bill-2',
        billNumber: 'HB-1002',
        customerId: 'cust-1',
        customerName: 'Ramesh',
        date: '2026-09-15',
        items: [{ name: 'Oil', qty: 1, unit: 'L', price: 500 }],
        totalAmount: 500,
        paidAmount: 0,
        remainingAmount: 500,
        status: 'UNPAID' as const,
        linkedTransactionId: 'tx-2',
        createdAt: '2026-09-15T10:00:00Z',
      },
    ];

    // Customer pays ₹400: bill-1 (₹300) should be fully paid, and bill-2 should have ₹100 applied
    const updated = applyPaymentFIFO(bills, 'cust-1', 400);
    expect(updated[0].status).toBe('PAID');
    expect(updated[0].remainingAmount).toBe(0);

    expect(updated[1].status).toBe('PARTIALLY_PAID');
    expect(updated[1].paidAmount).toBe(100);
    expect(updated[1].remainingAmount).toBe(400);
  });

  test('Atomic Commit and Reversal in LedgerRepository', () => {
    repository.resetAll();

    // 1. Commit transaction with bill
    const res = repository.atomicCommitTransaction({
      customerId: 'cust-1',
      customerName: 'Ramesh Patil',
      amount: 600,
      type: 'CREDIT',
      note: 'Rice 5kg',
      items: [{ name: 'Rice', qty: 5, unit: 'kg', price: 600 }],
    });

    expect(res.transaction).toBeDefined();
    expect(res.bill).toBeDefined();
    expect(res.transaction.id).toBe(res.bill?.id); // Shares same transaction ID!

    // 2. Reverse transaction (soft delete)
    const reversed = repository.atomicReverseTransaction(res.transaction.id);
    expect(reversed).toBe(true);

    // Verify transaction is excluded from active ledger
    const activeTx = repository.getTransactions().find((t) => t.id === res.transaction.id);
    expect(activeTx).toBeUndefined();

    // Verify bill is marked CANCELLED
    const bill = repository.getBills().find((b) => b.id === res.transaction.id);
    expect(bill?.status).toBe('CANCELLED');
  });
});
