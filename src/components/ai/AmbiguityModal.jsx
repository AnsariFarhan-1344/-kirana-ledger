import React, { useState } from "react";
import { UserPlus, Users, HelpCircle, DollarSign, ArrowUpRight, ArrowDownLeft, X, Check } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";

export function AmbiguityModal() {
  const {
    ambiguityData,
    setAmbiguityData,
    customers,
    addCustomer,
    confirmTransaction,
    setPendingInterpretation,
  } = useLedger();

  // State for new customer resolution
  const [newCustPhone, setNewCustPhone] = useState("");
  const [selectedExistingId, setSelectedExistingId] = useState("");

  // State for amount clarification
  const [clarifiedAmount, setClarifiedAmount] = useState("");

  if (!ambiguityData) return null;

  const { type, candidateName, customerName, amount, parsed, source } = ambiguityData;

  // 1. RESOLVE NEW CUSTOMER
  const handleAddNewCustomerAndProceed = () => {
    const created = addCustomer({
      name: candidateName,
      phone: newCustPhone || "+91 98200 00000",
    });

    if (created) {
      setAmbiguityData(null);
      // Proceed to normal interpretation confirmation card
      setPendingInterpretation({
        ...parsed,
        customer: {
          id: created.id,
          name: created.name,
          phone: created.phone,
          isExisting: true,
          currentBalance: 0,
        },
        source,
      });
    }
  };

  const handleSelectExistingAndProceed = () => {
    const matched = customers.find((c) => c.id === selectedExistingId);
    if (matched) {
      setAmbiguityData(null);
      setPendingInterpretation({
        ...parsed,
        customer: {
          id: matched.id,
          name: matched.name,
          phone: matched.phone,
          isExisting: true,
          currentBalance: matched.outstanding,
        },
        source,
      });
    }
  };

  // 2. RESOLVE UNCLEAR AMOUNT
  const handleClarifyAmountAndProceed = (selectedAmt) => {
    const finalAmt = parseFloat(selectedAmt || clarifiedAmount);
    if (!finalAmt || isNaN(finalAmt)) return;

    setAmbiguityData(null);
    setPendingInterpretation({
      ...parsed,
      amount: finalAmt,
      isAmountUnclear: false,
      source,
    });
  };

  // 3. RESOLVE UNCLEAR TYPE
  const handleClarifyTypeAndProceed = (chosenType) => {
    setAmbiguityData(null);
    setPendingInterpretation({
      ...parsed,
      type: chosenType,
      isTypeUnclear: false,
      source,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FFFDF9] rounded-2xl shadow-2xl border-2 border-amber-300 overflow-hidden">
        
        {/* Header */}
        <div className="bg-amber-50 px-6 py-4 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Action Required • Clarification
              </span>
              <p className="text-xs text-amber-700 font-medium">
                Kirana Ledger avoids guessing critical financial info
              </p>
            </div>
          </div>

          <button
            onClick={() => setAmbiguityData(null)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Transcript Context */}
        <div className="px-6 pt-4 pb-2 bg-[#FAF8F5] border-b border-[#E8DFD1]">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Original Message:
          </span>
          <p className="text-sm font-semibold text-slate-800 italic">
            "{parsed?.rawText}"
          </p>
        </div>

        <div className="p-6">
          {/* CASE 1: NEW CUSTOMER DETECTED */}
          {type === "new_customer" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  New customer detected
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  <span className="font-bold text-[#991B1B]">{candidateName}</span> isn't in your ledger yet. Would you like to add them or map to an existing customer?
                </p>
              </div>

              {/* Option A: Add new customer */}
              <div className="p-4 rounded-xl bg-white border border-[#E8DFD1] shadow-2xs space-y-3">
                <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
                  <UserPlus className="w-4 h-4 text-[#991B1B]" />
                  <span>Add "{candidateName}" as New Customer</span>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Phone number (optional):</label>
                  <input
                    type="tel"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="+91 98..."
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium focus:outline-hidden focus:border-[#991B1B]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddNewCustomerAndProceed}
                  className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-lg bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Add {candidateName} & Continue</span>
                </button>
              </div>

              {/* Option B: Choose existing */}
              <div className="p-4 rounded-xl bg-white border border-[#E8DFD1] shadow-2xs space-y-3">
                <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Or choose existing customer:</span>
                </div>
                <select
                  value={selectedExistingId}
                  onChange={(e) => setSelectedExistingId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium focus:outline-hidden focus:border-[#991B1B]"
                >
                  <option value="">Select customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - Outstanding ₹{c.outstanding}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!selectedExistingId}
                  onClick={handleSelectExistingAndProceed}
                  className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors ${
                    selectedExistingId
                      ? "bg-slate-800 hover:bg-slate-900 text-white cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Use Selected Customer
                </button>
              </div>
            </div>
          )}

          {/* CASE 2: UNCLEAR AMOUNT */}
          {type === "unclear_amount" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  How much was the transaction?
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  We identified customer <span className="font-bold text-slate-900">{customerName}</span>, but the exact amount wasn't mentioned clearly.
                </p>
              </div>

              {/* Quick Amount Suggestion Chips */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Quick Select Amount:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[50, 100, 200, 350, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleClarifyAmountAndProceed(amt)}
                      className="py-2.5 px-3 rounded-lg border border-[#DACFBF] bg-white hover:bg-amber-50 hover:border-amber-400 font-black text-slate-800 text-sm transition-all shadow-2xs active:scale-95 cursor-pointer"
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom amount entry */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Or enter specific amount:
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={clarifiedAmount}
                      onChange={(e) => setClarifiedAmount(e.target.value)}
                      placeholder="e.g. 420"
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 font-bold text-base focus:outline-hidden focus:border-[#991B1B]"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!clarifiedAmount}
                    onClick={() => handleClarifyAmountAndProceed()}
                    className={`px-5 py-2 rounded-lg font-bold text-sm shadow-xs ${
                      clarifiedAmount
                        ? "bg-[#991B1B] hover:bg-[#7F1D1D] text-white cursor-pointer"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CASE 3: UNCLEAR TRANSACTION TYPE */}
          {type === "unclear_type" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Is this credit or payment?
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  For <span className="font-bold text-slate-900">{customerName}</span> (₹{amount || parsed?.amount}): Did they take goods on udhaar or did they pay money?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Credit Button */}
                <button
                  type="button"
                  onClick={() => handleClarifyTypeAndProceed("credit")}
                  className="p-4 rounded-xl border-2 border-red-200 bg-red-50/60 hover:bg-red-100 hover:border-red-400 text-left transition-all active:scale-98 cursor-pointer group"
                >
                  <div className="flex items-center space-x-2 text-red-700 font-black text-base">
                    <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    <span>Credit / Udhaar (उधार)</span>
                  </div>
                  <p className="text-xs text-red-900/80 mt-1.5 font-medium leading-relaxed">
                    Customer took goods. They owe ₹{amount || parsed?.amount}.
                  </p>
                </button>

                {/* Payment Button */}
                <button
                  type="button"
                  onClick={() => handleClarifyTypeAndProceed("payment")}
                  className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 hover:border-emerald-400 text-left transition-all active:scale-98 cursor-pointer group"
                >
                  <div className="flex items-center space-x-2 text-emerald-700 font-black text-base">
                    <ArrowDownLeft className="w-5 h-5 group-hover:-translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
                    <span>Payment / Jama (जमा)</span>
                  </div>
                  <p className="text-xs text-emerald-900/80 mt-1.5 font-medium leading-relaxed">
                    Customer paid money. Reduces balance by ₹{amount || parsed?.amount}.
                  </p>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
