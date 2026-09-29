import React from "react";
import { AlertTriangle, Clock, X, Check } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";
import { formatINR } from "../../services/nlpParser";

export function DuplicateWarningModal() {
  const { duplicateWarning, setDuplicateWarning, confirmTransaction } = useLedger();

  if (!duplicateWarning) return null;

  const { duplicateTx, newTxData } = duplicateWarning;

  const handleProceedAnyway = () => {
    confirmTransaction(newTxData, true); // bypassDuplicateCheck = true
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FFFDF9] rounded-2xl shadow-2xl border-2 border-amber-400 overflow-hidden p-6 text-center">
        
        <button
          onClick={() => setDuplicateWarning(null)}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-black text-slate-900">
          Possible Duplicate Entry?
        </h3>

        <p className="text-sm text-slate-600 mt-2">
          An identical transaction of <span className="font-bold text-slate-900">{formatINR(newTxData.amount)}</span> for <span className="font-bold text-slate-900">{newTxData.customerName}</span> was recorded just moments ago.
        </p>

        <div className="my-4 p-3 bg-white rounded-xl border border-slate-200 text-left text-xs text-slate-600 space-y-1">
          <div className="flex items-center text-slate-500">
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span>Previous: {duplicateTx.note || "No note"}</span>
          </div>
          <div>Type: <strong className="capitalize">{duplicateTx.type}</strong></div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => setDuplicateWarning(null)}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-bold text-sm transition-colors cursor-pointer"
          >
            Cancel (Do Not Save)
          </button>

          <button
            type="button"
            onClick={handleProceedAnyway}
            className="flex-1 py-2.5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
          >
            Save Anyway
          </button>
        </div>

      </div>
    </div>
  );
}
