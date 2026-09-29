/**
 * Kirana Ledger Hinglish NLP Parser
 * Interprets natural voice and text input in Hinglish, Hindi, and English for kirana transactions.
 */

// Common words indicating a PAYMENT (Jama / Money received by shopkeeper)
const PAYMENT_KEYWORDS = [
  "diya", "diye", "de diya", "de diye", "pay", "paid", "payment",
  "jama", "jama kiya", "chuka", "chukaya", "wapas", "wapas kiya",
  "cash diya", "gpay", "phonepe", "upi kiya", "lotaya", "bhugtan"
];

// Common words indicating a CREDIT (Udhaar / Goods taken, customer owes money)
const CREDIT_KEYWORDS = [
  "maal liya", "saman liya", "liya", "liye", "le gaya", "le gayi",
  "udhaar", "udhar", "baki", "baaki", "likh", "likho", "likh do",
  "likhna", "khareeda", "credit", "dues", "sugar liya", "atta liya",
  "oil liya", "ration liya", "kirana liya", "pack liya", "kilo"
];

// Common items to extract as notes
const ITEM_KEYWORDS = [
  "sugar", "chini", "cheeni", "atta", "aata", "oil", "tel", "dal", "daal",
  "rice", "chawal", "milk", "doodh", "biscuit", "biscuits", "soap", "sabun",
  "shampoo", "ghee", "masala", "spices", "tea", "chai patti", "cold drink",
  "groceries", "rashan", "ration", "saman", "maal", "kilo", "kg", "packet"
];

/**
 * Parses conversational natural text into a structured transaction proposal
 * @param {string} text Raw input string (Hinglish/Hindi/English)
 * @param {Array} existingCustomers List of current customers for entity matching
 * @returns {Object} Parsed interpretation with ambiguity flags
 */
