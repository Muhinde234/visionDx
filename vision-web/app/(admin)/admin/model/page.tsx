"use client";

import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Zap, CheckCircle2, AlertTriangle } from "lucide-react";
import { MOCK_MODEL_METRICS } from "@/lib/mock-data";

const m = MOCK_MODEL_METRICS;

const CHART_TOOLTIP = {
  contentStyle: {
    background: "#0F172A",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: 12,
    color: "#ffffff",
    fontSize: 12,
  },
};

function MetricCard({ label, value, unit = "" }: { label: string; value: number; unit?: string }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm">
      <p className="text-xs font-medium text-[#0F172A]/50 dark:text-white/50">{label}</p>
      <p className="mt-1 text-3xl font-bold text-[#0F172A] dark:text-white">
        {value.toFixed(1)}<span className="text-lg font-semibold text-[#0F172A]/40 dark:text-white/40 ml-1">{unit}</span>
      </p>
      <div className="mt-3 h-1.5 w-full rounded-full bg-[#10B981]/10">
        <div
          className="h-1.5 rounded-full bg-[#10B981] transition-all"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function ModelInsightsPage() {
  const radialData = [
    { name: "Accuracy",  value: m.accuracy,  fill: "#10B981" },
    { name: "Precision", value: m.precision, fill: "#059669" },
    { name: "Recall",    value: m.recall,    fill: "#0F172A" },
    { name: "F1 Score",  value: m.f1Score,   fill: "#374151" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">Model Insights</h2>
        <div className="flex flex-wrap items-center gap-3 mt-1.5">
          <span className="text-sm text-[#0F172A]/50 dark:text-white/50">{m.version}</span>
          <span className="text-[#0F172A]/20 dark:text-white/20">·</span>
          <span className="text-sm text-[#0F172A]/50 dark:text-white/50">
            Updated {new Date(m.lastUpdated).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] px-3 py-0.5 text-xs font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
            Active
          </span>
        </div>
      </motion.div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <MetricCard label="Accuracy"  value={m.accuracy}  unit="%" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <MetricCard label="Precision" value={m.precision} unit="%" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <MetricCard label="Recall"    value={m.recall}    unit="%" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <MetricCard label="F1 Score"  value={m.f1Score}   unit="%" />
        </motion.div>
      </div>

      {/* Inference time card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10B981]/10">
          <Zap size={28} className="text-[#10B981]" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-xs font-medium text-[#0F172A]/50 dark:text-white/50">Average inference time</p>
          <p className="text-3xl font-bold text-[#0F172A] dark:text-white">
            {m.inferenceTimeMs} <span className="text-lg font-semibold text-[#0F172A]/40 dark:text-white/40">ms</span>
          </p>
        </div>
        <div className="sm:ml-auto text-right">
          <p className="text-xs text-[#0F172A]/40 dark:text-white/40">Target SLA</p>
          <p className="text-sm font-semibold text-[#0F172A] dark:text-white">≤ 2000 ms</p>
          <span className={`inline-flex items-center gap-1 text-xs font-bold ${m.inferenceTimeMs <= 2000 ? "text-[#10B981]" : "text-red-500"}`}>
            {m.inferenceTimeMs <= 2000
              ? <><CheckCircle2  size={13} strokeWidth={2} /> Within SLA</>
              : <><AlertTriangle size={13} strokeWidth={2} /> Exceeds SLA</>
            }
          </span>
        </div>
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Accuracy over time */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white mb-4">Accuracy Over Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={m.accuracyOverTime}>
              <defs>
                <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.1)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[88, 100]} tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip {...CHART_TOOLTIP} formatter={(v) => [`${v}%`, "Accuracy"]} />
              <Line
                type="monotone" dataKey="value" name="Accuracy"
                stroke="#10B981" strokeWidth={2.5}
                dot={{ r: 5, fill: "#10B981", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Species distribution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white mb-4">Detections by Species</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={m.detectionsBySpecies} dataKey="count" nameKey="name"
                cx="50%" cy="50%" outerRadius={80} innerRadius={44} paddingAngle={3}
              >
                {m.detectionsBySpecies.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip {...CHART_TOOLTIP} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Confusion matrix */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm"
      >
        <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white mb-1">Confusion Matrix</h3>
        <p className="text-xs text-[#0F172A]/40 dark:text-white/40 mb-4">Rows = Actual, Columns = Predicted</p>
        <div className="overflow-x-auto">
          <table className="text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-xs text-[#0F172A]/40 dark:text-white/40 text-left" />
                {m.confusionLabels.map((l) => (
                  <th key={l} className="px-3 py-2 text-xs font-semibold text-[#0F172A]/70 dark:text-white/70 whitespace-nowrap">{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {m.confusionMatrix.map((row, ri) => {
                const total = row.reduce((a, b) => a + b, 0);
                return (
                  <tr key={ri}>
                    <td className="px-3 py-2 text-xs font-semibold text-[#0F172A]/70 dark:text-white/70 whitespace-nowrap">
                      {m.confusionLabels[ri]}
                    </td>
                    {row.map((val, ci) => {
                      const pct    = total > 0 ? val / total : 0;
                      const isDiag = ri === ci;
                      return (
                        <td key={ci} className="px-3 py-2">
                          <div
                            className={`min-w-12 rounded-xl px-3 py-2 text-center text-sm font-bold transition-colors ${
                              isDiag
                                ? "bg-[#10B981]/20 text-[#10B981]"
                                : pct > 0.05
                                ? "bg-red-500/20 text-red-700 dark:text-red-400"
                                : "bg-[#10B981]/5 dark:bg-white/5 text-[#0F172A]/50 dark:text-white/50"
                            }`}
                          >
                            {val}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[#0F172A]/40 dark:text-white/40">
          Diagonal = correct predictions · Off-diagonal = misclassifications
        </p>
      </motion.div>

      {/* Radial metrics */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm"
      >
        <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white mb-4">Performance Overview</h3>
        <ResponsiveContainer width="100%" height={240}>
          <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={14} data={radialData}>
            <RadialBar background dataKey="value" cornerRadius={8} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Tooltip {...CHART_TOOLTIP} formatter={(v) => [`${v}%`]} />
          </RadialBarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
