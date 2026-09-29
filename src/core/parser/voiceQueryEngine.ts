import { Customer, Transaction } from '../../db/schema';
import { ProductRecord } from '../inventory/inventoryEngine';
import { formatINR } from '../ledger/ledgerMath';

export interface VoiceQueryAnswer {
  title: string;
  answerText: string;
  spokenText: string;
  badge?: string;
  amount?: number;
}

export function evaluateVoiceQuery(
  rawText: string,
  customers: Customer[],
  transactions: Transaction[],
  products: ProductRecord[]
): VoiceQueryAnswer {
  const lower = rawText.toLowerCase();

  // 1. TODAY'S COLLECTION ("Aaj kitna mila?", "Aaj kitne rupaye aaye?", "How much collected today?")
  if (
    lower.includes('aaj') &&
    (lower.includes('mila') ||
      lower.includes('aaya') ||
      lower.includes('jama') ||
      lower.includes('collection') ||
      lower.includes('received'))
  ) {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayPayments = transactions
      .filter((t) => t.type === 'PAYMENT' && t.date === todayStr)
      .reduce((sum, t) => sum + t.amount, 0);

    const todayCredit = transactions
      .filter((t) => t.type === 'CREDIT' && t.date === todayStr)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      title: 'Aaj Ka Hisaab (Today)',
      badge: 'Aaj Ka Jama',
      amount: todayPayments,
      answerText: `Aaj kul ${formatINR(todayPayments)} jama huye. Aaj ka udhaar ${formatINR(todayCredit)} likha gaya.`,
      spokenText: `Aaj kul ${todayPayments} rupaye jama huye hain, aur ${todayCredit} rupaye ka udhaar likha gaya hai.`,
    };
  }

  // 2. TOTAL OUTSTANDING ("Kul kitna udhaar baaki hai?", "Total dues kitne hain?")
  if (
    lower.includes('kul') ||
    lower.includes('total') ||
    lower.includes('sabka') ||
    (lower.includes('udhaar') && lower.includes('kitna'))
  ) {
    let totalCredit = 0;
    let totalPayment = 0;
    transactions.forEach((t) => {
      if (t.type === 'CREDIT') totalCredit += t.amount;
      if (t.type === 'PAYMENT') totalPayment += t.amount;
    });
    const totalDue = Math.max(0, totalCredit - totalPayment);

    return {
      title: 'Kul Lena Hai (Total Outstanding)',
      badge: 'Bahi-Khata Total',
      amount: totalDue,
      answerText: `Dukaan ka kul ${formatINR(totalDue)} udhaar market me baaki hai.`,
      spokenText: `Dukaan ka kul ${totalDue} rupaye udhaar baaki hai.`,
    };
  }

  // 3. PRODUCT STOCK ("Sugar kitni bachi hai?", "Rice kitna hai?")
  const stockWords = ['sugar', 'cheeni', 'chini', 'rice', 'chawal', 'oil', 'tel', 'atta', 'dal', 'milk', 'doodh', 'tea', 'chai', 'soap', 'sabun'];
  const matchedProdKey = stockWords.find((w) => lower.includes(w));
  if (matchedProdKey) {
    const prod = products.find((p) => p.name.toLowerCase().includes(matchedProdKey));
    if (prod) {
      return {
        title: `${prod.name} Stock`,
        badge: prod.currentStock <= prod.lowStockThreshold ? 'Low Stock' : 'In Stock',
        answerText: `${prod.name} ka stock ${prod.currentStock} ${prod.unit} bacha hai.`,
        spokenText: `${prod.name} ka stock ${prod.currentStock} ${prod.unit} bacha hai.`,
      };
    }
  }

  // 4. CUSTOMER BALANCE ("Ramesh ka kitna baaki hai?", "Amit ke kitne rupaye baaki hain?")
  for (const c of customers) {
    const fn = c.name.split(' ')[0].toLowerCase();
    if (lower.includes(fn) || lower.includes(c.name.toLowerCase())) {
      // Calculate customer balance = sum(CREDIT) - sum(PAYMENT)
      const custTx = transactions.filter((t) => t.customerId === c.id);
      const creditSum = custTx.filter((t) => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
      const paySum = custTx.filter((t) => t.type === 'PAYMENT').reduce((s, t) => s + t.amount, 0);
      const balance = creditSum - paySum;

      if (balance > 0) {
        return {
          title: `${c.name} Ka Khata`,
          badge: 'Udhaar Baaki',
          amount: balance,
          answerText: `${c.name} par kul ${formatINR(balance)} baaki hain.`,
          spokenText: `${c.name} par kul ${balance} rupaye baaki hain.`,
        };
      } else if (balance === 0) {
        return {
          title: `${c.name} Ka Khata`,
          badge: 'Hisaab Chukta',
          amount: 0,
          answerText: `${c.name} ka hisaab poora chukta hai. Koi baaki nahi hai.`,
          spokenText: `${c.name} ka koi udhaar baaki nahi hai. Hisaab chukta hai.`,
        };
      } else {
        return {
          title: `${c.name} Ka Khata`,
          badge: 'Advance Jama',
          amount: Math.abs(balance),
          answerText: `${c.name} ke ${formatINR(Math.abs(balance))} advance jama hain.`,
          spokenText: `${c.name} ke ${Math.abs(balance)} rupaye advance jama hain.`,
        };
      }
    }
  }

  // 5. Fallback help
  return {
    title: 'Puchho Jawaab',
    badge: 'Help',
    answerText: `Aap puchh sakte hain: "Ramesh ka kitna baaki hai?", "Aaj kitna mila?", ya "Sugar kitni bachi hai?".`,
    spokenText: `Aap kisi bhi grahak ka baaki hisaab, aaj ka collection, ya stock puchh sakte hain.`,
  };
}
