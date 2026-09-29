import React from "react";
import { BookOpen, FileText, Mic, Users, BellRing } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";

export function MobileNav({ onOpenVoiceModal }) {
  const { currentView, setCurrentView, metrics } = useLedger();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-[#E8DFD1] px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around relative">
        
        {/* Home / Overview */}
        <button
          onClick={() => setCurrentView("overview")}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
            currentView === "overview" ? "text-[#991B1B] font-bold" : "text-slate-500"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Overview</span>
        </button>

        {/* Ledger */}
        <button
          onClick={() => setCurrentView("ledger")}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
            currentView === "ledger" ? "text-[#991B1B] font-bold" : "text-slate-500"
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Ledger</span>
        </button>

        {/* Big Center Voice / Speak Button */}
        <div className="relative -top-4">
          <button
            onClick={onOpenVoiceModal}
            className="w-13 h-13 rounded-full bg-[#991B1B] text-white flex items-center justify-center shadow-lg hover:bg-[#7F1D1D] active:scale-95 transition-all border-4 border-[#FAF8F5] focus:outline-hidden"
            aria-label="Speak Transaction"
          >
            <Mic className="w-6 h-6 animate-pulse" />
          </button>
        </div>

        {/* Customers */}
        <button
          onClick={() => setCurrentView("customers")}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors relative ${
            currentView === "customers" ? "text-[#991B1B] font-bold" : "text-slate-500"
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Customers</span>
          {metrics.customersWithDues > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        {/* Reminders */}
        <button
          onClick={() => setCurrentView("reminders")}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
            currentView === "reminders" ? "text-[#991B1B] font-bold" : "text-slate-500"
          }`}
        >
          <BellRing className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Reminders</span>
        </button>

      </div>
    </div>
  );
}
