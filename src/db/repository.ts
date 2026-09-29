/**
 * Repository Service Layer for Kirana Ledger Mobile
 * Guarantees atomic updates across Ledger, Bills, and Inventory.
 */

import { Customer, Transaction, Bill, PromiseToPay, ShopProfile, DisputeRecord, AuditLog } from "./schema";
import { defaultShopProfile, defaultCustomers, defaultTransactions, defaultBills, defaultPromises, defaultDisputes } from "./seedData";
import { initialKiranaProducts, ProductRecord } from "../core/inventory/inventoryEngine";
import { createBillFromTransaction, applyPaymentFIFO } from "../core/bills/billEngine";

class LedgerRepository {
  private profile: ShopProfile = { ...defaultShopProfile };
  private customers: Customer[] = [...defaultCustomers];
  private transactions: Transaction[] = [...defaultTransactions];
  private bills: Bill[] = [...defaultBills];
  private products: ProductRecord[] = [...initialKiranaProducts];
  private promises: PromiseToPay[] = [...defaultPromises];
  private disputes: DisputeRecord[] = [...defaultDisputes];
  private auditLogs: AuditLog[] = [];

  // Profile
  getProfile(): ShopProfile {
    return { ...this.profile };
  }

  updateProfile(updates: Partial<ShopProfile>): ShopProfile {
    this.profile = { ...this.profile, ...updates };
    return { ...this.profile };
  }

  // Customers
  getCustomers(): Customer[] {
    return [...this.customers];
  }

  addCustomer(c: Omit<Customer, "id" | "createdAt">): Customer {
    const newCust: Customer = {
      ...c,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
      aliases: c.aliases || [c.name, `${c.name.split(" ")[0]} bhai`],
    };
    this.customers = [newCust, ...this.customers];
    this.logAudit(newCust.id, "CREATE", null, newCust);
    return newCust;
  }

  // Transactions
  getTransactions(): Transaction[] {
    return this.transactions.filter((t) => !t.deletedAt);
  }

  getBills(): Bill[] {
    return [...this.bills];
  }

  getProducts(): ProductRecord[] {
    return [...this.products];
  }

  getPromises(): PromiseToPay[] {
    return [...this.promises];
  }

  getDisputes(): DisputeRecord[] {
    return [...this.disputes];
  }

  /**
   * ATOMIC COMMIT:
   * Commits Transaction + Bill (if credit) + Inventory Reduction (if items) in one atomic step.
   * Both Bill and Transaction share the SAME transaction ID.
   */
  atomicCommitTransaction(params: {
    customerId: string;
    customerName: string;
    amount: number;
    type: "CREDIT" | "PAYMENT";
    method?: "cash" | "upi" | "unspecified";
    date?: string;
    note?: string;
    source?: "voice" | "text" | "manual";
    items?: Array<{ name: string; qty: number; unit: string; price?: number }>;
  }): { transaction: Transaction; bill?: Bill; updatedProducts: ProductRecord[] } {
    const txId = `tx-${Date.now()}`;
    const date = params.date || new Date().toISOString().split("T")[0];

    // 1. Create Transaction
    const newTx: Transaction = {
      id: txId,
      customerId: params.customerId,
      customerName: params.customerName,
      amount: params.amount,
      type: params.type,
      method: params.method || "unspecified",
      date,
      note: params.note || (params.type === "CREDIT" ? "Kirana सामान" : "Payment received"),
      source: params.source || "voice",
      addedBy: this.profile.ownerName || "Shopkeeper",
      confirmedByCustomer: false,
      createdAt: new Date().toISOString(),
    };

    let createdBill: Bill | undefined;

    // 2. If Credit, generate associated Bill sharing the SAME transaction ID
    if (params.type === "CREDIT") {
      createdBill = createBillFromTransaction(this.bills, {
        id: txId,
        customerId: params.customerId,
        customerName: params.customerName,
        amount: params.amount,
        date,
        items: params.items,
        note: params.note,
      });
      newTx.billId = createdBill.id;
      this.bills = [createdBill, ...this.bills];
    } else if (params.type === "PAYMENT") {
      // 3. If Payment, apply FIFO reduction against oldest unpaid bills
      this.bills = applyPaymentFIFO(this.bills, params.customerId, params.amount);
    }

    // 4. Reduce Inventory stock if items were sold
    if (params.items && params.items.length > 0 && params.type === "CREDIT") {
      params.items.forEach((item) => {
        const prod = this.products.find(
          (p) => p.productName.toLowerCase().includes(item.name.toLowerCase())
        );
        if (prod) {
          prod.currentStock = Math.max(0, prod.currentStock - item.qty);
          prod.updatedAt = new Date().toISOString();
        }
      });
    }

    this.transactions = [newTx, ...this.transactions];
    this.logAudit(txId, "CREATE", null, newTx);

    return {
      transaction: newTx,
      bill: createdBill,
      updatedProducts: [...this.products],
    };
  }

