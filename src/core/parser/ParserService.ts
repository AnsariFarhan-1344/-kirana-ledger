/**
 * HisabAI Core NLU Parser Service (Framework-free TypeScript)
 * Supports Hinglish, Hindi, Marathi, and English.
 */

export interface ParsedItem {
  name: string;
  qty: number;
  unit: string;
  price?: number;
}

export interface ParsedEntry {
  customerRef: string;
  customerId?: string | null;
  isNewCustomer?: boolean;
  amount: number;
  type: "CREDIT" | "PAYMENT" | "UNKNOWN";
  method: "cash" | "upi" | "unspecified";
  date: string;
  dateLabel: string;
  items: ParsedItem[];
  note: string;
  confidence: number;
  ambiguities: string[];
}

export interface ParseResult {
  rawText: string;
  isValid: boolean;
  validationError?: string;
  isQuestion?: boolean;
  isPromise?: boolean;
  isMultiEntry?: boolean;
  promiseCustomer?: string;
  promiseDate?: string;
  promiseNote?: string;
  promise?: {
    customerRef: string;
    customerId?: string | null;
    amount: number;
    promiseDate: string;
    dateLabel: string;
    status: "pending";
    note: string;
  };
  entries: ParsedEntry[];
}

export interface CustomerLookup {
  id: string;
  name: string;
  phone?: string;
  aliases?: string[];
  outstanding?: number;
}

// Spoken number words mapping (Hindi, Marathi, English)
const NUMBER_WORDS: Array<{ phrase: string; value: number }> = [
  // Multi-word / compound numbers
  { phrase: "ek hazaar", value: 1000 },
  { phrase: "do hazaar", value: 2000 },
  { phrase: "teen hazaar", value: 3000 },
  { phrase: "paanch hazaar", value: 5000 },
  { phrase: "ek hazar", value: 1000 },
  { phrase: "एक हजार", value: 1000 },
  { phrase: "दोन हजार", value: 2000 },
  { phrase: "पाच हजार", value: 5000 },
  { phrase: "hazaar", value: 1000 },
  { phrase: "hazar", value: 1000 },
  { phrase: "हजार", value: 1000 },
  { phrase: "thousand", value: 1000 },

  // Half-hundred and special fractions (Hindi & Marathi)
  { phrase: "dedh sau", value: 150 },
  { phrase: "derh sau", value: 150 },
  { phrase: "dhai sau", value: 250 },
  { phrase: "adhai sau", value: 250 },
  { phrase: "sawa sau", value: 125 },
  { phrase: "sava sau", value: 125 },
  { phrase: "sawa do sau", value: 225 },
  { phrase: "sava do sau", value: 225 },
  { phrase: "sadhe teen sau", value: 350 },
  { phrase: "दीडशे", value: 150 },
  { phrase: "अडीचशे", value: 250 },
  { phrase: "साडेतीनशे", value: 350 },

  // Hundreds
  { phrase: "paanch sau", value: 500 },
  { phrase: "panch sau", value: 500 },
  { phrase: "पाँच सौ", value: 500 },
  { phrase: "पाचशे", value: 500 },
  { phrase: "five hundred", value: 500 },
  { phrase: "chaar sau", value: 400 },
  { phrase: "चारशे", value: 400 },
  { phrase: "four hundred", value: 400 },
  { phrase: "teen sau", value: 300 },
  { phrase: "तीनशे", value: 300 },
  { phrase: "three hundred", value: 300 },
  { phrase: "do sau", value: 200 },
  { phrase: "दोनशे", value: 200 },
  { phrase: "two hundred", value: 200 },
  { phrase: "ek sau", value: 100 },
  { phrase: "sau", value: 100 },
  { phrase: "शंभर", value: 100 },
  { phrase: "one hundred", value: 100 },
  { phrase: "one fifty", value: 150 },

  // Tens & units
  { phrase: "pachaas", value: 50 },
  { phrase: "पन्नास", value: 50 },
  { phrase: "fifty", value: 50 },
  { phrase: "chaalis", value: 40 },
  { phrase: "चाळीस", value: 40 },
  { phrase: "forty", value: 40 },
  { phrase: "tees", value: 30 },
  { phrase: "तीस", value: 30 },
  { phrase: "thirty", value: 30 },
  { phrase: "bees", value: 20 },
  { phrase: "वीस", value: 20 },
  { phrase: "twenty", value: 20 },
  { phrase: "das", value: 10 },
  { phrase: "दहा", value: 10 },
  { phrase: "ten", value: 10 },
];

