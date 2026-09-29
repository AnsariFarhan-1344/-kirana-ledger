import React, { useState } from "react";
import { X, Settings, Store, User, Phone, QrCode, MapPin, Volume2, RotateCcw, ShieldCheck, Zap } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";

export function SettingsModal() {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    profile,
    setProfile,
    autoSaveEnabled,
    setAutoSaveEnabled,
    showToast,
  } = useLedger();

  const [form, setForm] = useState({ ...profile });

  if (!isSettingsOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setProfile(form);
    showToast("✓ Shop settings saved successfully", "success");
    setIsSettingsOpen(false);
  };

  const handleResetData = () => {
    if (window.confirm("Reset all ledger data back to initial seed state?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] bg-[#FFFDF8] rounded-2xl shadow-2xl border-2 border-[#E2D9CC] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#FAF5ED] px-6 py-4 border-b border-[#E8DFD1] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#B3261E] text-white flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              HisabAI Settings & Shop Profile
            </h3>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Shop Name (दुकान का नाम)
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={form.shopName}
                onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:outline-hidden focus:border-[#B3261E]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Owner Name (दुकानदार का नाम)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:outline-hidden focus:border-[#B3261E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Shop Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:outline-hidden focus:border-[#B3261E]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                UPI ID (for Reminders)
              </label>
              <div className="relative">
                <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={form.upiId}
                  onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:outline-hidden focus:border-[#B3261E]"
                />
              </div>
            </div>
          </div>

          {/* Smart Confirmation Mode Toggle */}
          <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-amber-950 block">
                  Smart Confirmation (Auto-Save + 5s Undo)
                </span>
                <span className="text-[11px] text-amber-800">
                  {autoSaveEnabled
                    ? "High confidence entries auto-save with 5-second Undo banner"
                    : "Always show Understanding Card before saving (Safest)"}
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#B3261E] cursor-pointer"
              />
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Sound Effects</span>
                <span className="text-[11px] text-slate-400">Traditional shop chime on transaction save</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={form.soundEnabled !== false}
              onChange={(e) => setForm({ ...form, soundEnabled: e.target.checked })}
              className="w-4 h-4 accent-[#B3261E] cursor-pointer"
            />
          </div>

          {/* Reset Demo Data */}
          <div className="pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={handleResetData}
              className="flex items-center space-x-2 text-xs font-bold text-red-600 hover:text-red-800 py-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Store Data to Default Seeds</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-bold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#B3261E] hover:bg-[#8F1D16] text-white font-bold text-sm shadow-md transition-colors"
            >
              Save Settings
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
