import React, { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";

export function UndoBanner() {
  const { undoState, triggerUndo } = useLedger();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!undoState) return;

    const interval = 50; // update every 50ms
    const totalTime = 5000;
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / totalTime) * 100);
      setProgress(remainingPct);

      if (elapsed >= totalTime) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [undoState]);

  if (!undoState || progress <= 0) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-[#1F2340] text-white rounded-2xl shadow-2xl p-4 border border-slate-700 overflow-hidden relative">
        {/* Progress Countdown Bar */}
        <div
          className="absolute bottom-0 left-0 h-1 bg-[#F4B942] transition-all"
          style={{ width: `${progress}%` }}
        />

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-100 truncate">
            {undoState.message}
          </p>

          <button
            type="button"
            onClick={triggerUndo}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#B3261E] hover:bg-[#8F1D16] text-white font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