export function parseKiranaInput(text, existingCustomers = []) {
  if (!text || typeof text !== "string") {
    return {
      isValid: false,
      rawText: "",
      error: "Empty input",
    };
  }

  const rawText = text.trim();
  const lowerText = rawText.toLowerCase();

  // 1. EXTRACT AMOUNT
  // Matches: ₹500, 500rs, 500 rupaye, 500/- , 500
  let amount = null;
  let isAmountUnclear = false;

  // Check for vague/unclear amount words first
  const vagueAmountWords = ["kuch", "thoda", "kuch saman", "kuch maal", "some", "a few"];
  const hasVagueAmount = vagueAmountWords.some((w) => lowerText.includes(w));

  // Regex patterns for Indian currency formats
  const amountPatterns = [
    /(?:₹|rs\.?|inr|rupaye|rupees)?\s*(\d{1,7}(?:,\d{2,3})*(?:\.\d{1,2})?)\s*(?:₹|rs\.?|inr|rupaye|rupees|\/-)?/i,
  ];

  // Try extracting explicit numbers
  const numberMatches = rawText.match(/\b\d+(?:\.\d{1,2})?\b/g);
  if (numberMatches && numberMatches.length > 0) {
    // If multiple numbers (e.g. "2 kilo sugar 180 rupaye"), choose the currency associated one or the largest realistic one
    if (numberMatches.length === 1) {
      amount = parseFloat(numberMatches[0]);
    } else {
      // Find number closest to 'rupaye', 'rs', '₹' or last number
      const currencyPattern = /(?:₹|rs\.?|rupaye|rupees)\s*(\d+)|(\d+)\s*(?:₹|rs\.?|rupaye|rupees)/i;
      const currMatch = rawText.match(currencyPattern);
      if (currMatch) {
        amount = parseFloat(currMatch[1] || currMatch[2]);
      } else {
        // Fallback: pick the largest number (usually the price, not quantity like 2 kilo)
        amount = Math.max(...numberMatches.map(Number));
      }
    }
  } else if (hasVagueAmount || !numberMatches) {
    isAmountUnclear = true;
  }

  // 2. EXTRACT DATE
  let date = new Date().toISOString().split("T")[0]; // default today
  let dateLabel = "Today";

  if (lowerText.includes("kal") || lowerText.includes("yesterday")) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    date = yesterday.toISOString().split("T")[0];
    dateLabel = "Yesterday";
  } else if (lowerText.includes("parso") || lowerText.includes("day before yesterday")) {
    const dayBefore = new Date();
    dayBefore.setDate(dayBefore.getDate() - 2);
    date = dayBefore.toISOString().split("T")[0];
    dateLabel = "2 days ago";
  } else if (lowerText.includes("aaj") || lowerText.includes("today")) {
    dateLabel = "Today";
  }

  // 3. EXTRACT TRANSACTION TYPE (Credit vs Payment)
  let type = null; // 'credit' | 'payment'
  let isTypeUnclear = false;

  const paymentScore = PAYMENT_KEYWORDS.filter((kw) => lowerText.includes(kw)).length;
  const creditScore = CREDIT_KEYWORDS.filter((kw) => lowerText.includes(kw)).length;

  if (paymentScore > creditScore) {
    type = "payment";
  } else if (creditScore > paymentScore) {
    type = "credit";
  } else {
    // If score tied or 0, check specific context
    if (lowerText.includes("de diya") || lowerText.includes("diya") || lowerText.includes("paid")) {
      type = "payment";
    } else if (lowerText.includes("liya") || lowerText.includes("udhaar") || lowerText.includes("baki")) {
      type = "credit";
    } else {
      // E.g. "Ramesh ke 500" -> transaction type is completely ambiguous!
      isTypeUnclear = true;
      type = "credit"; // tentative fallback
    }
  }

  // 4. EXTRACT CUSTOMER NAME
  let matchedCustomer = null;
  let customerName = "";
  let isNewCustomer = false;

  // Check existing customers first (fuzzy / case-insensitive)
  for (const cust of existingCustomers) {
    const firstName = cust.name.split(" ")[0].toLowerCase();
    const fullName = cust.name.toLowerCase();

    if (lowerText.includes(fullName) || lowerText.includes(firstName)) {
      matchedCustomer = cust;
      customerName = cust.name;
      break;
    }
  }

  // If no existing customer matched, extract candidate name from Hinglish sentence
  if (!matchedCustomer) {
    // Names usually precede "ne", "ko", "ka", "ki", "ke", "bhai", "ji", etc.
    const nameRegex = /^\s*([a-zA-Z\u0900-\u097F]+)(?:\s+(?:ne|ko|ka|ki|ke|bhai|ji|uncle|aunty|sahab))?/i;
    const nameMatch = rawText.match(nameRegex);

    if (nameMatch && nameMatch[1]) {
      const candidate = nameMatch[1].trim();
      // Ensure candidate is not a common noise word
      const noiseWords = ["aaj", "kal", "ek", "do", "kuch", "yeh", "woh", "cash", "upi", "please", "bolke", "add", "likh"];
      if (!noiseWords.includes(candidate.toLowerCase())) {
        customerName = candidate.charAt(0).toUpperCase() + candidate.slice(1).toLowerCase();
        isNewCustomer = true;
      }
    }

    if (!customerName) {
      // Fallback: take the first word as candidate
      const firstWord = rawText.split(/\s+/)[0];
      if (firstWord && firstWord.length > 1) {
        customerName = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
        isNewCustomer = true;
      } else {
        customerName = "Unknown Customer";
      }
    }
  }

  // 5. EXTRACT NOTE / ITEMS
  let note = "";
  // Check for items mention
  const foundItems = [];
  ITEM_KEYWORDS.forEach((item) => {
    if (lowerText.includes(item)) {
      foundItems.push(item);
    }
  });

  if (foundItems.length > 0) {
    note = foundItems.map((i) => i.charAt(0).toUpperCase() + i.slice(1)).join(", ");
    if (lowerText.includes("kilo") || lowerText.includes("kg")) {
      const qtyMatch = rawText.match(/(\d+\s*(?:kilo|kg|packet|litres?|l))/i);
      if (qtyMatch) {
        note = `${qtyMatch[0]} ${note}`.trim();
      }
    }
  } else {
    note = type === "credit" ? "Groceries / Kirana सामान" : "Payment received (नकद / UPI)";
  }

  return {
    rawText,
    isValid: Boolean(customerName && !isAmountUnclear && !isTypeUnclear),
    customer: {
      id: matchedCustomer ? matchedCustomer.id : null,
      name: matchedCustomer ? matchedCustomer.name : customerName,
      isExisting: Boolean(matchedCustomer),
      phone: matchedCustomer ? matchedCustomer.phone : "",
      currentBalance: matchedCustomer ? matchedCustomer.outstanding : 0,
    },
    amount: amount || 0,
    type, // 'credit' (Udhaar) or 'payment' (Jama)
    date,
    dateLabel,
    note,
    // Ambiguity flags:
    isNewCustomer,
    isAmountUnclear,
    isTypeUnclear,
    confidence: isNewCustomer || isAmountUnclear || isTypeUnclear ? 0.65 : 0.98,
  };
}

/**
 * Format currency in Indian numbering system (e.g. ₹24,850)
 */
export function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return "₹0";
  const num = Math.round(Number(val));
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}
