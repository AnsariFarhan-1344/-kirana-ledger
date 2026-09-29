import React, { useState, useMemo } from "react";
import { X, ArrowUpRight, ArrowDownLeft, Mic, Send, BellRing, Phone, MessageSquare, Trash2, Calendar, Receipt } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";
import { formatINR } from "../../services/nlpParser";
import { getWhatsAppUrl } from "../../services/reminderService";

export function CustomerLedgerModal() {
  const {
    selectedCustomerId,
    setSelectedCustomerId,
    customers,
    transactions,
    confirmTransaction,
    deleteTransaction,
    setReminderCustomerId,
    setReceiptTx,
    profile,
  } = useLedger();

  const [inlineInput, setInlineInput] = useState("");

  const customer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  const customerTransactions = useMemo(() => {
    if (!selectedCustomerId) return [];
    return transactions
      .filter((t) => t.customerId === selectedCustomerId || t.customer_id === selectedCustomerId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, selectedCustomerId]);

  if (!customer) return null;

  const handleInlineSubmit = (e) => {
    e?.preventDefault();
    if (!inlineInput.trim()) return;

    const lower = inlineInput.toLowerCase();
    const isPayment =
      lower.includes("diya") ||
      lower.includes("diye") ||
      lower.includes("jama") ||
      lower.includes("pay") ||
      lower.includes("cash") ||
      lower.includes("wapas");

    const numbers = inlineInput.match(/\b\d+(\.\d{1,2})?\b/g);
    const amount = numbers ? parseFloat(numbers[0]) : 100;

    confirmTransaction({
      customerId: customer.id,
      customerName: customer.name,
      amount,
      type: isPayment ? "PAYMENT" : "CREDIT",
      date: new Date().toISOString().split("T")[0],
      note: inlineInput.trim(),
      source: "text",
    });

    setInlineInput("");
  };

  const handleShareSummaryWhatsApp = () => {
    const summaryMsg = `Namaste ${customer.name}, aapka ${profile.shopName} par kul baki hisaab ${formatINR(customer.outstanding)} hai.\nKripya check kar lijiye. Dhanyavaad 🙏\nUPI: ${profile.upiId}`;
    window.open(getWhatsAppUrl(customer.phone, summaryMsg), "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#FFFDF8] rounded-2xl shadow-2xl border-2 border-[#E2D9CC] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-[#FAF5ED] px-6 py-4 border-b border-[#E8DFD1] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-red-100 text-[#B3261E] border border-red-200 flex items-center justify-center font-black text-lg">
              {customer.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                {customer.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {customer.phone || "No phone"} • Credit Limit: {formatINR(customer.creditLimit || 5000)}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedCustomerId(null)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Banner */}
        <div className="px-6 py-4 bg-white border-b border-[#E8DFD1] flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Outstanding Due
            </span>
            <div className="text-4xl font-black text-[#B3261E] font-kalam">
              {formatINR(customer.outstanding)}
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Total Udhaar: {formatINR(customer.totalCredit)} | Total Jama: {formatINR(customer.totalPayment)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setReminderCustomerId(customer.id)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs border border-amber-300 transition-colors shadow-2xs cursor-pointer"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-700" />
              <span>Smart Reminder</span>
            </button>

            <button
              onClick={handleShareSummaryWhatsApp}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1E7D4F] font-bold text-xs border border-emerald-300 transition-colors shadow-2xs cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#1E7D4F]" />
              <span>WhatsApp Ledger</span>
            </button>
          </div>
        </div>

        {/* Notebook-Style Timeline */}
        <div className="flex-1 overflow-y-auto p-6 lal-bahi-paper divide-y divide-[#EADFCF]/70">
          <div className="flex items-center justify-between mb-3 text-xs font-black text-slate-500 uppercase tracking-wider">
            <span>Notebook Ledger Timeline ({customerTransactions.length})</span>
            <span>Debit / Credit</span>
          </div>

          {customerTransactions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-medium text-sm">
              No transactions recorded for {customer.name} yet.
            </div>
          ) : (
            customerTransactions.map((tx) => {
              const isCredit = (tx.type || "").toUpperCase() === "CREDIT";

              return (
                <div key={tx.id} className="py-3 flex items-start justify-between gap-3 group">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isCredit
                          ? "bg-red-100 text-[#B3261E]"
                          : "bg-emerald-100 text-[#1E7D4F]"
                      }`}
                    >
                      {isCredit ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-black text-sm ${isCredit ? "text-[#B3261E]" : "text-[#1E7D4F]"}`}>
                          {isCredit ? "+ CREDIT (Udhaar)" : "− PAYMENT (Jama)"}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 px-1.5 py-0.2 bg-slate-100 rounded">
                          {tx.source === "voice"
                            ? "🎙️ Voice AI"
                            : tx.source === "text"
                            ? "✍️ Text AI"
                            : "Manual"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-0.5 font-medium font-kalam">
                        {tx.note || (isCredit ? "Kirana सामान" : "Payment received")}
                      </p>
                      <span className="text-[11px] text-slate-400 flex items-center mt-0.5">
                        <Calendar className="w-3 h-3 mr-1" />
                        {tx.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div
                        className={`text-lg font-black font-kalam ${
                          isCredit ? "text-[#B3261E]" : "text-[#1E7D4F]"
                        }`}
                      >
                        {isCredit ? "+" : "−"} {formatINR(tx.amount)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setReceiptTx(tx)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 rounded-md transition-colors"
                      title="View Digital Parchi"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteTransaction(tx.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-600 rounded-md transition-opacity"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Conversational Input: "Ramesh ke liye likho..." */}
        <div className="p-4 bg-[#FAF5ED] border-t border-[#E8DFD1]">
          <form onSubmit={handleInlineSubmit} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inlineInput}
                onChange={(e) => setInlineInput(e.target.value)}
                placeholder={`${customer.name.split(" ")[0]} ke liye likho... (e.g. "300 de gaye" or "200 ka maal")`}
                className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium focus:outline-hidden focus:border-[#B3261E]"
              />
            </div>

            <button
              type="submit"
              disabled={!inlineInput.trim()}
              className={`p-2.5 rounded-xl font-bold text-sm shadow-xs transition-colors ${
                inlineInput.trim()
                  ? "bg-[#B3261E] hover:bg-[#8F1D16] text-white cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
