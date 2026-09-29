import React from "react";
import { TrendingUp, TrendingDown, Users, Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";
import { formatINR } from "../../services/nlpParser";

export function MetricsGrid() {
  const { profile, metrics, customers } = useLedger();

  // Get greeting according to current hour
  const hour = new Date().getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) greeting = "Good afternoon";
  else if (hour >= 17) greeting = "Good evening";

  return (
    <div className="mb-8">
      {/* Dashboard Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {greeting} 👋 <span className="text-[#991B1B]">{profile.ownerName || "Gupta ji"}</span>
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Your shop at a glance • Real-time udhaar & payment balance
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Ledger up to date</span>
        </div>
      </div>

      {/* 4 Core Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Outstanding */}
        <div className="bg-[#FFFDF9] rounded-2xl p-5 border border-[#E2D9CC] shadow-xs relative overflow-hidden group hover:border-[#DACFBF] transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Outstanding (कुल उधार)
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#991B1B]">
            {formatINR(metrics.totalOutstanding)}
          </div>
          <div className="mt-2 flex items-center text-xs font-medium text-slate-500">
            <span className="text-red-700 font-bold mr-1">To collect</span> from {metrics.customersWithDues} customers
          </div>
        </div>

        {/* Credit Given This Week */}
        <div className="bg-[#FFFDF9] rounded-2xl p-5 border border-[#E2D9CC] shadow-xs relative overflow-hidden group hover:border-[#DACFBF] transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Credit Given This Week
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {formatINR(metrics.weeklyCredit)}
          </div>
          <div className="mt-2 flex items-center text-xs font-medium text-amber-700">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>Goods given on udhaar in last 7 days</span>
          </div>
        </div>

        {/* Payments Received */}
        <div className="bg-[#FFFDF9] rounded-2xl p-5 border border-[#E2D9CC] shadow-xs relative overflow-hidden group hover:border-[#DACFBF] transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Payments Received (जमा)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            {formatINR(metrics.weeklyPayment)}
          </div>
          <div className="mt-2 flex items-center text-xs font-medium text-emerald-700">
            <TrendingDown className="w-3.5 h-3.5 mr-1" />
            <span>Cash & UPI recovered this week</span>
          </div>
        </div>

        {/* Customers With Dues */}
        <div className="bg-[#FFFDF9] rounded-2xl p-5 border border-[#E2D9CC] shadow-xs relative overflow-hidden group hover:border-[#DACFBF] transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Customers With Dues
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {metrics.customersWithDues}{" "}
            <span className="text-xs font-semibold text-slate-400">/ {customers.length} total</span>
          </div>
          <div className="mt-2 flex items-center text-xs font-medium text-slate-500">
            <span>Net Change: </span>
            <span className={`font-bold ml-1 ${metrics.netWeeklyChange >= 0 ? "text-amber-700" : "text-emerald-700"}`}>
              {metrics.netWeeklyChange >= 0 ? "+" : ""}{formatINR(metrics.netWeeklyChange)} this week
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
