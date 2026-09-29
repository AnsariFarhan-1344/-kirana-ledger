import React, { useState, useMemo } from "react";
import { Search, UserPlus, Phone, MapPin, ChevronRight, BellRing, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";
import { formatINR } from "../../services/nlpParser";

export function CustomerList() {
  const {
    customers,
    setSelectedCustomerId,
    setReminderCustomerId,
    setIsAddCustomerOpen,
  } = useLedger();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'dues' | 'clear'
  const [sortBy, setSortBy] = useState("dues"); // 'dues' | 'name' | 'recent'

  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        // Tab filter
        if (filterTab === "dues" && c.outstanding <= 0) return false;
        if (filterTab === "clear" && c.outstanding > 0) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = c.name.toLowerCase().includes(q);
          const matchesPhone = (c.phone || "").toLowerCase().includes(q);
          return matchesName || matchesPhone;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "dues") return b.outstanding - a.outstanding;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "recent") return new Date(b.lastTransactionDate) - new Date(a.lastTransactionDate);
        return 0;
      });
  }, [customers, filterTab, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#E8DFD1] gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Customer Directory (ग्राहक सूची)
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Manage your customer accounts, view outstanding udhaar, and send reminders
          </p>
        </div>

        <button
          onClick={() => setIsAddCustomerOpen(true)}
          className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Customer</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9CC] p-4 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:outline-hidden focus:border-[#991B1B]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterTab === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              All ({customers.length})
            </button>
            <button
              onClick={() => setFilterTab("dues")}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterTab === "dues" ? "bg-red-600 text-white shadow-2xs" : "text-slate-500"
              }`}
            >
              With Dues ({customers.filter((c) => c.outstanding > 0).length})
            </button>
            <button
              onClick={() => setFilterTab("clear")}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterTab === "clear" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-500"
              }`}
            >
              Cleared (0)
            </button>
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="dues">Sort: Highest Udhaar</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="recent">Sort: Recently Active</option>
          </select>
        </div>

      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium">
            No customers match your search.
          </div>
        ) : (
          filteredCustomers.map((c) => {
            const hasDues = c.outstanding > 0;

            return (
              <div
                key={c.id}
                onClick={() => setSelectedCustomerId(c.id)}
                className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9CC] p-5 shadow-xs hover:border-[#991B1B] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center font-black text-base shrink-0">
                        {c.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base group-hover:text-[#991B1B] transition-colors">
                          {c.name}
                        </h4>
                        <div className="flex items-center text-xs text-slate-400 mt-0.5">
                          <Phone className="w-3 h-3 mr-1" />
                          <span>{c.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Dot */}
                    <span
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        c.status === "overdue"
                          ? "bg-red-500"
                          : c.status === "due"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      title={c.status}
                    />
                  </div>

                  {c.address && (
                    <div className="flex items-center text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
                      <MapPin className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                      <span className="truncate">{c.address}</span>
                    </div>
                  )}
                </div>

                {/* Footer with Balance and Quick Actions */}
                <div className="mt-5 pt-3 border-t border-[#F1ECE1] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {hasDues ? "Outstanding Due" : "Ledger Status"}
                    </span>
                    <span
                      className={`text-lg font-black ${
                        hasDues ? "text-[#991B1B]" : "text-emerald-700"
                      }`}
                    >
                      {hasDues ? formatINR(c.outstanding) : "Cleared ✓"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {hasDues && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReminderCustomerId(c.id);
                        }}
                        className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all shadow-2xs"
                        title="Send Reminder"
                      >
                        <BellRing className="w-3.5 h-3.5 text-amber-700" />
                      </button>
                    )}

                    <div className="p-2 text-slate-400 group-hover:text-slate-700">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
