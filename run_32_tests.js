import { ruleBasedParse } from "./src/services/ParserService.js";
import { initialCustomers } from "./src/data/seedData.js";

console.log("=== RUNNING FULL 32 TEST CASES SUITE ===");

const suite = [
  { id: 1, input: "Ramesh ne 500 rupaye ka maal liya", expectedType: "CREDIT", expectedAmount: 500, expectedCust: "Ramesh Patil" },
  { id: 2, input: "Ramesh ne 200 diye", expectedType: "PAYMENT", expectedAmount: 200, expectedCust: "Ramesh Patil" },
  { id: 3, input: "Suresh ko 350 ka udhaar", expectedType: "CREDIT", expectedAmount: 350, expectedCust: "Suresh Khan" },
  { id: 4, input: "Ramesh ke 500", expectedAmbiguity: "UNCLEAR_TYPE" },
  { id: 5, input: "Priya ne 2 kilo sugar liya 180 ki", expectedType: "CREDIT", expectedAmount: 180, expectedCust: "Priya Shah" },
  { id: 6, input: "रमेश ने 200 दिए", expectedType: "PAYMENT", expectedAmount: 200, expectedCust: "Ramesh Patil" },
  { id: 7, input: "Ramesh 200 aur Amit 300 de gaye", isMulti: true, expectedCount: 2 },
  { id: 8, input: "Ramesh bhai ne 500 diye", expectedType: "PAYMENT", expectedAmount: 500, expectedCust: "Ramesh Patil" },
  { id: 9, input: "Amit kal dega", isPromise: true, expectedCust: "Amit Sharma" },
  { id: 10, input: "Rahul ne 300 ka maal liya", expectedAmbiguity: "NEW_CUSTOMER" },
  { id: 11, input: "Ramesh ne kuch maal liya", expectedAmbiguity: "UNCLEAR_AMOUNT" },
  { id: 12, input: "Patil ji ne 1000 cash diya", expectedType: "PAYMENT", expectedAmount: 1000, expectedCust: "Ramesh Patil" },
  { id: 13, input: "Sharma ji ko 450 ka saman", expectedType: "CREDIT", expectedAmount: 450, expectedCust: "Amit Sharma" },
  { id: 14, input: "Imran ne 100 cash diya", expectedType: "PAYMENT", expectedAmount: 100, expectedCust: "Imran Shaikh" },
  { id: 15, input: "Rajesh ne kal ka 500 pay kiya", expectedType: "PAYMENT", expectedAmount: 500, expectedCust: "Rajesh Yadav" },
  { id: 16, input: "Neha bhabhi ne 250 gpay kiya", expectedType: "PAYMENT", expectedAmount: 250, expectedCust: "Neha Gupta" },
  { id: 17, input: "Suresh bhai paanch sau de gaye", expectedType: "PAYMENT", expectedAmount: 500, expectedCust: "Suresh Khan" },
  { id: 18, input: "Rmesh ne 300 diya", expectedType: "PAYMENT", expectedAmount: 300, expectedCust: "Ramesh Patil" },
  { id: 19, input: "Priya ben ko 2k ka rashan", expectedType: "CREDIT", expectedAmount: 2000, expectedCust: "Priya Shah" },
  { id: 20, input: "Amit ne dedh sau wapas kiye", expectedType: "PAYMENT", expectedAmount: 150, expectedCust: "Amit Sharma" },
  { id: 21, input: "Suresh ko dhai sau ka udhaar likho", expectedType: "CREDIT", expectedAmount: 250, expectedCust: "Suresh Khan" },
  { id: 22, input: "Sunita devi ne kal 400 diye", expectedType: "PAYMENT", expectedAmount: 400 },
  { id: 23, input: "Rajesh Yadav 500 de gaya", expectedType: "PAYMENT", expectedAmount: 500, expectedCust: "Rajesh Yadav" },
  { id: 24, input: "Ramesh ne 500 phonepe kiya", expectedType: "PAYMENT", expectedAmount: 500, expectedCust: "Ramesh Patil" },
  { id: 25, input: "Priya ne 5 packet biscuit 100 rs me liya", expectedType: "CREDIT", expectedAmount: 100, expectedCust: "Priya Shah" },
  { id: 26, input: "Suresh ko ek hazaar rupaye ka udhaar", expectedType: "CREDIT", expectedAmount: 1000, expectedCust: "Suresh Khan" },
  { id: 27, input: "Amit kal 800 dega", isPromise: true, expectedCust: "Amit Sharma", expectedAmount: 800 },
  { id: 28, input: "Neha ne 70 rupaye ka doodh liya", expectedType: "CREDIT", expectedAmount: 70, expectedCust: "Neha Gupta" },
  { id: 29, input: "Imran bhai parso denge", isPromise: true, expectedCust: "Imran Shaikh" },
  { id: 30, input: "Ramesh ne 1200 chukaya", expectedType: "PAYMENT", expectedAmount: 1200, expectedCust: "Ramesh Patil" },
  { id: 31, input: "Amit 150 aur Suresh 200 jama kar gaye", isMulti: true, expectedCount: 2 },
  { id: 32, input: "Sureh ne 350 rupay diye", expectedType: "PAYMENT", expectedAmount: 350, expectedCust: "Suresh Khan" },
];

let passed = 0;
suite.forEach((test) => {
  const parsed = ruleBasedParse(test.input, initialCustomers);
  let ok = true;
  let reason = "";

  if (test.isPromise) {
    if (!parsed.isPromise) { ok = false; reason = "Not detected as promise"; }
  } else if (test.isMulti) {
    if (!parsed.isMultiEntry || parsed.entries?.length !== test.expectedCount) {
      ok = false; reason = "Multi entry count mismatch";
    }
  } else {
    const entry = parsed.entries[0];
    if (!entry) { ok = false; reason = "No entry"; }
    else {
      if (test.expectedType && entry.type !== test.expectedType) { ok = false; reason = `Type ${entry.type} != ${test.expectedType}`; }
      if (test.expectedAmount && entry.amount !== test.expectedAmount) { ok = false; reason = `Amt ${entry.amount} != ${test.expectedAmount}`; }
      if (test.expectedCust && entry.customerRef !== test.expectedCust) { ok = false; reason = `Cust ${entry.customerRef} != ${test.expectedCust}`; }
      if (test.expectedAmbiguity && !entry.ambiguities.includes(test.expectedAmbiguity)) { ok = false; reason = `Ambiguity missing`; }
    }
  }

  if (ok) {
    passed++;
  } else {
    console.log(`Failed #${test.id} "${test.input}": ${reason}`);
  }
});

console.log(`\nResults: ${passed} / ${suite.length} Passed (${Math.round((passed / suite.length) * 100)}%)`);