// Devanagari script names mapping
const DEVANAGARI_MAP: Record<string, string> = {
  "रमेश": "Ramesh",
  "अमित": "Amit",
  "सुरेश": "Suresh",
  "प्रिया": "Priya",
  "नेहा": "Neha",
  "इमरान": "Imran",
  "राजेश": "Rajesh",
};

// Payment keywords (Money received by shopkeeper)
const PAYMENT_MARKERS = [
  "diye", "de diya", "de diye", "de gaya", "de gaye", "diya", "pay", "paid",
  "pay kiya", "cash", "upi", "gpay", "phonepe", "jama", "jama kiya",
  "jama kar gaye", "wapas", "chuka", "chukaya", "chukta", "bhugtan", "lotaya",
  "gave me", "received from", "settled",
  "दिए", "दिया", "जमा", "भुगतान", "लौटाया", "दिले", "दिला", "भरले", "दिलेले"
];

// Credit keywords (Udhaar / Goods taken)
const CREDIT_MARKERS = [
  "liya", "le gaya", "le gaye", "le gayi", "udhaar", "udhar",
  "baki", "baaki", "maal", "saman", "likh", "likho", "likh do",
  "khareeda", "credit", "dues", "took", "bought", "give credit",
  "i gave", "gave credit to",
  "लिया", "ले गया", "उधार", "बाकी", "सामान", "माल", "लिख",
  "घेतला", "घेतले", "उधारी", "खरेदी"
];

// Promise to pay markers
const PROMISE_MARKERS = [
  "dega", "degi", "denge", "de dunga", "parso dega", "kal dega",
  "pay karega", "chuka dega", "clear karega", "parso denge",
  "will pay", "promised to pay", "deil", "देईल", "देणार",
  "देगा", "देंगे", "कल देगा"
];

// Known Kirana Product catalogue for item extraction
const PRODUCT_DICT = [
  { name: "sugar", unit: "kg", synonyms: ["sugar", "chini", "cheeni", "साखर"] },
  { name: "rice", unit: "kg", synonyms: ["rice", "chawal", "तांदूळ", "basmati"] },
  { name: "oil", unit: "L", synonyms: ["oil", "tel", "fortune oil", "तेल"] },
  { name: "atta", unit: "kg", synonyms: ["atta", "aata", "flour", "गहू पीठ"] },
  { name: "dal", unit: "kg", synonyms: ["dal", "daal", "toor dal", "चणा डाळ", "तूर डाळ"] },
  { name: "milk", unit: "L", synonyms: ["milk", "doodh", "दूध"] },
  { name: "tea", unit: "packet", synonyms: ["tea", "chai", "chai patti", "चहा"] },
  { name: "biscuit", unit: "packet", synonyms: ["biscuit", "biscuits", "parle-g", "बिस्कीट"] },
  { name: "soap", unit: "pcs", synonyms: ["soap", "sabun", "साबण"] },
  { name: "ghee", unit: "kg", synonyms: ["ghee", "तूप"] },
  { name: "salt", unit: "packet", synonyms: ["salt", "namak", "मीठ"] },
];

/**
 * Normalizes numbers from string (supporting words, 2k notation, Devanagari numerals)
 */
export function extractAmount(text: string): number | null {
  const lower = text.toLowerCase();

  // 0. Explicit total (e.g. "total 640 udhaar", "kul 500")
  const totalMatch = text.match(/(?:total|kul|ekun|एकूण|कुल)\s*(\d+)/i);
  if (totalMatch) return parseFloat(totalMatch[1]);

  // 1. Spoken number words
  for (const item of NUMBER_WORDS) {
    if (lower.includes(item.phrase)) {
      return item.value;
    }
  }

  // 2. 'k' shorthand (e.g. 2k, 2.5k)
  const kMatch = lower.match(/(\d+(?:\.\d+)?)\s*k\b/i);
  if (kMatch) {
    return parseFloat(kMatch[1]) * 1000;
  }

  // 3. Indian currency format with currency symbols
  const currMatch = text.match(/(?:₹|rs\.?|rupaye|rupees|rupay|रुपये|रुपयांचा)\s*(\d+)|(\d+)\s*(?:₹|rs\.?|rupaye|rupees|rupay|रुपये|रुपयांचा|\/-)/i);
  if (currMatch) {
    return parseFloat(currMatch[1] || currMatch[2]);
  }

  // 4. Standalone numbers (skip small quantities if larger total amount is present)
  const numMatches = text.match(/\b\d+(?:\.\d{1,2})?\b/g);
  if (numMatches && numMatches.length > 0) {
    const nums = numMatches.map(Number);
    // If the sentence mentions "total 640", pick 640
    const totalMatch = text.match(/total\s*(\d+)/i);
    if (totalMatch) return parseFloat(totalMatch[1]);
    return Math.max(...nums);
  }

  return null;
}

