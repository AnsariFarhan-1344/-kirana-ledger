import React, { useState } from "react";
import { X, UserPlus, Phone, MapPin, Globe } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";

export function AddCustomerModal() {
  const { isAddCustomerOpen, setIsAddCustomerOpen, addCustomer } = useLedger();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("hinglish");

  if (!isAddCustomerOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCustomer({
      name: name.trim(),
      phone: phone.trim() || "+91 98000 00000",
      address: address.trim(),
      preferredLanguage,
    });

    setName("");
    setPhone("");
    setAddress("");
    setIsAddCustomerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FFFDF9] rounded-2xl shadow-2xl border-2 border-[#E2D9CC] overflow-hidden p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E8DFD1]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-[#991B1B] flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Add New Customer
            </h3>
          </div>

          <button
            onClick={() => setIsAddCustomerOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Customer Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:outline-hidden focus:border-[#991B1B]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Phone Number (for WhatsApp reminders)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 12345"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:outline-hidden focus:border-[#991B1B]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Address / Area (optional)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near Ganesh Temple, 3rd Floor"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:outline-hidden focus:border-[#991B1B]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Preferred Reminder Language
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:outline-hidden focus:border-[#991B1B]"
            >
              <option value="hinglish">Hinglish (मिक्स)</option>
              <option value="hindi">Hindi (हिंदी)</option>
              <option value="english">English</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddCustomerOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-bold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-bold text-sm shadow-md transition-colors"
            >
              Save Customer
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
