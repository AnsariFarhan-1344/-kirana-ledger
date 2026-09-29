/**
 * HisabAI ParserService
 * Enhanced deterministic rule-based Hinglish, Hindi, and English NLU parsing.
 */

// Hindi spoken number mapping (checked from longest phrase to shortest)
const HINDI_NUMBER_PHRASES = [
  { phrase: "ek hazaar", value: 1000 },
  { phrase: "do hazaar", value: 2000 },
  { phrase: "teen hazaar", value: 3000 },
  { phrase: "paanch hazaar", value: 5000 },
  { phrase: "hazaar", value: 1000 },
  { phrase: "hazar", value: 1000 },
  { phrase: "dedh sau", value: 150 },
  { phrase: "derh sau", value: 150 },
  { phrase: "dhai sau", value: 250 },
  { phrase: "adhai sau", value: 250 },
  { phrase: "sawa sau", value: 125 },
  { phrase: "sawa do sau", value: 225 },
  { phrase: "sadhe teen sau", value: 350 },
  { phrase: "paanch sau", value: 500 },
  { phrase: "panch sau", value: 500 },
  { phrase: "ek sau", value: 100 },
  { phrase: "do sau", value: 200 },
  { phrase: "teen sau", value: 300 },
  { phrase: "chaar sau", value: 400 },
  { phrase: "chhe sau", value: 600 },
  { phrase: "saat sau", value: 700 },
  { phrase: "aath sau", value: 800 },
  { phrase: "nau sau", value: 900 },
  { phrase: "sau", value: 100 },
  { phrase: "pachaas", value: 50 },
  { phrase: "chaalis", value: 40 },
  { phrase: "tees", value: 30 },
  { phrase: "bees", value: 20 },
  { phrase: "das", value: 10 },
];

// Devanagari name transliteration map
const DEVANAGARI_NAMES = {
  "रमेश": "Ramesh Patil",
  "अमित": "Amit Sharma",
  "सुरेश": "Suresh Khan",
  "प्रिया": "Priya Shah",
  "नेहा": "Neha Gupta",
  "इमरान": "Imran Shaikh",
  "राजेश": "Rajesh Yadav",
};

// Payment markers (Money received by shopkeeper)
const PAYMENT_WORDS = [
  "diye", "de diya", "de diye", "de gaya", "de gaye", "diya", "pay", "paid",
  "pay kiya", "cash", "upi", "gpay", "phonepe", "jama", "jama kiya",
  "jama kar gaye", "wapas", "chuka", "chukaya", "bhugtan", "lotaya",
  "दिए", "दिया", "जमा", "भुगतान", "लौटाया"
];

// Credit markers (Udhaar / Goods taken)
const CREDIT_WORDS = [
  "liya", "le gaya", "le gaye", "le gayi", "udhaar", "udhar",
  "baki", "baaki", "maal", "saman", "likh", "likho", "likh do",
  "khareeda", "credit", "dues", "kilo",
  "लिया", "ले गया", "उधार", "बाकी", "सामान", "माल", "लिख"
];

// Promise to pay markers
const PROMISE_WORDS = [
  "dega", "degi", "denge", "de dunga", "parso dega", "kal dega",
  "pay karega", "chuka dega", "clear karega", "parso denge",
  "देगा", "देंगे", "कल देगा"
];

// Items dictionary
const ITEM_WORDS = [
  "sugar", "chini", "cheeni", "atta", "aata", "oil", "tel", "dal", "daal",
  "rice", "chawal", "milk", "doodh", "biscuit", "biscuits", "soap", "sabun",
  "shampoo", "ghee", "masala", "spices", "tea", "chai patti", "cold drink",
  "groceries", "rashan", "ration", "saman", "maal", "kilo", "kg", "packet"
];

/**
 * Extracts numeric value supporting digits, 'k' suffix, and Hindi spoken words
 */
function extractNumberFromText(segment) {
  const lower = segment.toLowerCase();

  // 1. Check Hindi phrases first
  for (const item of HINDI_NUMBER_PHRASES) {
    if (lower.includes(item.phrase)) {
      return item.value;
    }
  }

  // 2. Check 'k' notation (e.g. 2k, 2.5k)
  const kMatch = lower.match(/(\d+(?:\.\d+)?)\s*k\b/i);
  if (kMatch) {
    return parseFloat(kMatch[1]) * 1000;
  }

  // 3. Check currency pattern with digits
  const currMatch = segment.match(/(?:₹|rs\.?|rupaye|rupees|rupay)\s*(\d+)|(\d+)\s*(?:₹|rs\.?|rupaye|rupees|rupay|\/-)/i);
  if (currMatch) {
    return parseFloat(currMatch[1] || currMatch[2]);
  }

  // 4. Standalone numbers
  const numMatches = segment.match(/\b\d+(?:\.\d{1,2})?\b/g);
  if (numMatches && numMatches.length > 0) {
    return Math.max(...numMatches.map(Number));
  }

  return null;
}