/**
 * Normalizes relative dates (aaj, kal, parso, yesterday, tomorrow, explicit)
 */
export function extractDate(text: string): { iso: string; label: string } {
  const lower = text.toLowerCase();
  const today = new Date();

  if (
    lower.includes("kal dega") ||
    lower.includes("tomorrow") ||
    lower.includes("उद्या")
  ) {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    return { iso: t.toISOString().split("T")[0], label: "Tomorrow" };
  }

  if (
    lower.includes("kal") ||
    lower.includes("yesterday") ||
    lower.includes("काल")
  ) {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    return { iso: y.toISOString().split("T")[0], label: "Yesterday" };
  }

  if (lower.includes("parso") || lower.includes("परवा")) {
    const p = new Date(today);
    p.setDate(p.getDate() - 2);
    return { iso: p.toISOString().split("T")[0], label: "2 days ago" };
  }

  return { iso: today.toISOString().split("T")[0], label: "Today" };
}

export const INVALID_CUSTOMER_WORDS = new Set([
  'hello', 'hi', 'hey', 'namaste', 'pranam', 'salaam', 'test', 'testing', 'ok', 'okay',
  'ha', 'haan', 'theek', 'kuch', 'bhi', 'kya', 'kaun', 'kaise', 'sab', 'kuchbhi',
  'aaj', 'kal', 'parso', 'today', 'yesterday', 'tomorrow',
  'rs', 'rs.', 'rupaye', 'rupees', 'rupay', 'रुपये', 'रुपयांचा', 'total', 'kul', 'ekun',
  'jama', 'udhaar', 'udhar', 'cash', 'upi', 'gpay', 'phonepe',
  'maal', 'saman', 'item', 'items', 'kilo', 'kg', 'packet', 'litre', 'liter',
  'sugar', 'rice', 'oil', 'atta', 'dal', 'milk', 'tea', 'soap', 'ghee', 'salt'
]);

/**
 * Match customer considering Marathi suffixes, Devanagari, aliases, and fuzzy typos
 */
export function matchCustomer(candidate: string, customers: CustomerLookup[] = []): {
  matched: CustomerLookup | null;
  isNew: boolean;
  name: string;
} {
  if (!candidate) return { matched: null, isNew: true, name: '' };

  // Strip particles and Marathi suffixes: -ने, -ला, -चा, ne, ko, ka, ki, ke, bhai, ji, ben, sahab
  let clean = candidate
    .replace(/(?:ने|ला|चा|ची|चे)$/, '')
    .replace(/\s+(?:ne|ko|ka|ki|ke|bhai|ben|ji|uncle|aunty|sahab|bhabhi)$/i, '')
    .trim();

  const lowerClean = clean.toLowerCase();
  if (
    !clean ||
    clean.length < 2 ||
    /^\d+$/.test(clean) ||
    INVALID_CUSTOMER_WORDS.has(lowerClean)
  ) {
    return { matched: null, isNew: true, name: '' };
  }

  // 1. Devanagari translation
  for (const [dev, eng] of Object.entries(DEVANAGARI_MAP)) {
    if (candidate.includes(dev)) {
      const found = customers.find((c) => c.name === eng);
      return { matched: found || { id: 'cust-1', name: eng }, isNew: false, name: eng };
    }
  }

  const query = clean.toLowerCase();

  // 2. Direct match or alias match
  for (const c of customers) {
    const fullName = c.name.toLowerCase();
    const parts = fullName.split(' ');
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];

    if (query === fullName || query === firstName || query === lastName) {
      return { matched: c, isNew: false, name: c.name };
    }

    if (query.includes(firstName) || (lastName.length > 2 && query.includes(lastName))) {
      return { matched: c, isNew: false, name: c.name };
    }

    if (c.aliases && Array.isArray(c.aliases)) {
      for (const a of c.aliases) {
        if (query.includes(a.toLowerCase())) {
          return { matched: c, isNew: false, name: c.name };
        }
      }
    }
  }

  // 3. Fuzzy matching for 1 typo
  for (const c of customers) {
    const fn = c.name.split(' ')[0].toLowerCase();
    if (levenshtein(query, fn) <= 1) {
      return { matched: c, isNew: false, name: c.name };
    }
  }

  const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
  return { matched: null, isNew: true, name: capitalized };
}

