import React from "react";
import { X, Calendar, ArrowUpRight, ArrowDownLeft, Banknote, QrCode, TrendingUp, CheckCircle } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";
import { formatINR } from "../../services/nlpParser";

export function DailyClosingModal() {
  const { isDailyClosingOpen, setIsDailyClosingOpen, metrics, profile } = useLedger();

  if (!isDailyClosingOpen) return null;

  const todayDateFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FFFDF8] rounded-2xl shadow-2xl border-2 border-[#E2D9CC] overflow-hidden lal-bahi-paper p-6 sm:p-7">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD1]">
          <div>
            <div className="inline-flex items-center space-x-1 text-xs font-bold text-[#B3261E] uppercase tracking-wider mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{todayDateFormatted}</span>
            </div>
            <h3 className="text-2xl font-black text-[#1F2340]">
              Roz ka Hisaab (दैनिक क्लोजिंग)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {profile.shopName} • Day's summary of udhaar and cash collections
            </p>
          </div>

          <button
            onClick={() => setIsDailyClosingOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Core Summary Cards */}
        <div className="grid grid-cols-2 gap-3.5 my-6">
          
          {/* Credit Given Today */}
          <div className="p-4 bg-white/90 rounded-xl border border-red-200 shadow-2xs">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              Credit Given Today
            </span>
            <div className="text-2xl font-black text-[#B3261E] mt-1 font-kalam">
              {formatINR(metrics.todayCredit)}
            </div>
            <span className="text-[11px] text-slate-500">Goods sold on udhaar</span>
          </div>

          {/* Payments Received Today */}
          <div className="p-4 bg-white/90 rounded-xl border border-emerald-200 shadow-2xs">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center">
              <ArrowDownLeft className="w-3.5 h-3.5 mr-1" />
              Payments Collected
            </span>
            <div className="text-2xl font-black text-[#1E7D4F] mt-1 font-kalam">
              {formatINR(metrics.todayPayment)}
            </div>
            <span className="text-[11px] text-slate-500">Total cash & UPI received</span>
          </div>

          {/* Cash Payments */}
          <div className="p-4 bg-white/90 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center">
              <Banknote className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Cash In Till
            </span>
            <div className="text-xl font-black text-slate-800 mt-1 font-kalam">
              {formatINR(metrics.todayCash)}
            </div>
            <span className="text-[11px] text-slate-400">Cash drawer balance</span>
          </div>

          {/* UPI Payments */}
          <div className="p-4 bg-white/90 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center">
              <QrCode className="w-3.5 h-3.5 mr-1 text-blue-600" />
              UPI / Online
            </span>
            <div className="text-xl font-black text-slate-800 mt-1 font-kalam">
              {formatINR(metrics.todayUPI)}
            </div>
            <span className="text-[11px] text-slate-400">Bank deposit directly</span>
          </div>

        </div>

        {/* Net Outstanding Change Today */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl mb-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
              Net Shop Outstanding Change Today:
            </span>
            <span className="text-xs text-amber-700">
              {metrics.todayNet >= 0
                ? "Credit given exceeds payments received today"
                : "Great day! Collected more payments than credit extended"}
            </span>
          </div>

          <div className={`text-xl font-black font-kalam ${metrics.todayNet >= 0 ? "text-[#B3261E]" : "text-[#1E7D4F]"}`}>
            {metrics.todayNet >= 0 ? "+" : ""}{formatINR(metrics.todayNet)}
          </div>
        </div>

        <button
          onClick={() => setIsDailyClosingOpen(false)}
          className="w-full py-3 bg-[#B3261E] hover:bg-[#8F1D16] text-white font-bold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
        >
          ✓ Done Reviewing Roz ka Hisaab
        </button>

      </div>
    </div>
  );
}
