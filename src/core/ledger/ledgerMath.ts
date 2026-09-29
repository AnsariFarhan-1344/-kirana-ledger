/**
 * Pure Ledger Calculations (Framework-free TypeScript)
 * Strictly derives balance as: sum(CREDIT) - sum(PAYMENT) = Outstanding
 */

export interface TransactionRecord {
  id: string;
  shopkeeperId?: string;
  customerId: string;
  customerName: string;
  amount: number;
  type: "CREDIT" | "PAYMENT";
  method?: "cash" | "upi" | "unspecified";
  date: string;
  note?: string;
  source?: "voice" | "text" | "manual";
  billId?: string;
  confirmedByCustomer?: boolean;
  deletedAt?: string | null;
  createdAt: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  language?: "en" | "hi" | "mr";
  creditLimit?: number;
  aliases?: string[];
  lastTransactionDate?: string;
}

export interface ComputedCustomer extends CustomerRecord {
  outstanding: number;
  advance: number;
  totalCredit: number;
  totalPayment: number;
  transactionCount: number;
  status: "active" | "due" | "overdue";
  creditLimit: number;
}

export function formatINR(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "₹0";
  const num = Math.round(Number(val));
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function calculateCustomerBalances(
  customers: CustomerRecord[],
  transactions: TransactionRecord[]
): ComputedCustomer[] {
  const activeTxs = transactions.filter((t) => !t.deletedAt);

  return customers.map((c) => {
    const custTxs = activeTxs.filter((t) => t.customerId === c.id);

    const totalCredit = custTxs
      .filter((t) => t.type === "CREDIT")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalPayment = custTxs
      .filter((t) => t.type === "PAYMENT")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const outstanding = Math.max(0, totalCredit - totalPayment);
    const advance = Math.max(0, totalPayment - totalCredit);

    // Sort to find latest transaction
    const latestTx = [...custTxs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const lastDate = latestTx ? latestTx.date : c.lastTransactionDate || new Date().toISOString().split("T")[0];

    // Days since last transaction
    const daysAgo = Math.floor((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));

    let status: "active" | "due" | "overdue" = "active";
    if (outstanding > 0) {
      if (daysAgo > 30 || outstanding > 4000) {
        status = "overdue"; // RED (>30 days)
      } else if (daysAgo > 10 || outstanding > 1500) {
        status = "due";     // AMBER
      } else {
        status = "active";  // GREEN (recent active)
      }
    }

    return {
      ...c,
      outstanding,
      advance,
      totalCredit,
      totalPayment,
      transactionCount: custTxs.length,
      lastTransactionDate: lastDate,
      status,
      creditLimit: c.creditLimit || 5000,
    };
  });
}

export interface DashboardMetrics {
  totalOutstanding: number;
  customersWithDues: number;
  weeklyCredit: number;
  weeklyPayment: number;
  netWeeklyChange: number;
  takeawayMessage: string;
  todayCredit: number;
  todayPayment: number;
  todayCash: number;
  todayUPI: number;
  todayNet: number;
}

export function computeDashboardMetrics(
  computedCustomers: ComputedCustomer[],
  transactions: TransactionRecord[]
): DashboardMetrics {
  const activeTxs = transactions.filter((t) => !t.deletedAt);
  const totalOutstanding = computedCustomers.reduce((sum, c) => sum + c.outstanding, 0);
  const customersWithDues = computedCustomers.filter((c) => c.outstanding > 0).length;

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const todayStr = now.toISOString().split("T")[0];

  let weeklyCredit = 0;
  let weeklyPayment = 0;
  let todayCredit = 0;
  let todayPayment = 0;
  let todayCash = 0;
  let todayUPI = 0;

  activeTxs.forEach((tx) => {
    const txDate = new Date(tx.date);
    const amt = Number(tx.amount || 0);

    if (txDate >= sevenDaysAgo) {
      if (tx.type === "CREDIT") weeklyCredit += amt;
      if (tx.type === "PAYMENT") weeklyPayment += amt;
    }

    if (tx.date === todayStr) {
      if (tx.type === "CREDIT") todayCredit += amt;
      if (tx.type === "PAYMENT") {
        todayPayment += amt;
        if (tx.method === "upi" || (tx.note || "").toLowerCase().includes("upi") || (tx.note || "").toLowerCase().includes("gpay")) {
          todayUPI += amt;
        } else {
          todayCash += amt;
        }
      }
    }
  });

  const netWeeklyChange = weeklyCredit - weeklyPayment;

  let takeawayMessage = "";
  if (netWeeklyChange > 0) {
    takeawayMessage = `This week you gave more credit than payments collected, so outstanding increased by ${formatINR(netWeeklyChange)}.`;
  } else if (netWeeklyChange < 0) {
    takeawayMessage = `Great recovery! Payments received exceeded new credit by ${formatINR(Math.abs(netWeeklyChange))}. Outstanding reduced.`;
  } else {
    takeawayMessage = `Credit extended and payments collected are balanced this week.`;
  }

  return {
    totalOutstanding,
    customersWithDues,
    weeklyCredit,
    weeklyPayment,
    netWeeklyChange,
    takeawayMessage,
    todayCredit,
    todayPayment,
    todayCash,
    todayUPI,
    todayNet: todayCredit - todayPayment,
  };
}

/**
 * Calculates single customer running ledger
 */
export function calculateCustomerLedger(
  customerId: string,
  transactions: TransactionRecord[]
): {
  balance: number;
  totalCredit: number;
  totalPayment: number;
  transactions: TransactionRecord[];
} {
  const activeTxs = transactions.filter(
    (t) => t.customerId === customerId && !t.deletedAt
  );

  const totalCredit = activeTxs
    .filter((t) => t.type === "CREDIT")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalPayment = activeTxs
    .filter((t) => t.type === "PAYMENT")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const balance = Math.max(0, totalCredit - totalPayment);

  // Sort chronological descending
  const sorted = [...activeTxs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return {
    balance,
    totalCredit,
    totalPayment,
    transactions: sorted,
  };
}

/**
 * Evaluates debtor status for color-coding dots:
 * Green = recently active/clear (<7 days)
 * Amber = payment due (7-30 days)
 * Red = overdue (>30 days)
 */
export function getDebtorStatus(
  lastDate: string | null | undefined,
  balance: number
): "CLEAR" | "RECENT" | "DUE_SOON" | "OVERDUE" {
  if (balance <= 0) return "CLEAR";
  if (!lastDate) return "DUE_SOON";

  const daysAgo = Math.floor(
    (Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysAgo > 30) return "OVERDUE";
  if (daysAgo > 7) return "DUE_SOON";
  return "RECENT";
}

/**
 * Calculates aggregate ledger metrics for Overview and screens
 */
export function calculateLedgerMetrics(
  customers: CustomerRecord[],
  transactions: TransactionRecord[]
) {
  const computed = calculateCustomerBalances(customers, transactions);
  const dash = computeDashboardMetrics(computed, transactions);

  const topDebtors = computed
    .filter((c) => c.outstanding > 0)
    .sort((a, b) => b.outstanding - a.outstanding)
    .map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone || "",
      balance: c.outstanding,
      lastTxDate: c.lastTransactionDate,
      language: c.language,
    }));

  const customerBalances: Record<string, { balance: number; lastTxDate: string | null }> = {};
  computed.forEach((c) => {
    customerBalances[c.id] = {
      balance: c.outstanding,
      lastTxDate: c.lastTransactionDate || null,
    };
  });

  return {
    totalOutstanding: dash.totalOutstanding,
    creditThisWeek: dash.weeklyCredit,
    paymentsThisWeek: dash.weeklyPayment,
    debtorsCount: dash.customersWithDues,
    topDebtors,
    customerBalances,
  };
}

/**
 * Calculates Roz Ka Hisaab (Daily Closing) breakdown
 */
export function calculateDailyClosing(
  transactions: TransactionRecord[],
  dateStr: string
) {
  const todayTxs = transactions.filter(
    (t) => !t.deletedAt && t.date === dateStr
  );

  let totalCredit = 0;
  let totalPayment = 0;
  let totalCashPayment = 0;
  let totalUpiPayment = 0;

  todayTxs.forEach((tx) => {
    const amt = Number(tx.amount || 0);
    if (tx.type === "CREDIT") {
      totalCredit += amt;
    } else if (tx.type === "PAYMENT") {
      totalPayment += amt;
      const isUpi =
        tx.method === "upi" ||
        (tx.note || "").toLowerCase().includes("upi") ||
        (tx.note || "").toLowerCase().includes("gpay");
      if (isUpi) {
        totalUpiPayment += amt;
      } else {
        totalCashPayment += amt;
      }
    }
  });

  const netChange = totalPayment - totalCredit;

  return {
    totalCredit,
    totalPayment,
    totalCashPayment,
    totalUpiPayment,
    netChange,
    transactionCount: todayTxs.length,
  };
}

