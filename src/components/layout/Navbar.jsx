import React from "react";
import { BookOpen, Users, FileText, BellRing, BarChart3, Settings, Plus, Store, Zap, Calendar, FlaskConical } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";

export function Navbar() {
  const {
    profile,
    currentView,
    setCurrentView,
    setIsAddCustomerOpen,
    setIsSettingsOpen,
    setIsServingMode,
    setIsDailyClosingOpen,
    metrics,
    servingDrafts,
  } = useLedger();

  return (
    <header className="sticky top-0 z-30 bg-[#FBF6EA]/95 backdrop-blur-md border-b border-[#E8DFD1] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* HisabAI Logo & Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => setCurrentView("overview")}
          >
            {/* Rounded-square red bahi with speech bubble cutout & ₹ symbol */}
            <div className="relative w-11 h-11 bg-[#B3261E] rounded-xl shadow-md flex items-center justify-center border-l-4 border-[#8F1D16] overflow-hidden group">
              {/* White speech bubble cutout with ₹ symbol */}
              <div className="w-6 h-6 bg-[#FBF6EA] rounded-full flex items-center justify-center shadow-xs">
                <span className="text-[#B3261E] font-black text-xs leading-none">₹</span>
              </div>
              <span className="absolute bottom-0 right-0 text-[8px] bg-[#F4B942] text-amber-950 font-black px-1 rounded-tl">
                AI
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-2xl text-[#1F2340] tracking-tight">
                  Hisab<span className="text-[#B3261E]">AI</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#F4B942]/20 text-amber-950 border border-[#F4B942]/40">
                  हिसाब बोलो. बाकी AI संभाले.
                </span>
              </div>
              <div className="flex items-center text-xs text-slate-500 font-medium">
                <Store className="w-3.5 h-3.5 mr-1 text-slate-400" />
                <span className="truncate max-w-[160px] sm:max-w-[220px]">
                  {profile.shopName}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            <button
              onClick={() => setCurrentView("overview")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                currentView === "overview"
                  ? "bg-[#B3261E] text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-[#F1ECE1]"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setCurrentView("ledger")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                currentView === "ledger"
                  ? "bg-[#B3261E] text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-[#F1ECE1]"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Lal Bahi</span>
            </button>

            <button
              onClick={() => setCurrentView("customers")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                currentView === "customers"
                  ? "bg-[#B3261E] text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-[#F1ECE1]"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Customers</span>
              {metrics.customersWithDues > 0 && (
                <span className="text-[11px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-amber-900">
                  {metrics.customersWithDues}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView("reminders")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                currentView === "reminders"
                  ? "bg-[#B3261E] text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-[#F1ECE1]"
              }`}
            >
              <BellRing className="w-4 h-4" />
              <span>Reminders</span>
            </button>

            <button
              onClick={() => setCurrentView("analytics")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                currentView === "analytics"
                  ? "bg-[#B3261E] text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-[#F1ECE1]"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Insights</span>
            </button>

            <button
              onClick={() => setCurrentView("tests")}
              className={`flex items-center space-x-1 px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === "tests"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
              }`}
              title="Interactive Hinglish Parser Tests"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Tests</span>
            </button>
          </nav>

          {/* Action Hub */}
          <div className="flex items-center space-x-2">
            
            {/* Serving Mode Button */}
            <button
              onClick={() => setIsServingMode(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-100/80 hover:bg-amber-200 border border-amber-300 text-amber-950 text-xs font-extrabold shadow-2xs transition-all active:scale-95 cursor-pointer relative"
              title="Distraction-Free Rush Hour Mode"
            >
              <Zap className="w-4 h-4 text-amber-700" />
              <span className="hidden sm:inline">Serving Mode</span>
              {servingDrafts.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping absolute top-1 right-1" />
              )}
            </button>

            {/* Roz ka Hisaab (Daily Closing) */}
            <button
              onClick={() => setIsDailyClosingOpen(true)}
              className="flex items-center space-x-1 px-2.5 py-2 rounded-xl bg-white border border-[#DACFBF] hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Roz ka Hisaab"
            >
              <Calendar className="w-3.5 h-3.5 text-[#B3261E]" />
              <span className="hidden md:inline">Roz ka Hisaab</span>
            </button>

            {/* Add Customer */}
            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className="p-2 rounded-xl bg-white border border-[#DACFBF] hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
              title="Add Customer"
            >
              <Plus className="w-4 h-4 text-[#B3261E]" />
            </button>

            {/* Settings */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-[#F1ECE1] transition-colors cursor-pointer"
              title="Shop Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
