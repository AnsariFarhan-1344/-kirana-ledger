import React from "react";
import { ChevronRight, BellRing, Receipt, Phone } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";
import { formatINR } from "../../services/nlpParser";

export function TopDebtors() {
  const { topDebtors, setSelectedCustomerId, setReminderCustomerId, setReceiptTx, transactions } = useLedger();

  const statusConfig = {
    active: {
      color: "bg-emerald-100 text-emerald-800 border-emerald-200",
      label: "🟢 Recently active",
    },
    due: {
      color: "bg-amber-100 text-amber-800 border-amber-200",
      label: "🟠 Due soon",
    },
    overdue: {
      color: "bg-red-100 text-[#B3261E] border-red-200",
      label: "🔴 Overdue (>30d)",
    },
  };

  const handleOpenReceiptForCustomer = (e, customer) => {
    e.stopPropagation();
    const latestTx = transactions.find(
      (t) => t.customerId === customer.id || t.customer_id === customer.id
    );
    if (latestTx) {
      setReceiptTx(latestTx);
    } else {
      setReceiptTx({
        id: "tx-mock",
        customerName: customer.name,
        amount: customer.outstanding,
        type: "CREDIT",
        date: customer.lastTransactionDate,
        note: "Ledger balance summary",
      });
    }
  };

  return (
    <div className="bg-[#FFFDF8] rounded-2xl border border-[#E2D9CC] shadow-xs p-5 sm:p-6 mb-8 lal-bahi-paper">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F1ECE1]">
        <div>
          <h3 className="text-xl font-black text-[#1F2340] tracking-tight">
            Who owes the most? (किसे कितना बाकी है)
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            Ranked by total outstanding balance in your shop
          </p>
        </div>

        <span className="text-xs font-bold text-slate-400">
          Top {Math.min(topDebtors.length, 6)} Debtors
        </span>
      </div>

      {topDebtors.length === 0 ? (
        <div className="py-8 text-center text-slate-400 font-medium text-sm">
          🎉 No pending dues in your shop ledger!
        </div>
      ) : (
        <div className="divide-y divide-[#F1ECE1]">
          {topDebtors.slice(0, 6).map((customer, index) => {
            const statusInfo = statusConfig[customer.status] || statusConfig.due;

            return (
              <div
                key={customer.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-[#FAF6EE] -mx-2 px-2 rounded-xl transition-all cursor-pointer group"
                onClick={() => setSelectedCustomerId(customer.id)}
              >
                {/* Left: Avatar + Name */}
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-[#B3261E] border border-red-200 flex items-center justify-center font-black text-sm shrink-0">
                      {customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                    <span className="absolute -top-1 -left-1 w-4 h-4 bg-slate-800 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm sm:text-base text-slate-900 truncate group-hover:text-[#B3261E] transition-colors">
                        {customer.name}
                      </span>
                      <span className="hidden sm:inline-flex text-[11px] font-medium text-slate-400">
                        {customer.phone}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className={`inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate">
                        Last: {customer.lastTransactionDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount + Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  <div className="text-right">
                    <div className="text-base sm:text-xl font-black text-[#B3261E] font-kalam">
                      {formatINR(customer.outstanding)}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Due
                    </span>
                  </div>

                  {/* Parchi Receipt button */}
                  <button
                    type="button"
                    onClick={(e) => handleOpenReceiptForCustomer(e, customer)}
                    className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors shadow-2xs"
                    title="View Digital Khata Parchi"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                  </button>

                  {/* Reminder Action */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReminderCustomerId(customer.id);
                    }}
                    className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center space-x-1"
                    title="Send Payment Reminder"
                  >
                    <BellRing className="w-3.5 h-3.5 text-amber-700" />
                    <span className="hidden md:inline">Remind</span>
                  </button>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