/**
 * Normalizes relative dates
 */
function normalizeDate(text) {
  const lower = text.toLowerCase();
  const today = new Date();

  if (lower.includes("kal") && (lower.includes("diya") || lower.includes("liya") || lower.includes("yesterday") || lower.includes("pay kiya"))) {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    return { iso: y.toISOString().split("T")[0], label: "Yesterday" };
  }

  if (lower.includes("kal dega") || lower.includes("tomorrow")) {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    return { iso: t.toISOString().split("T")[0], label: "Tomorrow" };
  }

  if (lower.includes("parso")) {
    const d = new Date(today);
    d.setDate(d.getDate() - 2);
    return { iso: d.toISOString().split("T")[0], label: "2 days ago" };
  }

  return { iso: today.toISOString().split("T")[0], label: "Today" };
}

/**
 * Match customer with names, aliases, surnames, Devanagari, and fuzzy tolerance
 */
function findCustomer(candidateText, customers = []) {
  if (!candidateText) return { matched: null, isNew: true, name: "Customer" };
  let cleanCand = candidateText.trim().replace(/\s+(?:ne|ko|ka|ki|ke|bhai|ben|ji|uncle|aunty|sahab|bhabhi)$/i, "").trim();
  const lowerQuery = cleanCand.toLowerCase();

  // 1. Check Devanagari translation map
  for (const [dev, eng] of Object.entries(DEVANAGARI_NAMES)) {
    if (candidateText.includes(dev)) {
      const found = customers.find((c) => c.name === eng);
      return { matched: found || { id: "cust-1", name: eng, outstanding: 1250 }, isNew: false, name: eng };
    }
  }

  // 2. Direct name, alias, or surname match
  for (const c of customers) {
    const fullName = c.name.toLowerCase();
    const parts = fullName.split(" ");
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];

    if (lowerQuery === fullName || lowerQuery === firstName || lowerQuery === lastName) {
      return { matched: c, isNew: false, name: c.name };
    }

    if (lowerQuery.includes(firstName) || (lastName.length > 2 && lowerQuery.includes(lastName))) {
      return { matched: c, isNew: false, name: c.name };
    }

    if (c.aliases && Array.isArray(c.aliases)) {
      for (const alias of c.aliases) {
        if (lowerQuery.includes(alias.toLowerCase())) {
          return { matched: c, isNew: false, name: c.name };
        }
      }
    }
  }

  // 3. Fuzzy match for 1 character typo
  for (const c of customers) {
    const fn = c.name.split(" ")[0].toLowerCase();
    if (levenshteinDistance(lowerQuery, fn) <= 1) {
      return { matched: c, isNew: false, name: c.name };
    }
  }

  const capitalized = cleanCand.charAt(0).toUpperCase() + cleanCand.slice(1);
  return { matched: null, isNew: true, name: capitalized };
}

