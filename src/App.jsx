import React, { useState } from "react";
import { LedgerProvider, useLedger } from "./context/LedgerContext";
import { Navbar } from "./components/layout/Navbar";
import { MobileNav } from "./components/layout/MobileNav";
import { Toast } from "./components/layout/Toast";
import { UndoBanner } from "./components/layout/UndoBanner";

import { HeroInput } from "./components/hero/HeroInput";
import { VoiceListeningModal } from "./components/hero/VoiceListeningModal";

import { MetricsGrid } from "./components/dashboard/MetricsGrid";
import { TopDebtors } from "./components/dashboard/TopDebtors";
import { WeeklyChart } from "./components/dashboard/WeeklyChart";
import { RecentActivity } from "./components/dashboard/RecentActivity";

import { LedgerTable } from "./components/ledger/LedgerTable";
import { CustomerLedgerModal } from "./components/ledger/CustomerLedgerModal";

import { CustomerList } from "./components/customers/CustomerList";
import { AddCustomerModal } from "./components/customers/AddCustomerModal";

import { ReminderCenter } from "./components/reminders/ReminderCenter";
import { WeeklyAnalytics } from "./components/analytics/WeeklyAnalytics";
import { SettingsModal } from "./components/settings/SettingsModal";

import { InterpretationCard } from "./components/ai/InterpretationCard";
import { AmbiguityModal } from "./components/ai/AmbiguityModal";
import { DuplicateWarningModal } from "./components/ai/DuplicateWarningModal";
import { RiskAndLimitModals } from "./components/ai/RiskAndLimitModals";

import { ServingModeModal } from "./components/mode/ServingModeModal";
import { DailyClosingModal } from "./components/closing/DailyClosingModal";
import { ReceiptModal } from "./components/proof/ReceiptModal";
import { ParserTestPage } from "./components/tests/ParserTestPage";

function MainContent() {
  const { currentView } = useLedger();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF6EA] text-[#1F2340] pb-24 lg:pb-12">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Routed Content */}
      <main className="flex-1">
        {currentView === "overview" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* The Hero Conversational Input */}
            <HeroInput onOpenVoiceModal={() => setIsVoiceModalOpen(true)} />

            {/* Shop Dashboard Real-World Metrics */}
            <MetricsGrid />

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Top Debtors + Weekly Chart (7 cols) */}
              <div className="lg:col-span-7">
                <TopDebtors />
                <WeeklyChart />
              </div>

              {/* Right Column: Recent Activity Feed (5 cols) */}
              <div className="lg:col-span-5">
                <RecentActivity />
              </div>
            </div>
          </div>
        )}

        {currentView === "ledger" && <LedgerTable />}

        {currentView === "customers" && <CustomerList />}

        {currentView === "reminders" && <ReminderCenter />}

        {currentView === "analytics" && <WeeklyAnalytics />}

        {currentView === "tests" && <ParserTestPage />}
      </main>

      {/* Footer Note */}
      <footer className="mt-auto border-t border-[#E8DFD1] py-6 text-center text-xs text-slate-500 font-medium">
        <p>
          HisabAI • Hisaab bolo. Baaki AI sambhale. • Built with Voice AI for Indian Kirana Shop Owners
        </p>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenVoiceModal={() => setIsVoiceModalOpen(true)} />

      {/* 5-Second Undo Toast */}
      <UndoBanner />

      {/* Modals & Overlays */}
      <VoiceListeningModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />

      <InterpretationCard />
      <AmbiguityModal />
      <DuplicateWarningModal />
      <RiskAndLimitModals />
      <ServingModeModal />
      <DailyClosingModal />
      <ReceiptModal />
      <CustomerLedgerModal />
      <AddCustomerModal />
      <SettingsModal />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <LedgerProvider>
      <MainContent />
    </LedgerProvider>
  );
}
