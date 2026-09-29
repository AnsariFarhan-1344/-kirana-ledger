import React, { useState, useEffect } from "react";
import { Mic, ArrowRight, Sparkles, Volume2, CheckCircle2, Calendar, Clock } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";

export function HeroInput({ onOpenVoiceModal }) {
  const [inputText, setInputText] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [demoStep, setDemoStep] = useState(1); // 1 = spoken, 2 = understood, 3 = saved

  const { interpretInput, promises, setReceiptTx, transactions } = useLedger();

  // Demo walkthrough animation (pauses once user interacts)
  useEffect(() => {
    if (hasInteracted) return;

    const interval = setInterval(() => {
      setDemoStep((prev) => (prev % 3) + 1);
    }, 2800);

    return () => clearInterval(interval);
  }, [hasInteracted]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    setHasInteracted(true);
    interpretInput(inputText.trim(), "text");
    setInputText("");
  };

  const handleSelectDemoPrompt = (phrase) => {
    setHasInteracted(true);
    setInputText(phrase.text);
    setTimeout(() => {
      interpretInput(phrase.text, "text");
    }, 150);
  };

  const samplePhrases = [
    { text: "Ramesh ne ₹500 ka maal liya", tag: "Credit / Udhaar", color: "bg-red-50 text-red-900 border-red-200" },
    { text: "Amit ne ₹300 diye", tag: "Payment / Jama", color: "bg-emerald-50 text-emerald-900 border-emerald-200" },
    { text: "Suresh ko ₹200 ka udhaar", tag: "Direct Udhaar", color: "bg-red-50 text-red-900 border-red-200" },
    { text: "Amit kal dega", tag: "Promise to Pay", color: "bg-blue-50 text-blue-900 border-blue-200" },
    { text: "Ramesh 200 aur Amit 300 de gaye", tag: "Multi-Entry Split", color: "bg-purple-50 text-purple-900 border-purple-200" },
    { text: "Rahul ne 300 ka maal liya", tag: "New Customer Flow", color: "bg-amber-50 text-amber-900 border-amber-200" },
    { text: "Ramesh ke 500", tag: "Ambiguous Type", color: "bg-amber-50 text-amber-900 border-amber-200" },
  ];

  return (
    <section className="relative pt-6 pb-6 sm:pt-8 sm:pb-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#F4B942]/20 border border-[#F4B942]/50 text-amber-950 text-xs sm:text-sm font-extrabold uppercase tracking-wide mb-3">
            <Sparkles className="w-4 h-4 text-amber-800" />
            <span>HisabAI • Digital Lal Bahi</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#1F2340] tracking-tight leading-tight">
            Hisaab bolo. <span className="text-[#B3261E]">Baaki AI sambhale.</span>
          </h1>

          <p className="mt-2 text-base sm:text-lg text-slate-600 max-w-xl mx-auto font-medium">
            Speak or type a transaction. HisabAI handles the rest.
          </p>
        </div>

        {/* Central Conversational Input Box */}
        <div className="relative bg-[#FFFDF8] rounded-2xl shadow-xl border-2 border-[#E2D9CC] p-3 sm:p-5 transition-all hover:border-[#DACFBF] focus-within:border-[#B3261E] focus-within:ring-4 focus-within:ring-red-100 mb-4">
          
          <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => {
                  setHasInteracted(true);
                  setInputText(e.target.value);
                }}
                placeholder='🎤 Speak or type: "Ramesh ne 500 rupaye ka maal liya" or "Amit kal dega"...'
                className="w-full bg-transparent text-[#1F2340] placeholder:text-slate-400 text-base sm:text-xl font-medium px-2 py-3 focus:outline-hidden"
              />
            </div>

            {/* Input Action Controls */}
            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#F1ECE1] gap-2">
              <div className="flex items-center space-x-2 text-xs text-slate-500 font-bold">
                <span className="inline-block w-2 h-2 rounded-full bg-[#1E7D4F] animate-pulse" />
                <span>Zero forms • Auto detects Udhaar, Jama & Promises</span>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-end">
                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={() => {
                    setHasInteracted(true);
                    onOpenVoiceModal();
                  }}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-[#B3261E] font-extrabold border border-red-200 shadow-2xs active:scale-95 transition-all cursor-pointer group"
                >
                  <div className="w-5 h-5 rounded-full bg-[#B3261E] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mic className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm">Speak 🎙️</span>
                </button>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 ${
                    inputText.trim()
                      ? "bg-[#B3261E] hover:bg-[#8F1D16] text-white cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <span>Enter</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

        </div>

        {/* Visual Demo Story Animation Walkthrough (as specified in prompt) */}
        {!hasInteracted && (
          <div className="bg-[#FFFDF8] rounded-xl border border-[#E2D9CC] p-3 mb-4 shadow-2xs text-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                How HisabAI Works in 3 Seconds:
              </span>
              <span className="text-[10px] text-slate-400">Auto-playing demo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
              {/* Step 1 */}
              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  demoStep === 1
                    ? "bg-red-50 border-[#B3261E] text-[#B3261E] font-bold shadow-2xs scale-102"
                    : "bg-white/60 border-slate-200 text-slate-600"
                }`}
              >
                <span className="block text-[10px] uppercase font-bold text-slate-400">1. Speak naturally</span>
                <span>🎙 "Ramesh ne 500 ka maal liya"</span>
              </div>

              {/* Step 2 */}
              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  demoStep === 2
                    ? "bg-[#F4B942]/20 border-[#F4B942] text-amber-950 font-bold shadow-2xs scale-102"
                    : "bg-white/60 border-slate-200 text-slate-600"
                }`}
              >
                <span className="block text-[10px] uppercase font-bold text-slate-400">2. AI understands</span>
                <span>Ramesh | ₹500 | CREDIT</span>
              </div>

              {/* Step 3 */}
              <div
                className={`p-2.5 rounded-lg border transition-all ${
                  demoStep === 3
                    ? "bg-emerald-50 border-[#1E7D4F] text-[#1E7D4F] font-bold shadow-2xs scale-102"
                    : "bg-white/60 border-slate-200 text-slate-600"
                }`}
              >
                <span className="block text-[10px] uppercase font-bold text-slate-400">3. Saved to Ledger</span>
                <span>✓ Confirmed & balance updated</span>
              </div>
            </div>
          </div>
        )}

        {/* Demo Suggestions Chips ("Try saying") */}
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Try clicking an example:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {samplePhrases.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectDemoPrompt(phrase)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all text-left flex items-center space-x-1.5 active:scale-95 cursor-pointer ${phrase.color}`}
              >
                <span>"{phrase.text}"</span>
                <span className="text-[10px] px-1 py-0.2 rounded font-black uppercase bg-black/10">
                  {phrase.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Promises to Pay Alert (if any pending promise for tomorrow) */}
        {promises.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                <strong>Promise reminder:</strong> {promises[0].customerName} promised ₹{promises[0].amount} ({promises[0].note || "Pending settlement"})
              </span>
            </div>
            <span className="px-2 py-0.5 bg-blue-200 text-blue-950 font-bold rounded text-[10px]">
              {promises[0].promiseDate}
            </span>
          </div>
        )}

      </div>
    </section>
  );
}