function levenshteinDistance(s1, s2) {
  s1 = s1 || "";
  s2 = s2 || "";
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function extractNote(text, type) {
  const lower = text.toLowerCase();
  const items = [];
  ITEM_WORDS.forEach((item) => {
    if (lower.includes(item)) items.push(item);
  });

  if (items.length > 0) {
    let note = items.map((i) => i.charAt(0).toUpperCase() + i.slice(1)).join(", ");
    const qtyMatch = text.match(/(\d+\s*(?:kilo|kg|packet|pack|litres?|l))/i);
    if (qtyMatch) {
      note = `${qtyMatch[0]} ${note}`.trim();
    }
    return note;
  }

  return type === "CREDIT" ? "Kirana सामान / Groceries" : "Payment received (नकद / UPI)";
}

/**
 * Deterministic Rule-Based Parser
 */
export function ruleBasedParse(rawInput, existingCustomers = []) {
  if (!rawInput || typeof rawInput !== "string") {
    return { entries: [], rawText: "" };
  }

  const cleanText = rawInput.trim();
  const lower = cleanText.toLowerCase();

  // 1. CHECK FOR PROMISE TO PAY ("Amit kal dega", "Imran bhai parso denge")
  const isPromise = PROMISE_WORDS.some((pw) => lower.includes(pw));
  if (isPromise) {
    const custCandidate = cleanText.split(/\s+/)[0];
    const customerInfo = findCustomer(custCandidate, existingCustomers);
    const amount = extractNumberFromText(cleanText) || (customerInfo.matched ? customerInfo.matched.outstanding : 500);
    const dateInfo = normalizeDate(cleanText);

    return {
      rawText: cleanText,
      isPromise: true,
      promise: {
        customerRef: customerInfo.name,
        customerId: customerInfo.matched?.id || null,
        amount,
        promiseDate: dateInfo.iso,
        dateLabel: dateInfo.label,
        status: "pending",
        note: `Promise to pay ${dateInfo.label}`,
      },
      entries: [],
    };
  }

  // 2. CHECK FOR MULTI-ENTRY ("Ramesh 200 aur Amit 300 de gaye")
  const multiSplitRegex = /\s+(?:aur|and|tatha|&)\s+/i;
  if (multiSplitRegex.test(cleanText) && (lower.includes("diye") || lower.includes("liya") || lower.includes("de gaye") || lower.includes("jama"))) {
    const parts = cleanText.split(multiSplitRegex);
    if (parts.length >= 2) {
      const globalType = PAYMENT_WORDS.some((pw) => lower.includes(pw)) ? "PAYMENT" : "CREDIT";
      const entries = [];

      parts.forEach((part) => {
        const words = part.trim().split(/\s+/);
        if (words.length > 0) {
          const custWord = words[0];
          const custInfo = findCustomer(custWord, existingCustomers);
          const amt = extractNumberFromText(part);

          if (amt) {
            entries.push({
              customerRef: custInfo.name,
              customerId: custInfo.matched?.id || null,
              isNewCustomer: custInfo.isNew,
              amount: amt,
              type: globalType,
              date: new Date().toISOString().split("T")[0],
              dateLabel: "Today",
              note: globalType === "PAYMENT" ? "Payment received" : "Kirana सामान",
              confidence: 0.95,
              ambiguities: [],
            });
          }
        }
      });

      if (entries.length >= 2) {
        return { rawText: cleanText, isMultiEntry: true, entries };
      }
    }
  }

  // 3. SINGLE TRANSACTION PARSING
  const dateInfo = normalizeDate(cleanText);
  const amount = extractNumberFromText(cleanText);

  // Determine Type & Direction
  let type = null;
  const paymentScore = PAYMENT_WORDS.filter((kw) => lower.includes(kw)).length;
  const creditScore = CREDIT_WORDS.filter((kw) => lower.includes(kw)).length;

  const ambiguities = [];

  if (paymentScore > creditScore) {
    type = "PAYMENT";
  } else if (creditScore > paymentScore) {
    type = "CREDIT";
  } else {
    type = "CREDIT";
    ambiguities.push("UNCLEAR_TYPE");
  }

  if (!amount || amount <= 0) {
    ambiguities.push("UNCLEAR_AMOUNT");
  }

  // Extract Customer
  let candidateName = "";
  for (const devName of Object.keys(DEVANAGARI_NAMES)) {
    if (cleanText.includes(devName)) {
      candidateName = devName;
      break;
    }
  }

  if (!candidateName) {
    // Look for first word or first pair of words before particle
    const words = cleanText.split(/\s+/);
    if (words.length > 0) {
      if (words[0].toLowerCase() === "aaj" || words[0].toLowerCase() === "kal") {
        candidateName = words[1] || "Customer";
      } else {
        candidateName = words[0];
        if (words[1] && ["bhai", "ji", "ben", "sahab", "bhabhi", "yadav", "patil", "sharma", "khan", "gupta", "shaikh", "shah"].includes(words[1].toLowerCase())) {
          candidateName = `${words[0]} ${words[1]}`;
        }
      }
    }
  }

  const customerInfo = findCustomer(candidateName, existingCustomers);
  if (customerInfo.isNew) {
    ambiguities.push("NEW_CUSTOMER");
  }

  const note = extractNote(cleanText, type);
  const confidence = ambiguities.length > 0 ? 0.65 : 0.96;

  return {
    rawText: cleanText,
    isPromise: false,
    entries: [
      {
        customerRef: customerInfo.name,
        customerId: customerInfo.matched?.id || null,
        isNewCustomer: customerInfo.isNew,
        amount: amount || 0,
        type, // 'CREDIT' | 'PAYMENT'
        date: dateInfo.iso,
        dateLabel: dateInfo.label,
        note,
        confidence,
        ambiguities,
      },
    ],
  };
}

export class ParserService {
  constructor(options = {}) {
    this.useGemini = options.useGemini || false;
  }

  async parse(input, existingCustomers = []) {
    return ruleBasedParse(input, existingCustomers);
  }
}

export const parserService = new ParserService();
