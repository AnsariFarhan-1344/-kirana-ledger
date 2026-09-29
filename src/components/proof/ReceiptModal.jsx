import React from "react";
import { X, Share2, CheckCircle2, ShieldCheck, Calendar, User, Tag } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";
import { formatINR } from "../../services/nlpParser";
import { getWhatsAppUrl } from "../../services/reminderService";

export function ReceiptModal() {
  const { receiptTx, setReceiptTx, profile, customers, showToast } = useLedger();

  if (!receiptTx) return null;

  const isCredit = (receiptTx.type || "").toUpperCase() === "CREDIT";
  const customer = customers.find(
    (c) => c.id === receiptTx.customerId || c.id === receiptTx.customer_id
  );

  const handleShareWhatsApp = () => {
    const text = `*HisabAI Digital Khata Parchi*\n\n` +
      `Shop: ${profile.shopName}\n` +
      `Customer: ${receiptTx.customerName || receiptTx.customer_name}\n` +
      `Type: ${isCredit ? "Udhaar / Credit (+)" : "Jama / Payment (−)"}\n` +
      `Amount: ${formatINR(receiptTx.amount)}\n` +
      `Date: ${receiptTx.date}\n` +
      `Details: ${receiptTx.note || "General groceries"}\n` +
      `Current Balance: ${formatINR(customer?.outstanding || 0)}\n\n` +
      `Digital Proof Verified ✓`;

    window.open(getWhatsAppUrl(customer?.phone, text), "_blank");
    showToast("Sharing Parchi on WhatsApp", "info");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#FFFDF8] rounded-2xl shadow-2xl border-2 border-[#E2D9CC] overflow-hidden p-6 text-center lal-bahi-paper">
        
        {/* Close Button */}
        <button
          onClick={() => setReceiptTx(null)}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Traditional Kirana Receipt Slip */}
        <div className="border-b-2 border-dashed border-slate-300 pb-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#B3261E] text-white flex items-center justify-center mx-auto mb-2 font-black text-lg">
            ₹
          </div>
          <h4 className="font-black text-lg text-slate-900 tracking-tight">
            {profile.shopName}
          </h4>
          <p className="text-[11px] text-slate-400 font-medium">
            Digital Khata Parchi • Verified Ledger Record
          </p>
        </div>

        {/* Big Amount & Type */}
        <div className="my-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            {isCredit ? "Udhaar Extended" : "Payment Received"}
          </span>
          <div className={`text-4xl font-black font-kalam mt-1 ${isCredit ? "text-[#B3261E]" : "text-[#1E7D4F]"}`}>
            {isCredit ? "+" : "−"} {formatINR(receiptTx.amount)}
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-white/90 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2.5 my-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center">
              <User className="w-3.5 h-3.5 mr-1" /> Customer:
            </span>
            <span className="font-bold text-slate-800">
              {receiptTx.customerName || receiptTx.customer_name}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" /> Date:
            </span>
            <span className="font-semibold text-slate-700">{receiptTx.date}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center">
              <Tag className="w-3.5 h-3.5 mr-1" /> Items / Note:
            </span>
            <span className="font-medium text-slate-700 truncate max-w-[160px]">
              {receiptTx.note || "General items"}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-emerald-800 font-bold">
            <span className="flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Status:
            </span>
            <span>Confirmed by customer ✓</span>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShareWhatsApp}
          className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Parchi on WhatsApp</span>
        </button>

      </div>
    </div>
  );
}
