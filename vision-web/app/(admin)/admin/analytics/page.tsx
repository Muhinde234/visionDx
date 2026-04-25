"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Download, FileText, FileSpreadsheet, TrendingUp,
  Users, Activity, AlertCircle, CheckCircle2,
  Loader2, CalendarDays, Filter,
} from "lucide-react";
import { MOCK_REPORTS, MOCK_USERS, getMockDashboardStats, MOCK_MODEL_METRICS } from "@/lib/mock-data";
import type { Report } from "@/lib/types";

const CHART_TOOLTIP = {
  contentStyle: {
    background: "#0F172A",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: 12,
    color: "#ffffff",
    fontSize: 12,
  },
  cursor: { fill: "rgba(16,185,129,0.04)" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/* Severity badge — semantic colors kept for medical data readability */
function severityStyle(s: Report["severity"]) {
  return {
    negative: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
    low:      "bg-[#10B981]/20 text-[#059669] border-[#10B981]/30",
    moderate: "bg-[#0F172A]/5 dark:bg-white/5 text-[#0F172A] dark:text-white border-[#0F172A]/10 dark:border-white/10",
    high:     "bg-[#0F172A]/10 dark:bg-white/10 text-[#0F172A] dark:text-white border-[#0F172A]/20 dark:border-white/20",
    severe:   "bg-[#0F172A]/20 dark:bg-white/20 text-[#0F172A] dark:text-white border-[#0F172A]/30 dark:border-white/30",
  }[s];
}

function simulateExport(type: "csv" | "pdf", label: string) {
  if (type === "csv") {
    const headers = ["Patient ID", "Patient Name", "Date", "Parasitaemia %", "Infected RBCs", "Species", "Severity", "Technician"];
    const rows = MOCK_REPORTS.map((r) => [
      r.patientId, r.patientName,
      new Date(r.timestamp).toLocaleDateString("en-GB"),
      r.parasitaemia.toFixed(1), r.infectedCells,
      r.species.join("; ") || "None", r.severity, r.technician,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visiondx-${label}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    alert(`PDF export — "${label}"\nBackend integration required for production PDF generation.`);
  }
}

interface SumCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  delay?: number;
}

function SumCard({ icon, label, value, sub, delay = 0 }: SumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm flex items-start gap-4"
    >
      <div className="rounded-xl p-2.5 shrink-0 bg-[#10B981]/10">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#0F172A]/50 dark:text-white/50 truncate">{label}</p>
        <p className="text-2xl font-bold text-[#0F172A] dark:text-white mt-0.5">{value}</p>
        <p className="text-xs text-[#0F172A]/40 dark:text-white/40 mt-0.5 truncate">{sub}</p>
      </div>
    </motion.div>
  );
}

const DATE_RANGES = [
  { label: "Last 7 days",  value: "7d"  },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "All time",     value: "all" },
] as const;

export default function AdminAnalyticsPage() {
  const [stats, setStats]           = useState(() => getMockDashboardStats());
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [dateRange, setDateRange]   = useState<"7d" | "30d" | "90d" | "all">("7d");
  const m = MOCK_MODEL_METRICS;

  useEffect(() => {
    const t = setTimeout(() => setStats(getMockDashboardStats()), 200);
    return () => clearTimeout(t);
  }, []);

  function handleCsvExport() {
    setExportingCsv(true);
    setTimeout(() => { simulateExport("csv", "diagnostic-reports"); setExportingCsv(false); }, 800);
  }

  function handlePdfExport() {
    setExportingPdf(true);
    setTimeout(() => { simulateExport("pdf", "system-analytics"); setExportingPdf(false); }, 600);
  }

  const positivityRate = stats.totalScans > 0
    ? ((stats.positiveScans / stats.totalScans) * 100).toFixed(1)
    : "0.0";

  const technicianScans: Record<string, number> = {};
  MOCK_REPORTS.forEach((r) => { technicianScans[r.technician] = (technicianScans[r.technician] ?? 0) + 1; });
  const techData = Object.entries(technicianScans).map(([name, count]) => ({ name, count }));

  const severityDist = ["negative", "low", "moderate", "high", "severe"].map((sev) => ({
    name: sev.charAt(0).toUpperCase() + sev.slice(1),
    count: MOCK_REPORTS.filter((r) => r.severity === sev).length,
    color: { negative: "#10B981", low: "#059669", moderate: "#0F172A", high: "#374151", severe: "#6B7280" }[sev] ?? "#10B981",
  })).filter((d) => d.count > 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">Analytics & Reports</h2>
            <p className="mt-0.5 text-sm text-[#0F172A]/50 dark:text-white/50">
              System-wide diagnostic data · {MOCK_REPORTS.length} reports available
            </p>
          </div>

          {/* Export buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={handleCsvExport}
              disabled={exportingCsv}
              className="inline-flex items-center gap-2 rounded-xl border border-[#10B981]/30 bg-white dark:bg-[#0F172A] hover:bg-[#10B981]/5 px-4 py-2 text-sm font-semibold text-[#0F172A] dark:text-white transition-colors shadow-sm disabled:opacity-60"
            >
              {exportingCsv ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} strokeWidth={1.8} />}
              Export CSV
            </button>
            <button
              onClick={handlePdfExport}
              disabled={exportingPdf}
              className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] hover:bg-[#059669] px-4 py-2 text-sm font-semibold text-white transition-colors shadow-md shadow-[#10B981]/20 disabled:opacity-60"
            >
              {exportingPdf ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} strokeWidth={1.8} />}
              Export PDF
            </button>
          </div>
        </div>

        {/* Date range filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#0F172A]/50 dark:text-white/50">
            <Filter size={13} strokeWidth={2} />
            <span>Period:</span>
          </div>
          <div className="flex items-center gap-1 bg-[#10B981]/5 dark:bg-white/5 border border-[#10B981]/10 rounded-xl p-1">
            {DATE_RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setDateRange(r.value)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  dateRange === r.value
                    ? "bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white shadow-sm border border-[#10B981]/20"
                    : "text-[#0F172A]/50 dark:text-white/50 hover:text-[#0F172A] dark:hover:text-white"
                }`}
              >
                {dateRange === r.value && <CalendarDays size={11} strokeWidth={2.5} />}
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SumCard icon={<Activity size={18} className="text-[#10B981]" strokeWidth={1.8} />} label="Total Scans"          value={stats.totalScans}                                                            sub="All time · all users"           delay={0}    />
        <SumCard icon={<AlertCircle size={18} className="text-[#10B981]" strokeWidth={1.8} />} label="Positive Cases"    value={stats.positiveScans}                                                         sub={`${positivityRate}% positivity rate`} delay={0.05} />
        <SumCard icon={<CheckCircle2 size={18} className="text-[#10B981]" strokeWidth={1.8} />} label="Negative Cases"   value={stats.totalScans - stats.positiveScans}                                       sub="Clear results"                  delay={0.1}  />
        <SumCard icon={<Users size={18} className="text-[#10B981]" strokeWidth={1.8} />}       label="Active Technicians" value={MOCK_USERS.filter((u) => u.role === "lab" && u.status === "active").length}  sub={`${MOCK_USERS.length} users total`} delay={0.15} />
      </div>

      {/* ── Charts row 1 ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Scans per day */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Scans per Day</h3>
              <p className="text-xs text-[#0F172A]/40 dark:text-white/40 mt-0.5">Last 7 days · all technicians</p>
            </div>
            <TrendingUp size={16} className="text-[#10B981]/60" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.scansByDay} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.1)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP} />
              <Bar dataKey="count" name="Scans" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Parasitaemia trend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Avg. Parasitaemia Trend</h3>
              <p className="text-xs text-[#0F172A]/40 dark:text-white/40 mt-0.5">Weekly average across all cases</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.parasitaemiaOverTime}>
              <defs>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.1)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip {...CHART_TOOLTIP} formatter={(v) => [`${v}%`, "Avg. Parasitaemia"]} />
              <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fill="url(#aGrad)" dot={{ r: 4, fill: "#10B981" }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Charts row 2 ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Severity distribution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm"
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Cases by Severity</h3>
            <p className="text-xs text-[#0F172A]/40 dark:text-white/40 mt-0.5">Distribution across all reports</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={severityDist} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={72} innerRadius={44}>
                {severityDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip {...CHART_TOOLTIP} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Scans by technician */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm"
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Scans by Technician</h3>
            <p className="text-xs text-[#0F172A]/40 dark:text-white/40 mt-0.5">Workload distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={techData} layout="vertical" barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.1)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} width={110} />
              <Tooltip {...CHART_TOOLTIP} />
              <Bar dataKey="count" name="Scans" fill="#059669" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Reports table ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#10B981]/10">
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">All Reports</h3>
            <p className="text-xs text-[#0F172A]/40 dark:text-white/40 mt-0.5">{MOCK_REPORTS.length} diagnostic reports</p>
          </div>
          <button
            onClick={handleCsvExport}
            disabled={exportingCsv}
            className="flex items-center gap-1.5 rounded-lg bg-[#10B981]/10 hover:bg-[#10B981]/20 px-3 py-1.5 text-xs font-semibold text-[#10B981] transition-colors disabled:opacity-60"
          >
            {exportingCsv ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} strokeWidth={2} />}
            Download All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-[#0F172A]/50 dark:text-white/50 uppercase tracking-wider bg-[#10B981]/5 dark:bg-white/5">
                {["Patient", "Sample ID", "Date", "Parasitaemia", "Severity", "Technician", "Export"].map((h) => (
                  <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#10B981]/10">
              {MOCK_REPORTS.map((r, i) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.04 }}
                  className="hover:bg-[#10B981]/5 dark:hover:bg-white/3 transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-[#0F172A] dark:text-white whitespace-nowrap">{r.patientName}</p>
                    <p className="text-[11px] text-[#0F172A]/40 dark:text-white/40">{r.patientId}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-mono text-[#0F172A]/50 dark:text-white/50">{r.sampleId}</td>
                  <td className="px-4 py-3.5 text-xs text-[#0F172A]/50 dark:text-white/50 whitespace-nowrap">{formatDate(r.timestamp)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`font-bold text-sm ${r.parasitaemia > 0 ? "text-red-500" : "text-[#10B981]"}`}>
                      {r.parasitaemia.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${severityStyle(r.severity)}`}>
                      {r.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#0F172A]/70 dark:text-white/70 whitespace-nowrap">{r.technician}</td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => simulateExport("pdf", `report-${r.patientId}`)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                      <Download size={12} strokeWidth={2} />
                      PDF
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
