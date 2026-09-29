import { Customer, Transaction } from '../../db/schema';
import { formatINR } from './ledgerMath';

export type BharosaStatus =
  | 'SAMAY_PAR'
  | 'KABHI_KABHI_DER'
  | 'AKSAR_DER'
  | 'NAYA_CUSTOMER';

export interface BharosaBadgeInfo {
  status: BharosaStatus;
  label: string;
  color: string;
  bg: string;
  ruleExplanation: string;
}

/**
 * Derives authentic Bharosa Badge based ONLY on actual transaction & payment history.
 * Rule:
 * - New customer (< 2 transactions or 0 payments): "Naya Customer"
 * - On-time payments (ratio >= 0.75): "Samay par deta hai"
 * - 0.40 <= ratio < 0.75: "Kabhi kabhi der"
 * - ratio < 0.40 or overdue > 45 days: "Aksar der"
 */
export function calculateBharosaBadge(
  customer: Customer,
  transactions: Transaction[]
): BharosaBadgeInfo {
  const custTx = transactions.filter((t) => t.customerId === customer.id);
  const credits = custTx.filter((t) => t.type === 'CREDIT');
  const payments = custTx.filter((t) => t.type === 'PAYMENT');

  if (credits.length === 0 && payments.length === 0) {
    return {
      status: 'NAYA_CUSTOMER',
      label: 'Naya Customer',
      color: '#0284C7',
      bg: '#E0F2FE',
      ruleExplanation: 'Abhi tak koi purana len-den record nahi hai.',
    };
  }

  if (payments.length === 0) {
    // Has credit but never paid anything yet
    const oldestCredit = credits.sort((a, b) => a.date.localeCompare(b.date))[0];
    const daysSince = oldestCredit ? getDaysSince(oldestCredit.date) : 0;
    if (daysSince > 30) {
      return {
        status: 'AKSAR_DER',
        label: 'Aksar der',
        color: '#DC2626',
        bg: '#FEE2E2',
        ruleExplanation: 'Pehla udhaar 30 din se zyada purana hai aur koi payment nahi aayi.',
      };
    }
    return {
      status: 'NAYA_CUSTOMER',
      label: 'Naya Customer',
      color: '#0284C7',
      bg: '#E0F2FE',
      ruleExplanation: 'Haal hi me naya hisaab shuru hua hai.',
    };
  }

  // Calculate payment punctuality
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalCredit = credits.reduce((sum, c) => sum + c.amount, 0);
  const balance = totalCredit - totalPaid;

  // Check oldest unpaid age
  const now = new Date();
  let maxOverdueDays = 0;
  if (balance > 0 && credits.length > 0) {
    const lastPaymentDate = payments.sort((a, b) => b.date.localeCompare(a.date))[0]?.date;
    const refDate = lastPaymentDate || credits[0].date;
    maxOverdueDays = getDaysSince(refDate);
  }

  if (maxOverdueDays > 45) {
    return {
      status: 'AKSAR_DER',
      label: 'Aksar der',
      color: '#DC2626',
      bg: '#FEE2E2',
      ruleExplanation: 'Pichhle payment ke baad 45 din se zyada ho gaye hain.',
    };
  }

  if (maxOverdueDays > 20) {
    return {
      status: 'KABHI_KABHI_DER',
      label: 'Kabhi kabhi der',
      color: '#D97706',
      bg: '#FEF3C7',
      ruleExplanation: 'Udhaar aam taur par 20 se 45 din me chukta hota hai.',
    };
  }

  return {
    status: 'SAMAY_PAR',
    label: 'Samay par deta hai',
    color: '#16A34A',
    bg: '#DCFCE7',
    ruleExplanation: 'Har len-den samay par chukta hota hai (20 din ke andar).',
  };
}

function getDaysSince(isoDateString: string): number {
  try {
    const target = new Date(isoDateString).getTime();
    const diff = Date.now() - target;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Fuzzy matches duplicate customer names before creating a new one (E1)
 */
export function findPotentialDuplicateCustomers(
  candidateName: string,
  customers: Customer[]
): Customer | null {
  const clean = candidateName
    .replace(/(?:bhai|ji|ben|sahab|bhabhi|patil|sharma|khan|uncle|aunty)$/i, '')
    .trim()
    .toLowerCase();

  if (!clean || clean.length < 2) return null;

  for (const c of customers) {
    const cName = c.name.toLowerCase();
    const cClean = cName
      .replace(/(?:bhai|ji|ben|sahab|bhabhi|patil|sharma|khan|uncle|aunty)$/i, '')
      .trim();

    if (cClean === clean) return c;
    if (cName.includes(clean) || clean.includes(cClean)) return c;

    // Check aliases
    if (c.aliases && c.aliases.length > 0) {
      for (const alias of c.aliases) {
        const aClean = alias.toLowerCase().trim();
        if (aClean === clean || aClean.includes(clean)) return c;
      }
    }
  }

  return null;
}

/**
 * Computes Paisa Fasa Hai breakdown (F4)
 */
export function calculatePaisaFasaHai(
  customers: Customer[],
  transactions: Transaction[]
): {
  totalFasa: number;
  purana30Din: number;
  customersCount: number;
  displayText: string;
} {
  let totalFasa = 0;
  let purana30Din = 0;
  let customersWithDues = 0;

  for (const c of customers) {
    const custTx = transactions.filter((t) => t.customerId === c.id);
    const cr = custTx.filter((t) => t.type === 'CREDIT');
    const pay = custTx.filter((t) => t.type === 'PAYMENT').reduce((s, t) => s + t.amount, 0);
    const totalCredit = cr.reduce((s, t) => s + t.amount, 0);
    const bal = Math.max(0, totalCredit - pay);

    if (bal > 0) {
      totalFasa += bal;
      customersWithDues++;

      // Check credits older than 30 days
      const oldCredits = cr.filter((t) => getDaysSince(t.date) > 30);
      const oldSum = oldCredits.reduce((s, t) => s + t.amount, 0);
      purana30Din += Math.min(bal, oldSum);
    }
  }

  const displayText = `${formatINR(totalFasa)} udhaar me fasa hai. Isme ${formatINR(purana30Din)} 30 din se purana hai.`;

  return {
    totalFasa,
    purana30Din,
    customersCount: customersWithDues,
    displayText,
  };
}
