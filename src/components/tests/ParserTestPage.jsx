import React, { useState, useMemo } from "react";
import { CheckCircle2, XCircle, Play, RefreshCw, Sparkles, Filter } from "lucide-react";
import { ruleBasedParse } from "../../services/ParserService";
import { useLedger } from "../../context/LedgerContext";

export function ParserTestPage() {
  const { customers } = useLedger();

  // 30+ Comprehensive Hinglish Test Cases specified in prompt
  const testSuite = [
    { id: 1, input: "Ramesh ne 500 rupaye ka maal liya", expectedType: "CREDIT", expectedAmount: 500, expectedCust: "Ramesh Patil", category: "Standard Udhaar" },
    { id: 2, input: "Ramesh ne 200 diye", expectedType: "PAYMENT", expectedAmount: 200, expectedCust: "Ramesh Patil", category: "Standard Jama" },
    { id: 3, input: "Suresh ko 350 ka udhaar", expectedType: "CREDIT", expectedAmount: 350, expectedCust: "Suresh Khan", category: "Direct Credit" },
    { id: 4, input: "Ramesh ke 500", expectedAmbiguity: "UNCLEAR_TYPE", category: "Ambiguity - Type" },
    { id: 5, input: "Priya ne 2 kilo sugar liya 180 ki", expectedType: "CREDIT", expectedAmount: 180, expectedCust: "Priya Shah", expectedNote: "Sugar", category: "Item Breakdown" },
    { id: 6, input: "रमेश ने 200 दिए", expectedType: "PAYMENT", expectedAmount: 200, expectedCust: "Ramesh Patil", category: "Devanagari Hindi" },
    { id: 7, input: "Ramesh 200 aur Amit 300 de gaye", isMulti: true, expectedCount: 2, category: "Multi-Entry Split" },
    { id: 8, input: "Ramesh bhai ne 500 diye", expectedType: "PAYMENT", expectedAmount: 500, expectedCust: "Ramesh Patil", category: "Alias / Honorific" },
    { id: 9, input: "Amit kal dega", isPromise: true, expectedCust: "Amit Sharma", category: "Promise to Pay" },
    { id: 10, input: "Rahul ne 300 ka maal liya", expectedAmbiguity: "NEW_CUSTOMER", category: "New Customer" },
    { id: 11, input: "Ramesh ne kuch maal liya", expectedAmbiguity: "UNCLEAR_AMOUNT", category: "Ambiguity - Amount" },
    { id: 12, input: "Patil ji ne 1000 cash diya", expectedType: "PAYMENT", expectedAmount: 1000, expectedCust: "Ramesh Patil", category: "Alias Match" },
    { id: 13, input: "Sharma ji ko 450 ka saman", expectedType: "CREDIT", expectedAmount: 450, expectedCust: "Amit Sharma", category: "Alias Match" },
    { id: 14, input: "Imran ne 100 cash diya", expectedType: "PAYMENT", expectedAmount: 100, expectedCust: "Imran Shaikh", category: "Cash Payment" },
    { id: 15, input: "Rajesh ne kal ka 500 pay kiya", expectedType: "PAYMENT", expectedAmount: 500, expectedCust: "Rajesh Yadav", category: "Yesterday Date" },
    { id: 16, input: "Neha bhabhi ne 250 gpay kiya", expectedType: "PAYMENT", expectedAmount: 250, expectedCust: "Neha Gupta", category: "UPI / Online" },
    { id: 17, input: "Suresh bhai paanch sau de gaye", expectedType: "PAYMENT", expectedAmount: 500, expectedCust: "Suresh Khan", category: "Hindi Number (paanch sau)" },
    { id: 18, input: "Rmesh ne 300 diya", expectedType: "PAYMENT", expectedAmount: 300, expectedCust: "Ramesh Patil", category: "Fuzzy Typo Tolerance" },
    { id: 19, input: "Priya ben ko 2k ka rashan", expectedType: "CREDIT", expectedAmount: 2000, expectedCust: "Priya Shah", category: "2k Shorthand" },
    { id: 20, input: "Amit ne dedh sau wapas kiye", expectedType: "PAYMENT", expectedAmount: 150, expectedCust: "Amit Sharma", category: "Hindi Number (dedh sau)" },
    { id: 21, input: "Suresh ko dhai sau ka udhaar likho", expectedType: "CREDIT", expectedAmount: 250, expectedCust: "Suresh Khan", category: "Hindi Number (dhai sau)" },
    { id: 22, input: "Sunita devi ne kal 400 diye", expectedType: "PAYMENT", expectedAmount: 400, category: "Payment + Date" },
    { id: 23, input: "Rajesh Yadav 500 de gaya", expectedType: "PAYMENT", expectedAmount: 500, expectedCust: "Rajesh Yadav", category: "Full Name" },
    { id: 24, input: "Ramesh ne 500 phonepe kiya", expectedType: "PAYMENT", expectedAmount: 500, expectedCust: "Ramesh Patil", category: "UPI Marker" },
    { id: 25, input: "Priya ne 5 packet biscuit 100 rs me liya", expectedType: "CREDIT", expectedAmount: 100, expectedCust: "Priya Shah", category: "Item + Currency rs" },
    { id: 26, input: "Suresh ko ek hazaar rupaye ka udhaar", expectedType: "CREDIT", expectedAmount: 1000, expectedCust: "Suresh Khan", category: "Hindi Word (ek hazaar)" },
    { id: 27, input: "Amit kal 800 dega", isPromise: true, expectedCust: "Amit Sharma", expectedAmount: 800, category: "Promise With Amount" },
    { id: 28, input: "Neha ne 70 rupaye ka doodh liya", expectedType: "CREDIT", expectedAmount: 70, expectedCust: "Neha Gupta", category: "Daily Dairy" },
    { id: 29, input: "Imran bhai parso denge", isPromise: true, expectedCust: "Imran Shaikh", category: "Promise (parso)" },
    { id: 30, input: "Ramesh ne 1200 chukaya", expectedType: "PAYMENT", expectedAmount: 1200, expectedCust: "Ramesh Patil", category: "Hindi (chukaya)" },
    { id: 31, input: "Amit 150 aur Suresh 200 jama kar gaye", isMulti: true, expectedCount: 2, category: "Multi-Entry Payment" },
    { id: 32, input: "Sureh ne 350 rupay diye", expectedType: "PAYMENT", expectedAmount: 350, expectedCust: "Suresh Khan", category: "Fuzzy Typo (Sureh)" },
  ];

  const [customInput, setCustomInput] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Run all tests against ruleBasedParse
  const testResults = useMemo(() => {
    return testSuite.map((test) => {
      const parsed = ruleBasedParse(test.input, customers);
      let passed = true;
      let failureReason = "";

      if (test.isPromise) {
        if (!parsed.isPromise) {
          passed = false;
          failureReason = "Failed to detect promise";
        }
      } else if (test.isMulti) {
        if (!parsed.isMultiEntry || parsed.entries.length !== test.expectedCount) {
          passed = false;
          failureReason = `Expected ${test.expectedCount} entries, got ${parsed.entries?.length || 0}`;
        }
      } else {
        const entry = parsed.entries[0];
        if (!entry) {
          passed = false;
          failureReason = "No entry produced";
        } else {
          if (test.expectedType && entry.type !== test.expectedType) {
            passed = false;
            failureReason = `Type mismatch (expected ${test.expectedType}, got ${entry.type})`;
          }
          if (test.expectedAmount && entry.amount !== test.expectedAmount) {
            passed = false;
            failureReason = `Amount mismatch (expected ${test.expectedAmount}, got ${entry.amount})`;
          }
          if (test.expectedCust && entry.customerRef !== test.expectedCust) {
            passed = false;
            failureReason = `Customer mismatch (expected ${test.expectedCust}, got ${entry.customerRef})`;
          }
          if (test.expectedAmbiguity && !entry.ambiguities.includes(test.expectedAmbiguity)) {
            passed = false;
            failureReason = `Ambiguity mismatch (expected ${test.expectedAmbiguity})`;
          }
        }
      }

      return {
        ...test,
        parsed,
        passed,
        failureReason,
      };
    });
  }, [customers]);

  const passedCount = testResults.filter((t) => t.passed).length;
  const passRate = Math.round((passedCount / testResults.length) * 100);

  // Custom Sentence test result
  const customResult = useMemo(() => {
    if (!customInput.trim()) return null;
    return ruleBasedParse(customInput.trim(), customers);
  }, [customInput, customers]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#E8DFD1] gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-100 text-[#B3261E] text-xs font-bold uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Developer Test Suite • Hinglish NLU Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Parser Test Cases (32 Test Sentences)
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Automated evaluation of deterministic Hinglish parsing, Hindi number words, multi-entry, and promises
          </p>
        </div>

        {/* Score Pill */}
        <div className="flex items-center space-x-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Pass Rate</span>
            <span className="text-2xl font-black text-emerald-700">{passRate}%</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Interactive Custom Test Bar */}
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#E2D9CC] p-4 shadow-xs mb-6">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
          Test Any Custom Hinglish Sentence:
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder='Type anything, e.g. "Ramesh ne dhai sau cash diya"'
            className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:outline-hidden focus:border-[#B3261E]"
          />
          <button
            onClick={() => setCustomInput("Ramesh 200 aur Amit 300 de gaye")}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            Sample Multi
          </button>
        </div>

        {customResult && (
          <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-700">
            <pre className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(customResult, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Test Cases Table */}
      <div className="bg-[#FFFDF8] rounded-2xl border border-[#E2D9CC] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF5ED] border-b border-[#E8DFD1] text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-4">Input Sentence</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-4">Actual Parsed Output</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1ECE1]">
              {testResults.map((t) => (
                <tr key={t.id} className="hover:bg-[#FAF6EE] transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-400">{t.id}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{t.input}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-semibold text-[10px]">
                      {t.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    {t.isPromise ? (
                      <span className="font-semibold text-blue-700">
                        Promise: {t.parsed.promise?.customerRef} ({t.parsed.promise?.dateLabel})
                      </span>
                    ) : t.isMulti ? (
                      <span className="font-semibold text-purple-700">
                        Multi-Entry: {t.parsed.entries?.length} entries ({t.parsed.entries?.map((e) => `${e.customerRef}: ₹${e.amount}`).join(", ")})
                      </span>
                    ) : (
                      <span>
                        <strong className="text-slate-900">{t.parsed.entries?.[0]?.customerRef}</strong> |{" "}
                        <span className={t.parsed.entries?.[0]?.type === "CREDIT" ? "text-red-700 font-bold" : "text-emerald-700 font-bold"}>
                          {t.parsed.entries?.[0]?.type}
                        </span> | ₹{t.parsed.entries?.[0]?.amount}
                        {t.parsed.entries?.[0]?.ambiguities?.length > 0 && (
                          <span className="ml-1 text-amber-700 font-bold">
                            [{t.parsed.entries?.[0]?.ambiguities.join(", ")}]
                          </span>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {t.passed ? (
                      <span className="inline-flex items-center text-emerald-700 font-bold">
                        <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                        PASS
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-700 font-bold" title={t.failureReason}>
                        <XCircle className="w-4 h-4 mr-1 text-red-600" />
                        FAIL
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
