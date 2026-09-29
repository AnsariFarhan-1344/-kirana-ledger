import React from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";

export function Toast() {
  const { toast } = useLedger();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const bgStyles = {
    success: "bg-slate-900 text-white border-slate-700",
    warning: "bg-amber-950 text-amber-100 border-amber-800",
    info: "bg-slate-900 text-white border-slate-700",
  };

  return (
    <div className="fixed bottom-18 lg:bottom-8 right-4 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex items-center space-x-3 p-3.5 rounded-xl shadow-xl border ${
          bgStyles[toast.type] || bgStyles.success
        }`}
      >
        {icons[toast.type] || icons.success}
        <p className="text-sm font-medium leading-snug flex-1">{toast.message}</p>
      </div>
    </div>
  );
}
