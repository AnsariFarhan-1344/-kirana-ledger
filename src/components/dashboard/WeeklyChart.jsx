import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Info, TrendingUp, TrendingDown } from "lucide-react";
import { useLedger } from "../../context/LedgerContext";
import { formatINR } from "../../services/nlpParser";

export function WeeklyChart() {
  const { transactions, metrics, profile } = useLedger();

  const chartData = useMemo(() => {
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });

      const dayTxs = transactions.filter((t) => t.date === dateStr);
      const credit = dayTxs
        .filter((t) => (t.type || "").toUpperCase() === "CREDIT")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const payment = dayTxs
        .filter((t) => (t.type || "").toUpperCase() === "PAYMENT")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      days.push({
        date: dateStr,
        name: dayName,
        Credit: credit,
        Payment: payment,
      });
    }

    return days;
  }, [transactions]);

  // Plain language takeaway as requested in prompt
  const takeawayMessage = useMemo(() => {
    if (metrics.netWeeklyChange > 0) {
      return `This week you received less payment than the credit you gave, so shop outstanding increased by ${formatINR(metrics.netWeeklyChange)}.`;
    } else if (metrics.netWeeklyChange < 0) {
      return `Great collection! This week payments received exceeded credit by ${formatINR(Math.abs(metrics.netWeeklyChange))}. Outstanding reduced.`;
    } else {
      return `Credit extended and payments collected are balanced this week.`;
    }
  }, [metrics.netWeeklyChange]);

  return (
    <div className="bg-[#FFFDF8] rounded-2xl border border-[#E2D9CC] shadow-xs p-5 sm:p-6 mb-8 lal-bahi-paper">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#F1ECE1] gap-3">
        <div>
          <h3 className="text-xl font-black text-[#1F2340] tracking-tight">
            Weekly Udhaar vs Jama
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            {profile.shopName} • Daily comparison of receivables
          </p>
        </div>

        {/* 3 Metric Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl text-left">
            <span className="text-[10px] uppercase font-bold text-[#B3261E] block">Credit Given</span>
            <span className="text-sm font-black text-[#B3261E] font-kalam">{formatINR(metrics.weeklyCredit)}</span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-left">
            <span className="text-[10px] uppercase font-bold text-[#1E7D4F] block">Payments Received</span>
            <span className="text-sm font-black text-[#1E7D4F] font-kalam">{formatINR(metrics.weeklyPayment)}</span>
          </div>

          <div className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-left">
            <span className="text-[10px] uppercase font-bold text-slate-600 block">Net Change</span>
            <span className={`text-sm font-black font-kalam ${metrics.netWeeklyChange >= 0 ? "text-[#B3261E]" : "text-[#1E7D4F]"}`}>
              {metrics.netWeeklyChange >= 0 ? "+" : ""}{formatINR(metrics.netWeeklyChange)}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748B", fontWeight: 700 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip
              formatter={(value, name) => [`₹${value.toLocaleString("en-IN")}`, name === "Credit" ? "Credit / Udhaar (+)" : "Payment / Jama (−)"]}
              contentStyle={{
                backgroundColor: "#FFFDF8",
                borderRadius: "12px",
                border: "1px solid #E2D9CC",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: "12px", paddingBottom: "12px", fontWeight: "700" }}
            />
            <Bar dataKey="Credit" name="Credit (Udhaar)" fill="#B3261E" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="Payment" name="Payment (Jama)" fill="#1E7D4F" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Plain-language takeaway as specified */}
      <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center space-x-2 text-xs text-amber-950 font-medium">
        <Info className="w-4 h-4 text-amber-800 shrink-0" />
        <span>{takeawayMessage}</span>
      </div>

    </div>
  );
}
