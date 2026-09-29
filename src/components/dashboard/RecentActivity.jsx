import React from "react";
import { ArrowUpRight, ArrowDownLeft, Mic, Edit2, FileText, ChevronRight } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";
import { formatINR } from "../../services/nlpParser";

export function RecentActivity() {
  const { transactions, setSelectedCustomerId, setCurrentView } = useLedger();

  return (
    <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9CC] shadow-xs p-5 sm:p-6">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F1ECE1]">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Recent Ledger Entries
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Real-time feed of credits and payments recorded
          </p>
        </div>

        <button
          onClick={() => setCurrentView("ledger")}
          className="text-xs font-bold text-[#991B1B] hover:text-[#7F1D1D] flex items-center space-x-1"
        >
          <span>View All Khata</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="divide-y divide-[#F1ECE1]">
        {transactions.slice(0, 6).map((tx) => {
          const isCredit = tx.type === "credit";

          return (
            <div
              key={tx.id}
              onClick={() => setSelectedCustomerId(tx.customerId)}
              className="py-3 flex items-center justify-between gap-3 hover:bg-[#FAF6EE] -mx-2 px-2 rounded-xl transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                {/* Type Icon */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isCredit ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  }`}
                >
                  {isCredit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900 truncate group-hover:text-[#991B1B] transition-colors">
                      {tx.customerName}
                    </span>
                    {/* AI Source Tag */}
                    <span className="inline-flex items-center space-x-1 text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                      {tx.source === "voice" ? (
                        <>
                          <Mic className="w-2.5 h-2.5 text-[#991B1B]" />
                          <span>Voice AI</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-2.5 h-2.5 text-blue-600" />
                          <span>Text AI</span>
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {tx.note || (isCredit ? "Goods taken" : "Payment received")} • {tx.date}
                  </p>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <span
                  className={`text-sm sm:text-base font-black ${
                    isCredit ? "text-[#991B1B]" : "text-emerald-700"
                  }`}
                >
                  {isCredit ? "+" : "−"} {formatINR(tx.amount)}
                </span>
                <span className="block text-[10px] uppercase font-bold text-slate-400">
                  {isCredit ? "Udhaar" : "Jama"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
