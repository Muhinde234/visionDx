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
import { apiGetAnalytics, apiGetUsers, apiGetDiagnoses, apiExportCsv, apiExportPdf } from "@/lib/api";
import type { AnalyticsDashboard, Diagnosis, Prediction, SeverityLevel, User } from "@/lib/types";

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

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  negative: "#10B981",
  mild:     "#FBBF24",
  moderate: "#F97316",
  severe:   "#EF4444",
};

const STATUS_STYLE = {
  pending:  "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  complete: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
  reviewed: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
};

const ROLE_COLORS: Record<string, string> = {
  admin:          "#10B981",
  doctor:         "#3B82F6",
  lab_technician: "#8B5CF6",
  technician:     "#F97316",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function latestPrediction(d: Diagnosis): Prediction | null {
  if (!d.predictions?.length) return null;
  return [...d.predictions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0];
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
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm flex items-start gap-4"
    >
      <div className="rounded-xl p-2.5 shrink-0 bg-[#10B981]/10">{icon}</div>
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
  const [analytics, setAnalytics]   = useState<AnalyticsDashboard | null>(null);
  const [users, setUsers]           = useState<User[]>([]);
  const [userTotal, setUserTotal]   = useState<number | null>(null);
  const [diagnoses, setDiagnoses]   = useState<Diagnosis[]>([]);
  const [diagTotal, setDiagTotal]   = useState<number | null>(null);
  const [loading, setLoading]       = useState(true);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [dateRange, setDateRange]   = useState<"7d" | "30d" | "90d" | "all">("7d");

  useEffect(() => {
    Promise.allSettled([
      apiGetAnalytics(),
      apiGetUsers({ page_size: 100 }),
      apiGetDiagnoses({ page: 1 }),
    ]).then(([aRes, uRes, dRes]) => {
      if (aRes.status === "fulfilled") setAnalytics(aRes.value);
      if (uRes.status === "fulfilled") { setUsers(uRes.value.items); setUserTotal(uRes.value.total); }
      if (dRes.status === "fulfilled") { setDiagnoses(dRes.value.items); setDiagTotal(dRes.value.total); }
      setLoading(false);
    });
  }, []);

  // ── derived chart data ────────────────────────────────────────────────────────

  const trendData = analytics?.recent_trend ?? [];

  const stageData = analytics
    ? Object.entries(analytics.stage_breakdown ?? {}).map(([key, val]) => ({ name: key, count: val as number }))
    : [];

  const severityData = analytics
    ? Object.entries(analytics.severity_breakdown).map(([key, val]) => ({
        name:  key.charAt(0).toUpperCase() + key.slice(1),
        value: val as number,
        color: SEVERITY_COLORS[key as SeverityLevel] ?? "#94A3B8",
      })).filter((d) => d.value > 0)
    : [];

  const roleData = (() => {
    const counts: Record<string, number> = {};
    users.forEach((u) => { counts[u.role] = (counts[u.role] ?? 0) + 1; });
    return Object.entries(counts).map(([role, count]) => ({
      name: role.replace("_", " "),
      count,
      fill: ROLE_COLORS[role] ?? "#94A3B8",
    }));
  })();

  const activeUsers   = users.filter((u) => u.is_active).length;
  const positiveCount = analytics?.positive_cases ?? 0;
  const totalDiag     = analytics?.total_diagnoses ?? 0;
  const negativeCount = totalDiag - positiveCount;
  const positivityPct = analytics ? `${analytics.positivity_rate.toFixed(1)}% positivity` : "—";

  // ── Exports ───────────────────────────────────────────────────────────────────

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement("a");
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCsvExport() {
    setExportingCsv(true);
    try {
      const blob = await apiExportCsv();
      triggerDownload(blob, `visiondx-export-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch {
      // fallback: build CSV from loaded data
      const headers = ["Diagnosis ID", "Patient", "Date", "Status", "Prediction", "Confidence", "Severity"];
      const rows = diagnoses.map((d) => {
        const p = latestPrediction(d);
        return [
          d.id, d.patient_name ?? d.patient_id,
          new Date(d.created_at).toLocaleDateString("en-GB"),
          d.status,
          p?.predicted_class ?? "",
          p ? `${Math.round(p.confidence_score * 100)}%` : "",
          p?.severity_level ?? "",
        ];
      });
      const csv  = [headers, ...rows].map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      triggerDownload(blob, `visiondx-diagnoses-${new Date().toISOString().slice(0, 10)}.csv`);
    } finally {
      setExportingCsv(false);
    }
  }

  async function handlePdfExport() {
    setExportingPdf(true);
    try {
      const blob = await apiExportPdf();
      triggerDownload(blob, `visiondx-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "PDF export failed.");
    } finally {
      setExportingPdf(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">Analytics & Reports</h2>
            <p className="mt-0.5 text-sm text-[#0F172A]/50 dark:text-white/50">
              System-wide diagnostic data
              {diagTotal !== null && ` · ${diagTotal} diagnoses`}
              {loading && " · loading…"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={handleCsvExport}
              disabled={exportingCsv || diagnoses.length === 0}
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

        {/* Date range filter (UI only — filtered server-side not yet supported) */}
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
        <SumCard
          icon={<Activity size={18} className="text-[#10B981]" strokeWidth={1.8} />}
          label="Total Diagnoses" value={loading ? "—" : totalDiag}
          sub="All time · all users" delay={0}
        />
        <SumCard
          icon={<AlertCircle size={18} className="text-[#10B981]" strokeWidth={1.8} />}
          label="Positive Cases" value={loading ? "—" : positiveCount}
          sub={loading ? "Loading…" : positivityPct} delay={0.05}
        />
        <SumCard
          icon={<CheckCircle2 size={18} className="text-[#10B981]" strokeWidth={1.8} />}
          label="Negative Cases" value={loading ? "—" : negativeCount}
          sub="Clear results" delay={0.1}
        />
        <SumCard
          icon={<Users size={18} className="text-[#10B981]" strokeWidth={1.8} />}
          label="Total Users" value={loading ? "—" : (userTotal ?? "—")}
          sub={loading ? "Loading…" : `${activeUsers} active`} delay={0.15}
        />
      </div>

      {/* ── Charts row 1 ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Diagnoses trend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Diagnoses Trend</h3>
              <p className="text-xs text-[#0F172A]/40 dark:text-white/40 mt-0.5">Recent activity</p>
            </div>
            {loading ? <Loader2 size={14} className="animate-spin text-[#10B981]" /> : <TrendingUp size={16} className="text-[#10B981]/60" />}
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.1)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} />
                <Tooltip {...CHART_TOOLTIP} />
                <Bar dataKey="count" name="Diagnoses" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-[#0F172A]/30 dark:text-white/30 text-sm">
              {loading ? "Loading…" : "No trend data yet"}
            </div>
          )}
        </motion.div>

        {/* Cases by stage */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Cases by Stage</h3>
              <p className="text-xs text-[#0F172A]/40 dark:text-white/40 mt-0.5">Malaria stage distribution</p>
            </div>
            {loading && <Loader2 size={14} className="animate-spin text-[#10B981]" />}
          </div>
          {stageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stageData} layout="vertical" barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.1)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip {...CHART_TOOLTIP} />
                <Bar dataKey="count" name="Cases" fill="#059669" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-[#0F172A]/30 dark:text-white/30 text-sm">
              {loading ? "Loading…" : "No stage data yet"}
            </div>
          )}
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
            <p className="text-xs text-[#0F172A]/40 dark:text-white/40 mt-0.5">Distribution across all diagnoses</p>
          </div>
          {severityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} innerRadius={44}>
                  {severityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip {...CHART_TOOLTIP} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-[#0F172A]/30 dark:text-white/30 text-sm">
              {loading ? "Loading…" : "No severity data yet"}
            </div>
          )}
        </motion.div>

        {/* Users by role */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm"
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Users by Role</h3>
            <p className="text-xs text-[#0F172A]/40 dark:text-white/40 mt-0.5">
              {userTotal !== null ? `${userTotal} registered users` : "Workload distribution"}
            </p>
          </div>
          {roleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={roleData} layout="vertical" barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.1)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} width={110} />
                <Tooltip {...CHART_TOOLTIP} />
                <Bar dataKey="count" name="Users" radius={[0, 6, 6, 0]}>
                  {roleData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-[#0F172A]/30 dark:text-white/30 text-sm">
              {loading ? "Loading…" : "No user data yet"}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Diagnoses table ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#10B981]/10">
          <div>
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Recent Diagnoses</h3>
            <p className="text-xs text-[#0F172A]/40 dark:text-white/40 mt-0.5">
              {diagTotal !== null ? `${diagTotal} total records` : "Loading…"}
            </p>
          </div>
          <button
            onClick={handleCsvExport}
            disabled={exportingCsv || diagnoses.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-[#10B981]/10 hover:bg-[#10B981]/20 px-3 py-1.5 text-xs font-semibold text-[#10B981] transition-colors disabled:opacity-60"
          >
            {exportingCsv ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} strokeWidth={2} />}
            Download CSV
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32 gap-2 text-[#0F172A]/40 dark:text-white/40">
            <Loader2 size={16} className="animate-spin text-[#10B981]" />
            <span className="text-sm">Loading diagnoses…</span>
          </div>
        ) : diagnoses.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-[#0F172A]/40 dark:text-white/40 text-sm">
            No diagnoses yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-[#0F172A]/50 dark:text-white/50 uppercase tracking-wider bg-[#10B981]/5 dark:bg-white/5">
                  {["Patient", "Date", "Status", "Prediction", "Confidence", "Severity"].map((h) => (
                    <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#10B981]/10">
                {diagnoses.map((d, i) => {
                  const pred = latestPrediction(d);
                  return (
                    <motion.tr
                      key={d.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.03 }}
                      className="hover:bg-[#10B981]/5 dark:hover:bg-white/3 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-[#0F172A] dark:text-white whitespace-nowrap">
                          {d.patient_name ?? "—"}
                        </p>
                        <p className="text-[11px] text-[#0F172A]/40 dark:text-white/40 font-mono">{d.id.slice(0, 8)}…</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#0F172A]/50 dark:text-white/50 whitespace-nowrap">
                        {formatDate(d.created_at)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[d.status]}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#0F172A]/70 dark:text-white/70">
                        {pred
                          ? pred.predicted_class
                          : <span className="italic text-[#0F172A]/30 dark:text-white/30">Pending</span>
                        }
                      </td>
                      <td className="px-4 py-3.5">
                        {pred ? (
                          <span className="font-bold text-sm text-[#10B981]">
                            {Math.round(pred.confidence_score * 100)}%
                          </span>
                        ) : (
                          <span className="text-xs text-[#0F172A]/30 dark:text-white/30">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {pred ? (
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                            {
                              negative: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
                              mild:     "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
                              moderate: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
                              severe:   "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
                            }[pred.severity_level]
                          }`}>
                            {pred.severity_level}
                          </span>
                        ) : (
                          <span className="text-xs text-[#0F172A]/30 dark:text-white/30">—</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
