"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import StatCard from "@/components/StatCard";
import {
  Users, BrainCircuit, Zap, CheckCircle2,
  AlertTriangle, Server, BarChart3, ScrollText,
  ArrowUpRight, Stethoscope, Loader2,
} from "lucide-react";
import { apiGetUsers, apiGetAnalytics } from "@/lib/api";
import { MOCK_LOGS, MOCK_MODEL_METRICS } from "@/lib/mock-data";
import type { User, AnalyticsDashboard } from "@/lib/types";



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

const SEVERITY_COLORS: Record<string, string> = {
  negative: "#10B981",
  mild:     "#FBBF24",
  moderate: "#F97316",
  severe:   "#EF4444",
};

const ROLE_LABEL: Record<string, string> = {
  admin:          "Admin",
  doctor:         "Doctor",
  lab_technician: "Lab Tech",
  technician:     "Technician",
};

const LOG_LEVEL_STYLE = {
  info:  "bg-[#10B981]/10 text-[#10B981]",
  warn:  "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  error: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}



export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [users, setUsers]         = useState<User[]>([]);
  const [userTotal, setUserTotal] = useState<number | null>(null);
  const [loading, setLoading]     = useState(true);

  const m = MOCK_MODEL_METRICS;

  useEffect(() => {
    Promise.allSettled([
      apiGetAnalytics(),
      apiGetUsers({ page_size: 5, page: 1 }),
    ]).then(([analyticsRes, usersRes]) => {
      if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value);
      if (usersRes.status === "fulfilled") {
        setUsers(usersRes.value.items);
        setUserTotal(usersRes.value.total);
      }
      setLoading(false);
    });
  }, []);


  const trendData = analytics?.recent_trend ?? [];

  const severityData = analytics
    ? Object.entries(analytics.severity_breakdown).map(([key, val]) => ({
        name:  key.charAt(0).toUpperCase() + key.slice(1),
        value: val,
        color: SEVERITY_COLORS[key] ?? "#94A3B8",
      }))
    : [];

  const activeUsers = users.filter((u) => u.is_active).length;
  const recentLogs  = MOCK_LOGS.slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-[#0F172A]/200 border border-[#10B981]/20 text-white p-6"
      >
        <div className="absolute -top-16 right-0 h-40 w-64 rounded-full bg-[#10B981]/8 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#10B981]  tracking-wider mb-1">Admin Console</p>
            <h2 className="text-xl font-bold text-white">System Overview</h2>
            <p className="mt-1 text-sm text-white/50">VisionDX — AI Malaria Diagnostics Platform</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 px-4 py-2.5 shrink-0">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-sm font-semibold text-[#10B981]">{m.version}</span>
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap gap-2">
          {[
            { href: "/admin/analytics", label: "Analytics",   icon: BarChart3    },
            { href: "/admin/users",     label: "Users",        icon: Users        },
            { href: "/admin/logs",      label: "System Logs",  icon: ScrollText   },
            { href: "/admin/model",     label: "Model",        icon: BrainCircuit },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-[#10B981]/10 border border-white/10 hover:border-[#10B981]/30 px-3 py-1.5 text-xs font-medium text-white/70 hover:text-[#10B981] transition-all">
              <Icon size={13} strokeWidth={2} />
              {label}
              <ArrowUpRight size={11} strokeWidth={2.5} className="text-white/30" />
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={loading ? "—" : (userTotal ?? "—")}
          subtitle={loading ? "Loading…" : `${activeUsers} active`}
          delay={0} trend={2} trendUnit=" users"
          icon={<Users size={18} strokeWidth={1.8} />}
        />
        <StatCard
          title="Total Diagnoses"
          value={loading ? "—" : (analytics?.total_diagnoses ?? "—")}
          subtitle="All time"
          delay={0.05} trend={18}
          icon={<Stethoscope size={18} strokeWidth={1.8} />}
        />
        <StatCard
          title="Positive Cases"
          value={loading ? "—" : (analytics?.positive_cases ?? "—")}
          subtitle={analytics ? `${analytics.positivity_rate.toFixed(1)}% positivity` : "Loading…"}
          delay={0.1} trend={0}
          icon={<AlertTriangle size={18} strokeWidth={1.8} />}
        />
        <StatCard
          title="Avg. Inference"
          value={`${m.inferenceTimeMs} ms`}
          subtitle="Per image"
          delay={0.15} trend={-12} trendUnit=" ms"
          icon={<Zap size={18} strokeWidth={1.8} />}
        />
      </div>

      {/* ── System health strip ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3">
          <Server size={14} className="text-[#10B981]" strokeWidth={1.8} />
          <h3 className="text-xs font-semibold text-[#0F172A] dark:text-white uppercase tracking-wider">System Health</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "AI Model",   status: "online",  detail: m.version.split("-v")[0] },
            { label: "API Server", status: "online",  detail: "Latency 28 ms"          },
            { label: "Storage",    status: "warning", detail: "74% used (148 GB)"      },
            { label: "Uptime",     status: "online",  detail: "99.8% — 14 days"        },
          ].map(({ label, status, detail }) => (
            <div key={label} className="flex items-center gap-2.5 rounded-xl bg-[#10B981]/5 dark:bg-white/5 border border-[#10B981]/10 px-3 py-2.5">
              <div className="shrink-0">
                {status === "warning"
                  ? <AlertTriangle size={15} strokeWidth={2} className="text-amber-500" />
                  : <CheckCircle2  size={15} strokeWidth={2} className="text-[#10B981]" />
                }
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#0F172A] dark:text-white truncate">{label}</p>
                <p className="text-[10px] text-[#0F172A]/50 dark:text-white/50 truncate">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Charts row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Diagnoses trend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Diagnoses Trend</h3>
            {loading && <Loader2 size={14} className="animate-spin text-[#10B981]" />}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trendData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.1)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP} />
              <Bar dataKey="count" name="Diagnoses" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Severity breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Severity Breakdown</h3>
            {loading && <Loader2 size={14} className="animate-spin text-[#10B981]" />}
          </div>
          {severityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={severityData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {severityData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...CHART_TOOLTIP} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-[#0F172A]/30 dark:text-white/30 text-sm">
              {loading ? "Loading…" : "No data yet"}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Bottom row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Recent logs (still mock — no real log endpoint) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#10B981]/10">
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Recent Activity</h3>
            <Link href="/admin/logs" className="text-xs text-[#10B981] hover:text-[#059669] font-medium transition-colors">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-[#10B981]/10">
            {recentLogs.map((log) => (
              <li key={log.id} className="flex items-start gap-3 px-5 py-3">
                <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${LOG_LEVEL_STYLE[log.level]}`}>
                  {log.level}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#0F172A] dark:text-white truncate">{log.action}</p>
                  <p className="text-[11px] text-[#0F172A]/50 dark:text-white/50 truncate">{log.details}</p>
                </div>
                <span className="shrink-0 text-[11px] text-[#0F172A]/40 dark:text-white/40 font-mono">
                  {formatTime(log.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Real users preview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#10B981]/10">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Users</h3>
              {userTotal !== null && (
                <span className="text-xs text-[#0F172A]/40 dark:text-white/40">({userTotal} total)</span>
              )}
            </div>
            <Link href="/admin/users" className="text-xs text-[#10B981] hover:text-[#059669] font-medium transition-colors">
              Manage
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32 gap-2 text-[#0F172A]/40 dark:text-white/40">
              <Loader2 size={16} className="animate-spin text-[#10B981]" />
              <span className="text-sm">Loading users…</span>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-[#0F172A]/40 dark:text-white/40">
              <p className="text-sm">No users yet.</p>
              <Link href="/admin/users" className="text-sm text-[#10B981] hover:underline">Add first user</Link>
            </div>
          ) : (
            <ul className="divide-y divide-[#10B981]/10">
              {users.map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-[#10B981] flex items-center justify-center text-xs font-bold text-white uppercase">
                    {u.full_name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#0F172A] dark:text-white truncate">{u.full_name}</p>
                    <p className="text-[11px] text-[#0F172A]/50 dark:text-white/50 truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-medium text-[#0F172A]/50 dark:text-white/50">
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                    <span className={`h-2 w-2 rounded-full ${u.is_active ? "bg-[#10B981]" : "bg-[#0F172A]/20 dark:bg-white/20"}`} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </div>
  );
}
