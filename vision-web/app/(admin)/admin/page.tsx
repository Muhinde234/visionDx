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
  Users, ImageIcon, BrainCircuit, Zap,
  CheckCircle2, AlertTriangle, Server,
  BarChart3, ScrollText, ArrowUpRight,
} from "lucide-react";
import { MOCK_USERS, MOCK_LOGS, MOCK_MODEL_METRICS, getMockDashboardStats } from "@/lib/mock-data";
import type { DashboardStats } from "@/lib/types";

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

/* Log level badge styles — strict palette only */
const LOG_LEVEL_STYLE = {
  info:  "bg-[#10B981]/10 text-[#10B981]",
  warn:  "bg-[#10B981]/20 text-[#059669] dark:text-[#10B981]",
  error: "bg-[#0F172A]/10 dark:bg-white/10 text-[#0F172A] dark:text-white",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setStats(getMockDashboardStats()), 400);
    return () => clearTimeout(t);
  }, []);

  const activeUsers = MOCK_USERS.filter((u) => u.status === "active").length;
  const recentLogs  = MOCK_LOGS.slice(0, 5);
  const m           = MOCK_MODEL_METRICS;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Hero banner ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-[#0F172A] border border-[#10B981]/20 text-white p-6"
      >
        {/* Decorative glow */}
        <div className="absolute -top-16 right-0 h-40 w-64 rounded-full bg-[#10B981]/8 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#10B981] uppercase tracking-wider mb-1">Admin Console</p>
            <h2 className="text-xl font-bold text-white">System Overview</h2>
            <p className="mt-1 text-sm text-white/50">VisionDX — AI Malaria Diagnostics Platform</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 px-4 py-2.5 shrink-0">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-sm font-semibold text-[#10B981]">{m.version}</span>
          </div>
        </div>

        {/* Quick-access nav pills */}
        <div className="relative mt-5 flex flex-wrap gap-2">
          {[
            { href: "/admin/analytics", label: "Analytics",   icon: BarChart3    },
            { href: "/admin/users",     label: "Users",        icon: Users        },
            { href: "/admin/logs",      label: "System Logs",  icon: ScrollText   },
            { href: "/admin/model",     label: "Model",        icon: BrainCircuit },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-[#10B981]/10 border border-white/10 hover:border-[#10B981]/30 px-3 py-1.5 text-xs font-medium text-white/70 hover:text-[#10B981] transition-all"
            >
              <Icon size={13} strokeWidth={2} />
              {label}
              <ArrowUpRight size={11} strokeWidth={2.5} className="text-white/30" />
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Users"    value={MOCK_USERS.length}          subtitle={`${activeUsers} active`}          delay={0}    trend={2}   trendUnit=" users" icon={<Users       size={18} strokeWidth={1.8} />} />
        <StatCard title="Total Scans"    value={stats?.totalScans ?? "—"}   subtitle="All time"                         delay={0.05} trend={18}             icon={<ImageIcon   size={18} strokeWidth={1.8} />} />
        <StatCard title="Model Accuracy" value={`${m.accuracy}%`}           subtitle={`v${m.version.split("-v")[1] ?? ""}`} delay={0.1}  trend={0}              icon={<BrainCircuit size={18} strokeWidth={1.8} />} />
        <StatCard title="Avg. Inference" value={`${m.inferenceTimeMs} ms`}  subtitle="Per image"                        delay={0.15} trend={-12} trendUnit=" ms" icon={<Zap         size={18} strokeWidth={1.8} />} />
      </div>

      {/* ── System health strip ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
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
            <div
              key={label}
              className="flex items-center gap-2.5 rounded-xl bg-[#10B981]/5 dark:bg-white/5 border border-[#10B981]/10 px-3 py-2.5"
            >
              <div className="shrink-0">
                {status === "warning"
                  ? <AlertTriangle size={15} strokeWidth={2} className="text-[#0F172A]/60 dark:text-white/60" />
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
        {/* Scans per day */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white mb-4">Scans This Week</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.scansByDay ?? []} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.1)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP} />
              <Bar dataKey="count" name="Scans" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Species distribution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white mb-4">Detections by Species</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={m.detectionsBySpecies}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={40}
              >
                {m.detectionsBySpecies.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip {...CHART_TOOLTIP} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Bottom row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent logs */}
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

        {/* User list preview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#10B981]/10">
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Users</h3>
            <Link href="/admin/users" className="text-xs text-[#10B981] hover:text-[#059669] font-medium transition-colors">
              Manage
            </Link>
          </div>
          <ul className="divide-y divide-[#10B981]/10">
            {MOCK_USERS.slice(0, 5).map((u) => (
              <li key={u.id} className="flex items-center gap-3 px-5 py-3">
                <div className="h-8 w-8 shrink-0 rounded-full bg-[#10B981] flex items-center justify-center text-xs font-bold text-white uppercase">
                  {u.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#0F172A] dark:text-white truncate">{u.name}</p>
                  <p className="text-[11px] text-[#0F172A]/50 dark:text-white/50 truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-[#0F172A]/50 dark:text-white/50 capitalize">{u.role}</span>
                  <span className={`h-2 w-2 rounded-full ${
                    u.status === "active"
                      ? "bg-[#10B981]"
                      : "bg-[#0F172A]/20 dark:bg-white/20"
                  }`} />
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