function levenshtein(a: string, b: string): number {
  a = a || "";
  b = b || "";
  const m = a.length;
  const n = b.length;
  const d: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) d[i][j] = d[i - 1][j - 1];
      else d[i][j] = 1 + Math.min(d[i - 1][j], d[i][j - 1], d[i - 1][j - 1]);
    }
  }
  return d[m][n];
}

/**
 * Extracts items and quantities (e.g. "2 kilo sugar 180 ki")
 */
export function extractItems(text: string): ParsedItem[] {
  const lower = text.toLowerCase();
  const items: ParsedItem[] = [];

  for (const prod of PRODUCT_DICT) {
    const matchedSyn = prod.synonyms.find((s) => lower.includes(s));
    if (matchedSyn) {
      // Look for quantity before product name: "2 kilo sugar", "1 oil"
      const qtyRegex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(?:kilo|kg|packet|pack|l|litre|litres|pcs)?\\s*${matchedSyn}`, "i");
      const match = text.match(qtyRegex);
      const qty = match ? parseFloat(match[1]) : 1;

      items.push({
        name: prod.name.charAt(0).toUpperCase() + prod.name.slice(1),
        qty,
        unit: prod.unit,
      });
    }
  }

  return items;
}

const QUESTION_MARKERS = [
  'kitna', 'kitni', 'kitne', 'kya hai', 'kya bacha', 'bachi hai', 'bacha hai',
  'baki hai', 'baaki hai', 'shillak', 'shilak', 'kiti ahe', 'kiti ahet',
  'how much', 'what is', 'how many',
  'कितना', 'कितनी', 'कितने', 'बाकी है', 'किती बाकी', 'किती शिल्लक', '?'
];

/**
 * Core Deterministic Rule-Based Parser (Pure TypeScript)
 */
export function parseHinglishTransaction(input: string, customers: CustomerLookup[] = []): ParseResult {
  if (!input || typeof input !== "string" || !input.trim()) {
    return { rawText: "", isValid: false, validationError: "Kripya kuch likhein ya bolein", entries: [] };
  }

  const rawText = input.trim();
  const lower = rawText.toLowerCase();

  // 0. VOICE QUERY / QUESTION ("Ramesh ka kitna baaki hai?", "Aaj kitna mila?", "Sugar kitni bachi hai?")
  const isQuestion = QUESTION_MARKERS.some((qm) => lower.includes(qm));
  if (isQuestion) {
    return {
      rawText,
      isValid: true,
      isQuestion: true,
      entries: [],
    };
  }

  // 1. PROMISE TO PAY ("Amit kal dega", "Imran bhai parso denge")
  const isPromise = PROMISE_MARKERS.some((pm) => lower.includes(pm));
  if (isPromise) {
    const custWord = rawText.split(/\s+/)[0];
    const custInfo = matchCustomer(custWord, customers);
    const amount = extractAmount(rawText) || (custInfo.matched?.outstanding || 500);
    const dateInfo = extractDate(rawText);
    const isValid = !!custInfo.name && custInfo.name.length >= 2;

    return {
      rawText,
      isValid,
      validationError: isValid ? undefined : "Promise ke liye grahak (customer) ka naam batayein",
      isPromise: true,
      promiseCustomer: custInfo.name,
      promiseDate: dateInfo.iso,
      promiseNote: `Promise to pay ${dateInfo.label}`,
      promise: {
        customerRef: custInfo.name,
        customerId: custInfo.matched?.id || null,
        amount,
        promiseDate: dateInfo.iso,
        dateLabel: dateInfo.label,
        status: "pending",
        note: `Promise to pay ${dateInfo.label}`,
      },
      entries: [],
    };
  }

  // 2. MULTI-ENTRY SPLIT ("Ramesh 200 aur Amit 300 de gaye")
  const multiSplit = /\s+(?:aur|and|tatha|&|आणि)\s+/i;
  const isItemized = lower.includes("kilo") || lower.includes("total") || lower.includes("litre") || lower.includes("packet");
  if (!isItemized && multiSplit.test(rawText) && (PAYMENT_MARKERS.some((p) => lower.includes(p)) || CREDIT_MARKERS.some((c) => lower.includes(c)))) {
    const parts = rawText.split(multiSplit);
    const hasItems = parts.some((p) => {
      const firstW = p.trim().split(/\s+/)[0]?.toLowerCase();
      return !isNaN(Number(firstW)) || ["kilo", "kg", "oil", "sugar", "rice", "packet", "litre"].includes(firstW);
    });

    if (parts.length >= 2 && !hasItems) {
      const globalType: "CREDIT" | "PAYMENT" = PAYMENT_MARKERS.some((p) => lower.includes(p)) ? "PAYMENT" : "CREDIT";
      const entries: ParsedEntry[] = [];

      parts.forEach((part) => {
        const words = part.trim().split(/\s+/);
        if (words.length > 0) {
          const custInfo = matchCustomer(words[0], customers);
          const amt = extractAmount(part);
          if (amt) {
            entries.push({
              customerRef: custInfo.name,
              customerId: custInfo.matched?.id || null,
              isNewCustomer: custInfo.isNew,
              amount: amt,
              type: globalType,
              method: lower.includes("upi") ? "upi" : lower.includes("cash") ? "cash" : "unspecified",
              date: new Date().toISOString().split("T")[0],
              dateLabel: "Today",
              items: [],
              note: globalType === "PAYMENT" ? "Payment received" : "Kirana सामान",
              confidence: 0.95,
              ambiguities: [],
            });
          }
        }
      });

      if (entries.length >= 2) {
        return { rawText, isValid: true, isMultiEntry: true, entries };
      }
    }
  }

  // 3. SINGLE TRANSACTION PARSING
  const amount = extractAmount(rawText);
  const dateInfo = extractDate(rawText);
  const items = extractItems(rawText);

  // Direction & Type determination:
  let type: "CREDIT" | "PAYMENT" | "UNKNOWN" = "CREDIT";
  let isAmbiguousType = false;

  const paymentScore = PAYMENT_MARKERS.filter((kw) => lower.includes(kw)).length;
  const creditScore = CREDIT_MARKERS.filter((kw) => lower.includes(kw)).length;

  if (
    lower.includes("maal") ||
    lower.includes("माल") ||
    lower.includes("saman") ||
    lower.includes("सामान") ||
    lower.includes("किराणा") ||
    lower.includes("udhaar") ||
    lower.includes("उधार") ||
    lower.includes("घेतला") ||
    lower.includes("घेतले")
  ) {
    type = "CREDIT";
  } else if (lower.includes("gave me") || lower.includes("received from")) {
    type = "PAYMENT";
  } else if (lower.includes("i gave") || lower.includes("gave credit")) {
    type = "CREDIT";
  } else if (paymentScore > creditScore) {
    type = "PAYMENT";
  } else if (creditScore > paymentScore) {
    type = "CREDIT";
  } else {
    // E.g. "Ramesh ke 500"
    type = "UNKNOWN";
    isAmbiguousType = true;
  }

  const ambiguities: string[] = [];
  if (isAmbiguousType) ambiguities.push("UNCLEAR_TYPE");
  if (!amount || amount <= 0) ambiguities.push("UNCLEAR_AMOUNT");

  // Extract Customer candidate
  let candidateWord = "";
  for (const devName of Object.keys(DEVANAGARI_MAP)) {
    if (rawText.includes(devName)) {
      candidateWord = devName;
      break;
    }
  }

  if (!candidateWord) {
    const rawWords = rawText.split(/\s+/);
    const skipWords = new Set([
      'aaj', 'kal', 'parso', 'today', 'yesterday', 'tomorrow', 'total', 'kul', 'ekun',
      'rs', 'rs.', 'rupaye', 'rupees', 'rupay', 'रुपये', 'रुपयांचा', '₹', 'udhaar', 'udhar',
      'jama', 'cash', 'upi', 'gpay', 'phonepe', 'diya', 'diye', 'liya', 'le', 'gaya', 'gaye', 'gayi',
      'took', 'bought', 'give', 'gave', 'paid', 'pay', 'i', 'me', 'to', 'for', 'ko', 'ne', 'ka', 'ki', 'ke',
      'kilo', 'kg', 'litre', 'liter', 'packet', 'pcs', 'pack', 'sugar', 'rice', 'oil', 'atta', 'dal', 'milk', 'tea',
      'hisaab', 'hisab'
    ]);

    for (let i = 0; i < rawWords.length; i++) {
      const w = rawWords[i];
      const lowerW = w.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]/gi, '');
      if (!lowerW) continue;
      if (/^\d+k?$/i.test(lowerW)) continue;
      if (NUMBER_WORDS.some((nw) => nw.phrase === lowerW)) continue;
      if (skipWords.has(lowerW)) continue;

      candidateWord = w;
      if (rawWords[i + 1]) {
        const nextW = rawWords[i + 1].toLowerCase().replace(/[^a-z0-9]/gi, '');
        if (['traders', 'agency', 'stores', 'bhai', 'ji', 'ben', 'sahab', 'bhabhi', 'patil', 'sharma', 'khan', 'shah', 'gupta', 'yadav'].includes(nextW)) {
          candidateWord = `${w} ${rawWords[i + 1]}`;
        }
      }
      break;
    }
  }

  const custInfo = matchCustomer(candidateWord, customers);
  const hasValidCustomer = !!custInfo.name && custInfo.name.length >= 2;
  const hasValidAmount = typeof amount === 'number' && amount > 0;
  const isValid = hasValidCustomer && hasValidAmount;

  let validationError: string | undefined = undefined;
  if (!isValid) {
    if (!hasValidCustomer && !hasValidAmount) {
      validationError = "Customer ka naam aur rupaye dono hone chahiye (Jaise: 'Ramesh 500 udhaar' ya 'Amit 200 jama')";
    } else if (!hasValidCustomer) {
      validationError = `Kripya grahak (customer) ka naam batayein (Jaise: Ramesh ne ₹${amount} diye)`;
    } else {
      validationError = `Kitne rupaye ka hisaab hai? (Jaise: ${custInfo.name} ko ₹500 udhaar)`;
    }
  }

  if (custInfo.isNew && hasValidCustomer) {
    ambiguities.push("NEW_CUSTOMER");
  }

  // Method detection (Cash / UPI)
  const method: "cash" | "upi" | "unspecified" = lower.includes("upi") || lower.includes("gpay") || lower.includes("phonepe")
    ? "upi"
    : lower.includes("cash")
    ? "cash"
    : "unspecified";

  // Note generation
  let note = "";
  if (items.length > 0) {
    note = items.map((i) => `${i.qty} ${i.unit} ${i.name}`).join(", ");
  } else {
    note = type === "CREDIT" ? "Kirana सामान / Groceries" : `Payment received (${method === "upi" ? "UPI" : "नकद / Cash"})`;
  }

  const confidence = ambiguities.length > 0 ? 0.65 : 0.96;

  return {
    rawText,
    isValid,
    validationError,
    isPromise: false,
    entries: [
      {
        customerRef: custInfo.name || "Customer",
        customerId: custInfo.matched?.id || null,
        isNewCustomer: custInfo.isNew,
        amount: amount || 0,
        type,
        method,
        date: dateInfo.iso,
        dateLabel: dateInfo.label,
        items,
        note,
        confidence,
        ambiguities,
      },
    ],
  };
}

export class ParserService {
  private useLLM: boolean;

  constructor(useLLM = false) {
    this.useLLM = useLLM;
  }

  public parse(input: string, customers: CustomerLookup[] = []): ParseResult {
    return parseHinglishTransaction(input, customers);
  }
}

export const parserService = new ParserService();

export const parseSentenceToEntry = (
  input: string,
  customers: CustomerLookup[] = []
): ParseResult => {
  return parserService.parse(input, customers);
};
