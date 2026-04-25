"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Plus, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { apiGetPredictionHistory } from "@/lib/api";
import type { PredictionHistoryItem, SeverityLevel } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const SEVERITY_CONFIG: Record<SeverityLevel, { label: string; cls: string }> = {
  negative: { label: "Negative",  cls: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" },
  mild:     { label: "Mild",      cls: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800" },
  moderate: { label: "Moderate",  cls: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800" },
  severe:   { label: "Severe",    cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" },
};

function SeverityBadge({ level }: { level: SeverityLevel }) {
  const cfg = SEVERITY_CONFIG[level] ?? SEVERITY_CONFIG.negative;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export default function HistoryPage() {
  const [history, setHistory] = useState<PredictionHistoryItem[] | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [search, setSearch]         = useState("");

  useEffect(() => {
    apiGetPredictionHistory()
      .then(setHistory)
      .catch(() => setFetchError(true));
  }, []);

  const filtered = history?.filter((p) =>
    p.predicted_class.toLowerCase().includes(search.toLowerCase()) ||
    p.severity_level.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">Prediction History</h2>
          <p className="mt-0.5 text-sm text-[#0F172A]/50 dark:text-white/50">
            {history ? `${history.length} total predictions` : "Loading…"}
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Scan
        </Link>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#10B981]/60" strokeWidth={2} />
        <input
          type="text"
          placeholder="Search by class or severity…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[#10B981]/20 bg-white dark:bg-[#0F172A] pl-10 pr-4 py-2.5 text-sm text-[#0F172A] dark:text-white placeholder-[#0F172A]/30 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-shadow shadow-sm"
        />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 shadow-sm overflow-hidden"
      >
        {fetchError ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-[#0F172A]/40 dark:text-white/40">
            <AlertCircle size={24} className="text-red-400" />
            <p className="text-sm">Failed to load prediction history.</p>
          </div>
        ) : history === null ? (
          <div className="flex items-center justify-center h-40 gap-3 text-[#0F172A]/40 dark:text-white/40">
            <Loader2 className="w-5 h-5 animate-spin text-[#10B981]" />
            <span className="text-sm">Loading history…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-[#0F172A]/40 dark:text-white/40">
            <p className="text-sm">No predictions found.</p>
            <Link href="/upload" className="mt-2 text-sm text-[#10B981] hover:underline">Upload a scan</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-[#0F172A]/50 dark:text-white/50 uppercase tracking-wider bg-[#10B981]/5 dark:bg-white/5">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Predicted Class</th>
                  <th className="px-5 py-3">Confidence</th>
                  <th className="px-5 py-3">Severity</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#10B981]/10">
                {filtered.map((item, idx) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-[#10B981]/5 dark:hover:bg-white/3 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-[#0F172A]/40 dark:text-white/40 text-xs">{idx + 1}</td>
                    <td className="px-5 py-3.5 font-medium text-[#0F172A] dark:text-white">
                      {item.predicted_class}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 w-24 rounded-full bg-[#10B981]/10">
                          <div
                            className="h-1.5 rounded-full bg-[#10B981]"
                            style={{ width: `${Math.round(item.confidence_score * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-[#10B981]">
                          {Math.round(item.confidence_score * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <SeverityBadge level={item.severity_level} />
                    </td>
                    <td className="px-5 py-3.5 text-[#0F172A]/50 dark:text-white/50 whitespace-nowrap text-xs">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/predictions/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs text-[#10B981] hover:text-[#059669] hover:underline font-medium"
                      >
                        View <ArrowRight size={12} strokeWidth={2.5} />
                      </Link>
                    </td>
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
