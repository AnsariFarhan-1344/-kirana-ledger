/**
 * Database Schema and Entities for Kirana Ledger Mobile
 */

export interface ShopProfile {
  id: string;
  shopName: string;
  ownerName: string;
  phone: string;
  upiId: string;
  address: string;
  preferredLanguage: "en" | "hi" | "mr";
  autoSaveEnabled: boolean;
  pinCode?: string;
  fingerprintEnabled?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  language: "en" | "hi" | "mr" | "hinglish";
  creditLimit: number;
  aliases: string[];
  createdAt: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  type: "CREDIT" | "PAYMENT";
  method: "cash" | "upi" | "unspecified";
  date: string;
  note: string;
  source: "voice" | "text" | "manual";
  billId?: string;
  addedBy: string;
  confirmedByCustomer: boolean;
  deletedAt?: string | null;
  createdAt: string;
}

export interface Bill {
  id: string;
  billNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  items: Array<{ name: string; qty: number; unit: string; price?: number }>;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
  linkedTransactionId: string;
  createdAt: string;
}

export interface PromiseToPay {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  promiseDate: string;
  status: "pending" | "fulfilled" | "broken";
  note: string;
  createdAt: string;
}

export interface DisputeRecord {
  id: string;
  transactionId: string;
  customerId: string;
  customerName: string;
  reason: string;
  status: "OPEN" | "RESOLVED" | "REJECTED";
  customerNote?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  entityId: string;
  action: "CREATE" | "UPDATE" | "SOFT_DELETE";
  oldValue?: any;
  newValue?: any;
  performedBy: string;
  timestamp: string;
}
