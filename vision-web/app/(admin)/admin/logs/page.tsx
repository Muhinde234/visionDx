"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCw, Loader2 } from "lucide-react";
import { MOCK_LOGS } from "@/lib/mock-data";
import type { SystemLog } from "@/lib/types";

/* Semantic severity colors — kept intentional for log triage */
const LEVEL_STYLE: Record<SystemLog["level"], string> = {
  info:  "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
  warn:  "bg-[#0F172A]/5 dark:bg-white/5 text-[#0F172A] dark:text-white border-[#0F172A]/10 dark:border-white/10",
  error: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800",
};

const LEVEL_DOT: Record<SystemLog["level"], string> = {
  info:  "bg-[#10B981]",
  warn:  "bg-[#0F172A]/60 dark:bg-white/60",
  error: "bg-red-500",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export default function LogsPage() {
  const [logs, setLogs]     = useState<SystemLog[]>([]);
  const [filter, setFilter] = useState<"all" | SystemLog["level"]>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setLogs(MOCK_LOGS), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (logs.length === 0) return;
    const interval = setInterval(() => {
      const newLog: SystemLog = {
        id: `live-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: Math.random() > 0.8 ? "warn" : "info",
        user: "system",
        action: "HEARTBEAT",
        details: `System health check — all services nominal (${Date.now()})`,
        ip: "127.0.0.1",
      };
      setLogs((prev) => [newLog, ...prev].slice(0, 50));
    }, 15000);
    return () => clearInterval(interval);
  }, [logs.length]);

  const filtered = logs.filter((l) => {
    const matchLevel  = filter === "all" || l.level === filter;
    const matchSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.user.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  const counts = {
    info:  logs.filter((l) => l.level === "info").length,
    warn:  logs.filter((l) => l.level === "warn").length,
    error: logs.filter((l) => l.level === "error").length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">System Logs</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            <p className="text-sm text-[#0F172A]/50 dark:text-white/50">Live feed · {logs.length} total events</p>
          </div>
        </div>
        <button
          onClick={() => setLogs(MOCK_LOGS)}
          className="inline-flex items-center gap-2 rounded-xl border border-[#10B981]/30 px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-white hover:bg-[#10B981]/5 transition-colors"
        >
          <RefreshCw size={15} strokeWidth={2} />
          Reset
        </button>
      </motion.div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {(["all", "info", "warn", "error"] as const).map((level) => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors capitalize border ${
              filter === level
                ? level === "all"
                  ? "bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] border-transparent"
                  : `${LEVEL_STYLE[level as SystemLog["level"]]} border`
                : "border-[#10B981]/20 text-[#0F172A]/50 dark:text-white/50 hover:bg-[#10B981]/5"
            }`}
          >
            {level === "all" ? `All (${logs.length})` : `${level} (${counts[level as SystemLog["level"]]})`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#10B981]/60" strokeWidth={2} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by action, details, or user…"
          className="w-full rounded-xl border border-[#10B981]/20 bg-white dark:bg-[#0F172A] pl-10 pr-4 py-2.5 text-sm text-[#0F172A] dark:text-white placeholder-[#0F172A]/30 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#10B981] shadow-sm"
        />
      </div>

      {/* Log table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 shadow-sm overflow-hidden"
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-40 gap-3 text-[#0F172A]/40 dark:text-white/40">
            <Loader2 className="w-5 h-5 animate-spin text-[#10B981]" />
            <span className="text-sm">Loading logs…</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-[#0F172A]/50 dark:text-white/50 uppercase tracking-wider bg-[#10B981]/5 dark:bg-white/5">
                  <th className="px-5 py-3">Level</th>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Details</th>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#10B981]/10 font-mono text-xs">
                {filtered.map((log, i) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.2) }}
                    className="hover:bg-[#10B981]/5 dark:hover:bg-white/3 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${LEVEL_STYLE[log.level]}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${LEVEL_DOT[log.level]}`} />
                        {log.level}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#0F172A]/50 dark:text-white/50 whitespace-nowrap">{formatDate(log.timestamp)}</td>
                    <td className="px-5 py-3 font-semibold text-[#0F172A] dark:text-white whitespace-nowrap">{log.action}</td>
                    <td className="px-5 py-3 text-[#0F172A]/70 dark:text-white/70 max-w-xs truncate normal-case">{log.details}</td>
                    <td className="px-5 py-3 text-[#0F172A]/50 dark:text-white/50">{log.user}</td>
                    <td className="px-5 py-3 text-[#0F172A]/40 dark:text-white/40">{log.ip}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
