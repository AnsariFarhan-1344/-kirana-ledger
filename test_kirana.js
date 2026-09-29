import { parseKiranaInput } from "./src/services/nlpParser.js";
import { generateReminderMessage } from "./src/services/reminderService.js";
import { initialCustomers } from "./src/data/seedData.js";

console.log("=== TESTING KIRANA LEDGER NLP & SERVICES ===");

const testCases = [
  {
    input: "Ramesh ne 200 rupaye ka maal liya",
    expectedName: "Ramesh Patil",
    expectedType: "credit",
    expectedAmount: 200,
  },
  {
    input: "Amit ne kal ka 500 de diya",
    expectedName: "Amit Sharma",
    expectedType: "payment",
    expectedAmount: 500,
    expectedDate: "Yesterday",
  },
  {
    input: "Suresh ko 350 ka udhaar likh",
    expectedName: "Suresh Khan",
    expectedType: "credit",
    expectedAmount: 350,
  },
  {
    input: "Ramesh ne 100 cash diya",
    expectedName: "Ramesh Patil",
    expectedType: "payment",
    expectedAmount: 100,
  },
  {
    input: "Priya ne 2 kilo sugar liya 180 rupaye ki",
    expectedName: "Priya Shah",
    expectedType: "credit",
    expectedAmount: 180,
  },
  {
    input: "Rahul ne 300 ka maal liya",
    expectedNewCustomer: true,
    expectedCandidate: "Rahul",
  },
  {
    input: "Ramesh ne kuch maal liya",
    expectedAmountUnclear: true,
  },
  {
    input: "Ramesh ke 500",
    expectedTypeUnclear: true,
  },
];

let passed = 0;
testCases.forEach((tc, idx) => {
  const res = parseKiranaInput(tc.input, initialCustomers);
  console.log(`\nTest #${idx + 1}: "${tc.input}"`);
  console.log(` -> Parsed:`, {
    customer: res.customer.name,
    amount: res.amount,
    type: res.type,
    isNewCustomer: res.isNewCustomer,
    isAmountUnclear: res.isAmountUnclear,
    isTypeUnclear: res.isTypeUnclear,
    note: res.note,
  });

  let testPass = true;
  if (tc.expectedName && res.customer.name !== tc.expectedName) testPass = false;
  if (tc.expectedType && res.type !== tc.expectedType) testPass = false;
  if (tc.expectedAmount && res.amount !== tc.expectedAmount) testPass = false;
  if (tc.expectedNewCustomer && !res.isNewCustomer) testPass = false;
  if (tc.expectedAmountUnclear && !res.isAmountUnclear) testPass = false;
  if (tc.expectedTypeUnclear && !res.isTypeUnclear) testPass = false;

  if (testPass) {
    console.log(` [PASSED]`);
    passed++;
  } else {
    console.error(` [FAILED]`);
  }
});

console.log(`\n--- Test Results: ${passed} / ${testCases.length} Passed ---\n`);

console.log("=== TESTING SMART REMINDERS ===");
const reminderHinglish = generateReminderMessage({
  customerName: "Ramesh Patil",
  outstandingAmount: 1250,
  language: "hinglish",
  tone: "polite",
});
console.log("Hinglish:\n", reminderHinglish);

const reminderHindi = generateReminderMessage({
  customerName: "Ramesh Patil",
  outstandingAmount: 1250,
  language: "hindi",
  tone: "polite",
});
console.log("\nHindi:\n", reminderHindi);

const reminderEnglish = generateReminderMessage({
  customerName: "Ramesh Patil",
  outstandingAmount: 1250,
  language: "english",
  tone: "polite",
});
console.log("\nEnglish:\n", reminderEnglish);
