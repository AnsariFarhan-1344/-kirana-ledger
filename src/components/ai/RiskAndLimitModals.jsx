import React, { useState } from "react";
import { AlertCircle, AlertTriangle, ShieldAlert, X, Check, Edit2 } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";
import { formatINR } from "../../services/nlpParser";

export function RiskAndLimitModals() {
  const {
    overpaymentWarning,
    setOverpaymentWarning,
    creditLimitWarning,
    setCreditLimitWarning,
    confirmTransaction,
    setPendingInterpretation,
  } = useLedger();

  const [customAdvanceAmount, setCustomAdvanceAmount] = useState("");

  // 1. OVERPAYMENT HANDLER
  if (overpaymentWarning) {
    const { customer, paymentAmount, outstanding, excess, entry, source } = overpaymentWarning;

    const handleKeepAsAdvance = () => {
      confirmTransaction({
        customerId: customer.id,
        customerName: customer.name,
        amount: paymentAmount,
        type: "PAYMENT",
        date: entry.date,
        note: `Payment (with ₹${excess} advance balance)`,
        source,
      }, true);
      setOverpaymentWarning(null);
    };

    const handleEditAmount = () => {
      setOverpaymentWarning(null);
      // Open in standard interpretation card for manual editing
      setPendingInterpretation({
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
        },
        amount: outstanding, // default to exact outstanding
        type: "PAYMENT",
        date: entry.date,
        dateLabel: "Today",
        note: "Settled exact dues",
        rawText: entry.note || "",
        source,
      });
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-[#FFFDF8] rounded-2xl shadow-2xl border-2 border-emerald-400 p-6 text-center">
          
          <button
            onClick={() => setOverpaymentWarning(null)}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-black text-slate-900">
            Payment Exceeds Outstanding Dues
          </h3>

          <p className="text-sm text-slate-600 mt-2">
            <span className="font-bold text-slate-900">{customer.name}</span> currently owes <span className="font-bold text-slate-900">{formatINR(outstanding)}</span>, but is paying <span className="font-bold text-emerald-700">{formatINR(paymentAmount)}</span>.
          </p>

          <div className="my-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-900">
            {formatINR(excess)} extra hai. Isse advance ke roop mein rakhein?
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleKeepAsAdvance}
              className="w-full py-2.5 bg-[#1E7D4F] hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              ✓ Keep as Advance for Next Purchase
            </button>

            <button
              type="button"
              onClick={handleEditAmount}
              className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Edit Amount to Exact Due ({formatINR(outstanding)})
            </button>

            <button
              type="button"
              onClick={() => setOverpaymentWarning(null)}
              className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 2. CREDIT LIMIT WARNING
  if (creditLimitWarning) {
    const { customer, currentDue, newAmount, creditLimit, entry, source } = creditLimitWarning;

    const handleAllowOnce = () => {
      confirmTransaction({
        customerId: customer.id,
        customerName: customer.name,
        amount: newAmount,
        type: "CREDIT",
        date: entry.date,
        note: `${entry.note} (Exceeded credit limit override)`,
        source,
      }, true);
      setCreditLimitWarning(null);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-[#FFFDF8] rounded-2xl shadow-2xl border-2 border-red-400 p-6 text-center">
          
          <button
            onClick={() => setCreditLimitWarning(null)}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-full bg-red-100 text-[#B3261E] flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-black text-slate-900">
            {customer.name} is near credit limit
          </h3>

          <p className="text-sm text-slate-600 mt-2">
            Credit limit is <span className="font-bold text-slate-900">{formatINR(creditLimit)}</span>. Current balance is <span className="font-bold text-[#B3261E]">{formatINR(currentDue)}</span>. Adding {formatINR(newAmount)} will exceed their limit by {formatINR(currentDue + newAmount - creditLimit)}.
          </p>

          <div className="flex items-center space-x-3 pt-6">
            <button
              type="button"
              onClick={() => setCreditLimitWarning(null)}
              className="flex-1 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleAllowOnce}
              className="flex-1 py-2.5 bg-[#B3261E] hover:bg-[#8F1D16] text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Allow Once
            </button>
          </div>

        </div>
      </div>
    );
  }

  return null;
}
