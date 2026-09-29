import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Percent, Award, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";
import { formatINR } from "../../services/nlpParser";

export function WeeklyAnalytics() {
  const { transactions, metrics, customers } = useLedger();

  // Daily Credit vs Payment for the past 7 days
  const dailyData = useMemo(() => {
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });

      const dayTxs = transactions.filter((t) => t.date === dateStr);
      const credit = dayTxs
        .filter((t) => t.type === "credit")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const payment = dayTxs
        .filter((t) => t.type === "payment")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      days.push({
        date: dateStr,
        day: dayName,
        Credit: credit,
        Payment: payment,
      });
    }

    return days;
  }, [transactions]);

  // Collection recovery rate (%)
  const recoveryRate = useMemo(() => {
    if (metrics.weeklyCredit === 0) return 100;
    return Math.min(100, Math.round((metrics.weeklyPayment / metrics.weeklyCredit) * 100));
  }, [metrics]);

  // Debt distribution
  const debtBuckets = useMemo(() => {
    let low = 0; // < 1000
    let mid = 0; // 1000 - 3000
    let high = 0; // > 3000

    customers.forEach((c) => {
      if (c.outstanding > 3000) high++;
      else if (c.outstanding >= 1000) mid++;
      else if (c.outstanding > 0) low++;
    });

    return [
      { name: "High Dues (> ₹3k)", value: high, color: "#DC2626" },
      { name: "Medium (₹1k-3k)", value: mid, color: "#F59E0B" },
      { name: "Low (< ₹1k)", value: low, color: "#3B82F6" },
    ];
  }, [customers]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Page Title */}
      <div className="pb-6 mb-6 border-b border-[#E8DFD1]">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Weekly Shop Insights (दुकान साप्ताहिक रिपोर्ट)
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Simple, easy-to-read financial summary of credit given and cash collection
        </p>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        
        {/* Credit Extended */}
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9CC] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Credit Extended (7 Days)</span>
            <ArrowUpRight className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {formatINR(metrics.weeklyCredit)}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Goods delivered on udhaar trust
          </p>
        </div>

        {/* Payments Collected */}
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9CC] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Payments Recovered</span>
            <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            {formatINR(metrics.weeklyPayment)}
          </div>
          <p className="text-xs text-emerald-700 mt-1 font-medium">
            Cash & UPI deposited in your till
          </p>
        </div>

        {/* Collection Efficiency */}
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2D9CC] p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Udhaar Recovery Rate</span>
            <Percent className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-700">
            {recoveryRate}%
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {recoveryRate >= 70 ? "🟢 Healthy shop cashflow" : "🟠 Send reminders to boost recovery"}
          </p>
        </div>

      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Daily Bar Chart (8 cols) */}
        <div className="lg:col-span-8 bg-[#FFFDF9] rounded-2xl border border-[#E2D9CC] p-5 sm:p-6 shadow-xs">
          <h3 className="text-lg font-black text-slate-900 mb-1">
            Credit Given vs Payments Received
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Daily comparison of store receivables
          </p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748B", fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(val, name) => [`₹${val.toLocaleString("en-IN")}`, name === "Credit" ? "Credit (Udhaar)" : "Payment (Jama)"]}
                  contentStyle={{
                    backgroundColor: "#FFFDF9",
                    borderRadius: "12px",
                    border: "1px solid #E2D9CC",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: "12px", paddingBottom: "12px" }} />
                <Bar dataKey="Credit" name="Credit (Udhaar)" fill="#DC2626" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="Payment" name="Payment (Jama)" fill="#16A34A" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Debt Distribution Pie (4 cols) */}
        <div className="lg:col-span-4 bg-[#FFFDF9] rounded-2xl border border-[#E2D9CC] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 mb-1">
              Debtor Risk Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Breakdown of customers by pending balance
            </p>

            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={debtBuckets}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {debtBuckets.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v} customers`, n]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-[#F1ECE1]">
            {debtBuckets.map((b, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                  <span>{b.name}</span>
                </div>
                <span>{b.value} customers</span>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
