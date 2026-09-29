import React, { useState } from "react";
import { Check, Edit3, X, Sparkles, User, Calendar, Tag, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";
import { formatINR } from "../../services/nlpParser";

export function InterpretationCard() {
  const {
    pendingInterpretation,
    setPendingInterpretation,
    confirmTransaction,
    customers,
  } = useLedger();

  const [isEditing, setIsEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState("");
  const [editedAmount, setEditedAmount] = useState("");
  const [editedType, setEditedType] = useState("CREDIT");
  const [editedNote, setEditedNote] = useState("");
  const [editedDate, setEditedDate] = useState("");

  if (!pendingInterpretation) return null;

  const {
    customer,
    amount,
    type,
    date,
    dateLabel,
    note,
    rawText,
    source,
    confidence = 0.96,
  } = pendingInterpretation;

  const startEdit = () => {
    setEditedCustomer(customer.name);
    setEditedAmount(amount);
    setEditedType(type);
    setEditedNote(note);
    setEditedDate(date);
    setIsEditing(true);
  };

  const handleConfirm = () => {
    if (isEditing) {
      const matched = customers.find(
        (c) => c.name.toLowerCase() === editedCustomer.toLowerCase()
      );
      confirmTransaction({
        customerId: matched ? matched.id : customer.id || "cust-1",
        customerName: editedCustomer || customer.name,
        amount: parseFloat(editedAmount) || amount,
        type: editedType,
        date: editedDate || date,
        note: editedNote || note,
        source: "manual",
      });
    } else {
      confirmTransaction({
        customerId: customer.id,
        customerName: customer.name,
        amount,
        type,
        date,
        note,
        source: source || "voice",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FFFDF8] rounded-2xl shadow-2xl border-2 border-[#E2D9CC] overflow-hidden">
        
        {/* Haldi Yellow Accent Banner — specifically reserved for "AI understood this" */}
        <div className="bg-[#F4B942]/15 border-b border-[#F4B942]/40 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#F4B942] text-amber-950 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                AI understood your message
              </span>
              <p className="text-[11px] text-amber-800/80 font-medium">
                {source === "voice" ? "🎙️ Voice AI" : "✍️ Text AI"} • {Math.round(confidence * 100)}% match confidence
              </p>
            </div>
          </div>

          <button
            onClick={() => setPendingInterpretation(null)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Original Raw input quote */}
        <div className="px-6 pt-4 pb-2">
          <div className="bg-[#FBF6EA] border-l-4 border-[#B3261E] px-3.5 py-2.5 rounded-r-lg">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              You said:
            </span>
            <p className="text-sm font-bold text-slate-900 italic">
              "{rawText}"
            </p>
          </div>
        </div>

        {/* Structured Understanding Breakdown */}
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
            <span>I understood this:</span>
          </h3>

          {!isEditing ? (
            <div className="grid grid-cols-2 gap-3.5 bg-white p-4 rounded-xl border border-[#E8DFD1] shadow-2xs lal-bahi-ruled">
              
              {/* Customer */}
              <div className="col-span-2 sm:col-span-1">
                <span className="text-xs text-slate-500 font-semibold flex items-center">
                  <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Customer
                </span>
                <span className="text-base font-bold text-slate-900 block truncate mt-0.5">
                  {customer.name}
                </span>
                {customer.phone && (
                  <span className="text-xs text-slate-400">{customer.phone}</span>
                )}
              </div>

              {/* Transaction Type */}
              <div className="col-span-2 sm:col-span-1">
                <span className="text-xs text-slate-500 font-semibold flex items-center">
                  {(type || "").toUpperCase() === "CREDIT" ? (
                    <ArrowUpRight className="w-3.5 h-3.5 mr-1 text-[#B3261E]" />
                  ) : (
                    <ArrowDownLeft className="w-3.5 h-3.5 mr-1 text-[#1E7D4F]" />
                  )}
                  Transaction Type
                </span>
                <div className="mt-0.5">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black ${
                      (type || "").toUpperCase() === "CREDIT"
                        ? "bg-red-100 text-[#B3261E] border border-red-200"
                        : "bg-emerald-100 text-[#1E7D4F] border border-emerald-200"
                    }`}
                  >
                    {(type || "").toUpperCase() === "CREDIT" ? "CREDIT / UDHAR (उधार)" : "PAYMENT / JAMA (जमा)"}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className="col-span-2 sm:col-span-1">
                <span className="text-xs text-slate-500 font-semibold">Amount</span>
                <div className="text-3xl font-black text-slate-900 mt-0.5 font-kalam">
                  {formatINR(amount)}
                </div>
              </div>

              {/* Date */}
              <div className="col-span-2 sm:col-span-1">
                <span className="text-xs text-slate-500 font-semibold flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Date
                </span>
                <span className="text-sm font-bold text-slate-800 block mt-1">
                  {dateLabel || "Today"} ({date})
                </span>
              </div>

              {/* Note / Goods purchased */}
              {note && (
                <div className="col-span-2 pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-semibold flex items-center">
                    <Tag className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Goods / Note
                  </span>
                  <span className="text-sm font-medium text-slate-700 block mt-0.5 font-kalam">
                    {note}
                  </span>
                </div>
              )}

            </div>
          ) : (
            /* In-place Edit Form */
            <div className="space-y-3 bg-white p-4 rounded-xl border border-[#E8DFD1]">
              <div>
                <label className="text-xs font-bold text-slate-600">Customer Name</label>
                <input
                  type="text"
                  value={editedCustomer}
                  onChange={(e) => setEditedCustomer(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium focus:outline-hidden focus:border-[#B3261E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">Amount (₹)</label>
                  <input
                    type="number"
                    value={editedAmount}
                    onChange={(e) => setEditedAmount(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold focus:outline-hidden focus:border-[#B3261E]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">Type</label>
                  <select
                    value={editedType}
                    onChange={(e) => setEditedType(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold focus:outline-hidden focus:border-[#B3261E]"
                  >
                    <option value="CREDIT">Credit / Udhaar (उधार)</option>
                    <option value="PAYMENT">Payment / Jama (जमा)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">Note / Items</label>
                <input
                  type="text"
                  value={editedNote}
                  onChange={(e) => setEditedNote(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium focus:outline-hidden focus:border-[#B3261E]"
                />
              </div>
            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div className="p-5 bg-[#FAF5ED] border-t border-[#E8DFD1] flex items-center justify-between gap-3">
          {!isEditing ? (
            <button
              type="button"
              onClick={startEdit}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-bold text-sm shadow-2xs transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              <span>Edit</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-bold text-sm transition-colors cursor-pointer"
            >
              Cancel Edit
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-[#1E7D4F] hover:bg-[#166534] text-white font-bold text-sm sm:text-base shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-5 h-5" />
            <span>✓ Confirm & Save to Ledger</span>
          </button>
        </div>

      </div>
    </div>
  );
}
