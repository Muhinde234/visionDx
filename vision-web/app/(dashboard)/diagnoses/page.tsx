"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus, Loader2, AlertCircle, ArrowRight,
  Stethoscope, ChevronLeft, ChevronRight,
} from "lucide-react";
import { apiGetDiagnoses } from "@/lib/api";
import type { Diagnosis } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const STATUS_OPTS = ["", "pending", "complete", "reviewed"] as const;
type StatusFilter = typeof STATUS_OPTS[number];

const STATUS_CONFIG: Record<Diagnosis["status"], { label: string; cls: string }> = {
  pending:  { label: "Pending",  cls: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800" },
  complete: { label: "Complete", cls: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" },
  reviewed: { label: "Reviewed", cls: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" },
};

export default function DiagnosesPage() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [status, setStatus]       = useState<StatusFilter>("");
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const PAGE_SIZE = 20;

  const load = useCallback(async (p: number, s: StatusFilter) => {
    setLoading(true);
    setFetchError(false);
    try {
      const data = await apiGetDiagnoses({ page: p, status: s || undefined });
      setDiagnoses(data.items);
      setTotal(data.total);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page, status); }, [page, status, load]);

  function handleStatusChange(s: StatusFilter) {
    setStatus(s);
    setPage(1);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">Diagnoses</h2>
          <p className="mt-0.5 text-sm text-[#0F172A]/50 dark:text-white/50">{total} total diagnoses</p>
        </div>
        <Link href="/diagnoses/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2.5 text-sm font-semibold transition-colors">
          <Plus size={16} strokeWidth={2.5} /> New Diagnosis
        </Link>
      </motion.div>

    
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTS.map((s) => (
          <button key={s || "all"} onClick={() => handleStatusChange(s)}
            className={`rounded-xl px-4 py-1.5 text-sm font-medium transition-colors border ${
              status === s
                ? "bg-[#10B981] text-white border-[#10B981]"
                : "border-[#10B981]/20 text-[#0F172A] dark:text-white hover:bg-[#10B981]/5"
            }`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
          </button>
        ))}
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 shadow-sm overflow-hidden">
        {fetchError ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-[#0F172A]/40 dark:text-white/40">
            <AlertCircle size={24} className="text-red-400" />
            <p className="text-sm">Failed to load diagnoses.</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-40 gap-3 text-[#0F172A]/40 dark:text-white/40">
            <Loader2 className="w-5 h-5 animate-spin text-[#10B981]" />
            <span className="text-sm">Loading diagnoses…</span>
          </div>
        ) : diagnoses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-[#0F172A]/40 dark:text-white/40">
            <Stethoscope size={32} className="text-[#10B981]/30" />
            <p className="text-sm">No diagnoses found.</p>
            <Link href="/diagnoses/new" className="text-sm text-[#10B981] hover:underline">Create a diagnosis</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-[#0F172A]/50 dark:text-white/50 uppercase tracking-wider bg-[#10B981]/5 dark:bg-white/5">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Clinical Notes</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#10B981]/10">
                {diagnoses.map((d, idx) => {
                  const sc = STATUS_CONFIG[d.status] ?? STATUS_CONFIG.pending;
                  return (
                    <motion.tr key={d.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.025 }}
                      className="hover:bg-[#10B981]/5 dark:hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3.5 text-[#0F172A]/40 dark:text-white/40 text-xs">
                        {(page - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-[#0F172A] dark:text-white">
                        {d.patient_name ?? (
                          <Link href={`/patients/${d.patient_id}`} className="text-[#10B981] hover:underline">
                            View Patient
                          </Link>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[#0F172A]/60 dark:text-white/60 max-w-xs truncate">
                        {d.clinical_notes ?? "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[#0F172A]/50 dark:text-white/50 text-xs whitespace-nowrap">
                        {formatDate(d.created_at)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/diagnoses/${d.id}`}
                          className="inline-flex items-center gap-1 text-xs text-[#10B981] hover:text-[#059669] hover:underline font-medium">
                          View <ArrowRight size={12} strokeWidth={2.5} />
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#0F172A]/50 dark:text-white/50">
            Page {page} of {totalPages} · {total} diagnoses
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-xl border border-[#10B981]/20 disabled:opacity-40 hover:bg-[#10B981]/5 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 rounded-xl border border-[#10B981]/20 disabled:opacity-40 hover:bg-[#10B981]/5 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
