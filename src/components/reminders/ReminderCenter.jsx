import React, { useState, useMemo } from "react";
import { MessageSquare, Copy, Check, Share2, Sparkles, X, Globe, User, Phone, BellRing } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";
import { generateReminderMessage, getWhatsAppUrl } from "../../services/reminderService";
import { formatINR } from "../../services/nlpParser";

export function ReminderCenter() {
  const {
    customers,
    profile,
    reminderCustomerId,
    setReminderCustomerId,
    setSelectedCustomerId,
    showToast,
  } = useLedger();

  // Selected customer for modal or generator
  const [activeCustId, setActiveCustId] = useState(
    reminderCustomerId || customers.find((c) => c.outstanding > 0)?.id || customers[0]?.id
  );

  const [language, setLanguage] = useState("hinglish"); // 'hinglish' | 'hindi' | 'english'
  const [tone, setTone] = useState("polite"); // 'polite' | 'gentle' | 'urgent'
  const [copied, setCopied] = useState(false);

  // Sync if opened via reminderCustomerId
  React.useEffect(() => {
    if (reminderCustomerId) {
      setActiveCustId(reminderCustomerId);
      const cust = customers.find((c) => c.id === reminderCustomerId);
      if (cust?.preferredLanguage) {
        setLanguage(cust.preferredLanguage);
      }
    }
  }, [reminderCustomerId, customers]);

  const activeCustomer = useMemo(() => {
    return customers.find((c) => c.id === activeCustId) || customers[0];
  }, [customers, activeCustId]);

  const generatedMessage = useMemo(() => {
    if (!activeCustomer) return "";
    return generateReminderMessage({
      customerName: activeCustomer.name,
      outstandingAmount: activeCustomer.outstanding || 1250,
      shopName: profile.shopName,
      upiId: profile.upiId,
      language,
      tone,
    });
  }, [activeCustomer, profile, language, tone]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    showToast("✓ Reminder message copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!activeCustomer) return;
    const url = getWhatsAppUrl(activeCustomer.phone, generatedMessage);
    window.open(url, "_blank");
    showToast(`Opening WhatsApp for ${activeCustomer.name}`, "info");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#E8DFD1] gap-3">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>AI Smart Reminders</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Polite Payment Reminders (तगादा संदेश)
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Maintain good customer relationships while recovering dues with respectful multi-lingual messages.
          </p>
        </div>

        {reminderCustomerId && (
          <button
            onClick={() => setReminderCustomerId(null)}
            className="self-start sm:self-auto p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Customer Selector with Pending Dues */}
        <div className="lg:col-span-5 bg-[#FFFDF9] rounded-2xl border border-[#E2D9CC] p-4 shadow-xs">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Select Customer with Dues
          </h4>

          <div className="divide-y divide-[#F1ECE1] max-h-[500px] overflow-y-auto">
            {customers
              .filter((c) => c.outstanding > 0)
              .sort((a, b) => b.outstanding - a.outstanding)
              .map((c) => {
                const isSelected = c.id === activeCustomer?.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveCustId(c.id)}
                    className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-amber-100/70 border border-amber-300 font-bold"
                        : "hover:bg-[#FAF6EE]"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-xs font-black shrink-0">
                        {c.name[0]}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-slate-900 block truncate">
                          {c.name}
                        </span>
                        <span className="text-xs text-slate-400">{c.phone}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-[#991B1B]">
                        {formatINR(c.outstanding)}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right Column: AI Generator Controls & Live Message Card */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Controls: Language and Tone */}
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9CC] p-5 shadow-xs space-y-4">
            
            {/* Language Selector */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2 flex items-center">
                <Globe className="w-3.5 h-3.5 mr-1" />
                Customer Preferred Language:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "hinglish", label: "Hinglish (मिक्स)" },
                  { id: "hindi", label: "Hindi (हिंदी)" },
                  { id: "english", label: "English" },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLanguage(l.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      language === l.id
                        ? "bg-[#991B1B] text-white border-[#991B1B] shadow-2xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Tone / Tone of Voice:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "polite", label: "🙏 Polite / Gentle", desc: "For regular shoppers" },
                  { id: "gentle", label: "😊 Friendly Nudge", desc: "Casual reminder" },
                  { id: "urgent", label: "⚠️ Urgent / Overdue", desc: "Long pending dues" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      tone === t.id
                        ? "bg-amber-100 border-amber-400 text-amber-950 font-bold"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-xs block font-bold">{t.label}</span>
                    <span className="text-[10px] text-slate-400 block">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Generated Message Preview Card */}
          <div className="bg-[#FFFDF9] rounded-2xl border-2 border-amber-300 p-5 shadow-md">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-100">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  AI Generated Message for {activeCustomer?.name}
                </span>
              </div>
              <span className="text-xs font-bold text-[#991B1B]">
                Due: {formatINR(activeCustomer?.outstanding)}
              </span>
            </div>

            {/* WhatsApp Chat Bubble Mockup */}
            <div className="bg-[#EFEAE2] p-4 rounded-xl border border-[#D9D2C7] my-3">
              <div className="bg-white p-3.5 rounded-xl rounded-tl-xs shadow-xs text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {generatedMessage}
                <div className="text-right text-[10px] text-slate-400 mt-1">
                  10:45 AM ✓✓
                </div>
              </div>
            </div>

            {/* Action Buttons: Copy & WhatsApp */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-2xs transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex-1 flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share on WhatsApp</span>
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400 text-center mt-3">
              💡 Kirana Ledger will never send messages automatically without your confirmation.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
