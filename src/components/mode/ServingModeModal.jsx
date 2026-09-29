import React, { useState } from "react";
import { Mic, X, Check, Trash2, ArrowRight, Zap, ListOrdered, Sparkles, User, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";
import { audioService } from "../../services/audioService";
import { formatINR } from "../../services/nlpParser";

export function ServingModeModal() {
  const {
    isServingMode,
    setIsServingMode,
    servingDrafts,
    setServingDrafts,
    confirmTransaction,
    interpretInput,
    showToast,
  } = useLedger();

  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [quickInput, setQuickInput] = useState("");

  if (!isServingMode) return null;

  const handleStartListening = () => {
    setIsListening(true);
    setLiveTranscript("");

    audioService.startListening({
      onInterim: (text) => setLiveTranscript(text),
      onFinal: (text) => {
        setLiveTranscript(text);
        setIsListening(false);
        interpretInput(text, "voice");
      },
      onError: (err) => {
        console.warn("Serving mode mic error:", err);
        setIsListening(false);
      },
      onEnd: () => setIsListening(false),
    });
  };

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    interpretInput(quickInput.trim(), "text");
    setQuickInput("");
  };

  const handleConfirmAll = () => {
    if (servingDrafts.length === 0) return;
    const count = servingDrafts.length;

    servingDrafts.forEach((draft) => {
      confirmTransaction({
        customerId: draft.customerId || "cust-1",
        customerName: draft.customerRef,
        amount: draft.amount,
        type: draft.type,
        date: draft.date,
        note: draft.note,
        source: draft.source || "voice",
      }, true); // bypass duplicate warning during batch confirm
    });

    setServingDrafts([]);
    showToast(`✓ Confirmed all ${count} draft transactions to ledger`, "success");
    setIsServingMode(false);
  };

  const handleDeleteDraft = (index) => {
    setServingDrafts((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1F2340] text-white flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-[#B3261E] flex items-center justify-center font-bold">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Serving Mode (ग्राहक सेवा मोड)
            </h2>
            <p className="text-xs text-slate-400">
              Distraction-free queue • Speak transactions hands-free during rush hours
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsServingMode(false)}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Center Action Area: Giant Tap Once to Speak */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full my-6 text-center">
        
        {/* Giant Microphone Button */}
        <div className="relative mb-6">
          {isListening && (
            <>
              <div className="absolute inset-0 -m-6 rounded-full bg-red-600/30 animate-ping" />
              <div className="absolute inset-0 -m-3 rounded-full bg-red-600/50 animate-pulse" />
            </>
          )}

          <button
            type="button"
            onClick={handleStartListening}
            className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all active:scale-95 cursor-pointer border-4 ${
              isListening
                ? "bg-[#B3261E] border-red-300 text-white scale-105"
                : "bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200"
            }`}
          >
            <Mic className={`w-12 h-12 sm:w-16 sm:h-16 ${isListening ? "animate-bounce" : ""}`} />
            <span className="text-xs font-bold uppercase mt-1 tracking-wider">
              {isListening ? "Listening..." : "Tap & Speak"}
            </span>
          </button>
        </div>

        {/* Live speech feedback */}
        <div className="min-h-[50px] bg-slate-800/80 border border-slate-700 rounded-2xl px-5 py-3 w-full mb-4 flex items-center justify-center">
          <p className="text-sm font-semibold text-slate-300 italic">
            {liveTranscript || 'Example: "Ramesh ne 200 diya" or "Amit 300 ka maal"'}
          </p>
        </div>

        {/* Quick text input fallback */}
        <form onSubmit={handleQuickSubmit} className="flex w-full space-x-2">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Or type sentence quickly..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-[#B3261E]"
          />
          <button
            type="submit"
            disabled={!quickInput.trim()}
            className="px-4 py-2 bg-[#B3261E] hover:bg-[#8F1D16] text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
          >
            Add
          </button>
        </form>

      </div>

      {/* Bottom Drafts Queue & Actions */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-5 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <ListOrdered className="w-4 h-4 text-[#F4B942]" />
            <span className="text-sm font-black text-white">
              {servingDrafts.length} {servingDrafts.length === 1 ? "entry" : "entries"} to review
            </span>
          </div>

          {servingDrafts.length > 0 && (
            <button
              onClick={handleConfirmAll}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#1E7D4F] hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Save All</span>
            </button>
          )}
        </div>

        {servingDrafts.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            Queue is empty. Speak or type customer transactions as you serve them.
          </p>
        ) : (
          <div className="max-h-40 overflow-y-auto divide-y divide-slate-700/60 pr-1">
            {servingDrafts.map((draft, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-white text-sm">
                      {draft.customerRef}
                    </span>
                    <span className="text-slate-400 ml-2">
                      {draft.type === "CREDIT" ? "Udhaar" : "Jama"} • {draft.note}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`font-black text-sm ${
                      draft.type === "CREDIT" ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {draft.type === "CREDIT" ? "+" : "−"} {formatINR(draft.amount)}
                  </span>
                  <button
                    onClick={() => handleDeleteDraft(idx)}
                    className="p-1 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
