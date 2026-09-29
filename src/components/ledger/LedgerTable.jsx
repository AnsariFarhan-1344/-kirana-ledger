import React, { useState, useMemo } from "react";
import { Search, Filter, Download, ArrowUpRight, ArrowDownLeft, Mic, FileText, Calendar, Trash2 } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";
import { formatINR } from "../../services/nlpParser";

export function LedgerTable() {
  const { transactions, setSelectedCustomerId, deleteTransaction, showToast } = useLedger();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'credit' | 'payment'
  const [filterSource, setFilterSource] = useState("all"); // 'all' | 'voice' | 'text'

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (filterType !== "all" && tx.type !== filterType) return false;
      // Source filter
      if (filterSource !== "all" && tx.source !== filterSource) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = tx.customerName.toLowerCase().includes(q);
        const matchesNote = (tx.note || "").toLowerCase().includes(q);
        const matchesAmt = tx.amount.toString().includes(q);
        return matchesName || matchesNote || matchesAmt;
      }
      return true;
    });
  }, [transactions, filterType, filterSource, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Customer Name", "Type", "Amount", "Date", "Note", "Source", "Created At"];
    const rows = filteredTransactions.map((t) => [
      t.id,
      `"${t.customerName}"`,
      t.type,
      t.amount,
      t.date,
      `"${t.note || ""}"`,
      t.source,
      t.createdAt,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kirana_ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("✓ Khata ledger exported as CSV", "success");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Page Title & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#E8DFD1] gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Complete Shop Khata (खाता बही)
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Master record of all credits extended and payments received
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#991B1B]" />
          <span>Export Khata (CSV)</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9CC] p-4 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, note or amount..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:outline-hidden focus:border-[#991B1B]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterType("credit")}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === "credit" ? "bg-red-600 text-white shadow-2xs" : "text-red-700 hover:text-red-900"
              }`}
            >
              Udhaar (+)
            </button>
            <button
              onClick={() => setFilterType("payment")}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === "payment" ? "bg-emerald-600 text-white shadow-2xs" : "text-emerald-700 hover:text-emerald-900"
              }`}
            >
              Jama (−)
            </button>
          </div>

          {/* Source Filter */}
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Sources</option>
            <option value="voice">🎙️ Voice AI Only</option>
            <option value="text">✍️ Text AI Only</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9CC] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF5ED] border-b border-[#E8DFD1] text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Customer Name</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Note / Goods</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1ECE1] text-sm">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isCredit = tx.type === "credit";

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => setSelectedCustomerId(tx.customerId)}
                      className="hover:bg-[#FAF6EE] transition-colors cursor-pointer group"
                    >
                      {/* Customer */}
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900 group-hover:text-[#991B1B] transition-colors">
                        {tx.customerName}
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
                            isCredit
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {isCredit ? (
                            <>
                              <ArrowUpRight className="w-3 h-3 mr-1 text-red-600" />
                              <span>Credit (उधार)</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownLeft className="w-3 h-3 mr-1 text-emerald-600" />
                              <span>Payment (जमा)</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-black">
                        <span className={isCredit ? "text-[#991B1B]" : "text-emerald-700"}>
                          {isCredit ? "+" : "−"} {formatINR(tx.amount)}
                        </span>
                      </td>

                      {/* Note */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium truncate max-w-xs">
                        {tx.note || (isCredit ? "Goods taken" : "Payment received")}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 font-medium text-xs">
                        {tx.date}
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                          {tx.source === "voice" ? (
                            <>
                              <Mic className="w-3 h-3 text-[#991B1B]" />
                              <span>Voice AI</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-3 h-3 text-blue-600" />
                              <span>Text AI</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTransaction(tx.id);
                          }}
                          className="p-1.5 text-slate-300 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