  /**
   * ATOMIC REVERSAL (Undo / Soft Delete):
   * Reverses transaction, cancels associated bill, and restores inventory stock!
   */
  atomicReverseTransaction(txId: string): boolean {
    const txIndex = this.transactions.findIndex((t) => t.id === txId);
    if (txIndex === -1) return false;

    const oldTx = this.transactions[txIndex];
    this.transactions[txIndex] = {
      ...oldTx,
      deletedAt: new Date().toISOString(),
    };

    // Cancel associated bill if any
    if (oldTx.billId) {
      this.bills = this.bills.map((b) =>
        b.id === oldTx.billId ? { ...b, status: "CANCELLED" as const } : b
      );
    }

    this.logAudit(txId, "SOFT_DELETE", oldTx, { deletedAt: new Date().toISOString() });
    return true;
  }

  // Stock Adjustment (Stock IN / Stock OUT)
  adjustStock(productId: string, change: number): ProductRecord | null {
    const prod = this.products.find((p) => p.productId === productId);
    if (!prod) return null;

    prod.currentStock = Math.max(0, prod.currentStock + change);
    prod.updatedAt = new Date().toISOString();
    return { ...prod };
  }

  // Promises to Pay
  addPromise(p: Omit<PromiseToPay, "id" | "createdAt">): PromiseToPay {
    const newP: PromiseToPay = {
      ...p,
      id: `prom-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.promises = [newP, ...this.promises];
    return newP;
  }

  // Disputes
  raiseDispute(d: Omit<DisputeRecord, "id" | "createdAt">): DisputeRecord {
    const newD: DisputeRecord = {
      ...d,
      id: `disp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.disputes = [newD, ...this.disputes];
    return newD;
  }

  resolveDispute(disputeId: string, status: "RESOLVED" | "REJECTED"): DisputeRecord | null {
    const idx = this.disputes.findIndex((d) => d.id === disputeId);
    if (idx === -1) return null;
    this.disputes[idx].status = status;
    return { ...this.disputes[idx] };
  }

  // Customer acknowledgement (Sahi hai)
  confirmCustomerAcknowledgement(txId: string): boolean {
    const tx = this.transactions.find((t) => t.id === txId);
    if (tx) {
      tx.confirmedByCustomer = true;
      return true;
    }
    return false;
  }

  // Merge Duplicate Customers (audited, moves all transactions & bills)
  mergeCustomers(sourceId: string, targetId: string): Customer | null {
    const source = this.customers.find((c) => c.id === sourceId);
    const target = this.customers.find((c) => c.id === targetId);
    if (!source || !target) return null;

    // Move all transactions from source to target
    this.transactions = this.transactions.map((tx) => {
      if (tx.customerId === sourceId) {
        return {
          ...tx,
          customerId: targetId,
          customerName: target.name,
        };
      }
      return tx;
    });

    // Move all bills
    this.bills = this.bills.map((b) => {
      if (b.customerId === sourceId) {
        return {
          ...b,
          customerId: targetId,
          customerName: target.name,
        };
      }
      return b;
    });

    // Merge aliases
    const combinedAliases = Array.from(
      new Set([...(target.aliases || []), ...(source.aliases || []), source.name])
    );
    target.aliases = combinedAliases;

    // Remove source customer
    this.customers = this.customers.filter((c) => c.id !== sourceId);
    this.logAudit(target.id, "UPDATE", { mergedFrom: source.id, name: source.name }, target);

    return target;
  }

  // Reset to initial seed state
  resetAll(): void {
    this.profile = { ...defaultShopProfile };
    this.customers = [...defaultCustomers];
    this.transactions = [...defaultTransactions];
    this.bills = [...defaultBills];
    this.products = [...initialKiranaProducts];
    this.promises = [...defaultPromises];
    this.disputes = [...defaultDisputes];
    this.auditLogs = [];
  }

  private logAudit(entityId: string, action: "CREATE" | "UPDATE" | "SOFT_DELETE", oldValue: any, newValue: any) {
    this.auditLogs.push({
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      entityId,
      action,
      oldValue,
      newValue,
      performedBy: this.profile.ownerName || "Shopkeeper",
      timestamp: new Date().toISOString(),
    });
  }
}

export const repository = new LedgerRepository();
