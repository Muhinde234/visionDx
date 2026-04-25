"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertTriangle, X, Info, Loader2, ArrowRight } from "lucide-react";
import { apiGetDiagnoses } from "@/lib/api";
import type { Diagnosis, Prediction, SeverityLevel } from "@/lib/types";

const SEVERITY_STYLE: Record<SeverityLevel, string> = {
  negative: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
  mild:     "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  moderate: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  severe:   "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
};

const STATUS_STYLE = {
  pending:  "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  complete: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
  reviewed: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
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

function DiagnosisModal({ diagnosis, onClose }: { diagnosis: Diagnosis; onClose: () => void }) {
  const pred = latestPrediction(diagnosis);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 shadow-2xl"
      >
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-[#10B981]/20 bg-white dark:bg-[#0F172A] rounded-t-2xl z-10">
          <div>
            <h3 className="text-base font-bold text-[#0F172A] dark:text-white">Diagnosis Report</h3>
            <p className="text-xs text-[#0F172A]/40 dark:text-white/40 font-mono">
              {diagnosis.id.slice(0, 8)}… · {formatDate(diagnosis.created_at)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#0F172A]/40 dark:text-white/40 hover:bg-[#10B981]/5 transition-colors"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient & status */}
          <section>
            <h4 className="text-xs font-semibold text-[#0F172A]/50 dark:text-white/50 uppercase tracking-wider mb-3">
              Patient Information
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Patient",      value: diagnosis.patient_name ?? "—" },
                { label: "Patient ID",   value: diagnosis.patient_id },
                { label: "Diagnosis ID", value: diagnosis.id },
                { label: "Date",         value: formatDate(diagnosis.created_at) },
                {
                  label: "Status",
                  value: (
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[diagnosis.status]}`}>
                      {diagnosis.status}
                    </span>
                  ),
                },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-xs text-[#0F172A]/50 dark:text-white/50">{f.label}</p>
                  <div className="text-sm font-medium text-[#0F172A] dark:text-white mt-0.5">{f.value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Clinical notes */}
          {diagnosis.clinical_notes && (
            <section>
              <h4 className="text-xs font-semibold text-[#0F172A]/50 dark:text-white/50 uppercase tracking-wider mb-3">
                Clinical Notes
              </h4>
              <p className="text-sm text-[#0F172A] dark:text-white/80 rounded-xl bg-[#10B981]/5 border border-[#10B981]/20 p-4">
                {diagnosis.clinical_notes}
              </p>
            </section>
          )}

          {/* AI result */}
          {pred ? (
            <section>
              <h4 className="text-xs font-semibold text-[#0F172A]/50 dark:text-white/50 uppercase tracking-wider mb-3">
                AI Detection Result
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Predicted Class", value: pred.predicted_class },
                  { label: "Confidence",       value: `${Math.round(pred.confidence_score * 100)}%` },
                  { label: "Inference",        value: `${pred.inference_time_ms} ms` },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl bg-[#10B981]/5 dark:bg-white/5 border border-[#10B981]/20 p-3">
                    <p className="text-xs text-[#0F172A]/50 dark:text-white/50">{m.label}</p>
                    <p className="text-base font-bold mt-0.5 text-[#0F172A] dark:text-white">{m.value}</p>
                  </div>
                ))}
                <div className="rounded-xl bg-[#10B981]/5 dark:bg-white/5 border border-[#10B981]/20 p-3">
                  <p className="text-xs text-[#0F172A]/50 dark:text-white/50 mb-1">Severity</p>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${SEVERITY_STYLE[pred.severity_level]}`}>
                    {pred.severity_level}
                  </span>
                </div>
              </div>
              {pred.recommendation && (
                <div className="mt-3 rounded-xl bg-[#10B981]/5 border border-[#10B981]/20 p-4">
                  <p className="text-xs font-semibold text-[#10B981] mb-1">Clinical Recommendation</p>
                  <p className="text-sm text-[#0F172A] dark:text-white/80">{pred.recommendation}</p>
                </div>
              )}
            </section>
          ) : (
            <p className="text-sm text-[#0F172A]/40 dark:text-white/40 italic">
              No prediction results yet for this diagnosis.
            </p>
          )}

          <p className="text-xs text-[#0F172A]/40 dark:text-white/40 leading-relaxed flex items-start gap-1.5">
            <Info size={13} className="shrink-0 mt-0.5" strokeWidth={2} />
            This report is AI-generated and must be reviewed and validated by a qualified clinical microscopist before clinical decision-making.
          </p>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-[#10B981]/20 bg-white dark:bg-[#0F172A] rounded-b-2xl">
          <button
            onClick={onClose}
            className="rounded-xl border border-[#10B981]/30 px-4 py-2 text-sm font-medium text-[#0F172A] dark:text-white hover:bg-[#10B981]/5 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const PAGE_SIZE = 20;

export default function ReportsPage() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<Diagnosis | null>(null);
  const [search, setSearch]       = useState("");

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const data = await apiGetDiagnoses({ page: p });
      setDiagnoses(data.items);
      setTotal(data.total);
    } catch {
      setDiagnoses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const filtered = diagnoses.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.patient_name?.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      d.patient_id.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">Reports</h2>
          <p className="mt-0.5 text-sm text-[#0F172A]/50 dark:text-white/50">
            {total} diagnostic records · view only
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-[#0F172A]/5 dark:bg-white/5 border border-[#0F172A]/10 dark:border-white/10 px-3 py-2 text-xs text-[#0F172A]/70 dark:text-white/70">
          <AlertTriangle size={13} className="shrink-0" strokeWidth={2} />
          Report export &amp; analytics are admin-only features
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#10B981]/60" strokeWidth={2} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient name or diagnosis ID…"
          className="w-full rounded-xl border border-[#10B981]/20 bg-white dark:bg-[#0F172A] pl-10 pr-4 py-2.5 text-sm text-[#0F172A] dark:text-white placeholder-[#0F172A]/30 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#10B981] shadow-sm transition-shadow"
        />
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-[#0F172A]/40 dark:text-white/40">
            <Loader2 className="w-5 h-5 animate-spin text-[#10B981]" />
            <span className="text-sm">Loading reports…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-[#0F172A]/40 dark:text-white/40">
            <p className="text-sm">{search ? "No matching records." : "No diagnoses yet."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-[#0F172A]/50 dark:text-white/50 uppercase tracking-wider bg-[#10B981]/5 dark:bg-white/5">
                  {["Patient", "Diagnosis ID", "Date", "Status", "Prediction", "Severity", ""].map((h) => (
                    <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#10B981]/10">
                {filtered.map((d, i) => {
                  const pred = latestPrediction(d);
                  return (
                    <motion.tr
                      key={d.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-[#10B981]/5 dark:hover:bg-white/3 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-medium text-[#0F172A] dark:text-white whitespace-nowrap">
                        {d.patient_name ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-[#0F172A]/50 dark:text-white/50 text-xs font-mono">
                        {d.id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3.5 text-[#0F172A]/50 dark:text-white/50 text-xs whitespace-nowrap">
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
                          : <span className="text-[#0F172A]/30 dark:text-white/30 italic">Pending</span>
                        }
                      </td>
                      <td className="px-4 py-3.5">
                        {pred ? (
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${SEVERITY_STYLE[pred.severity_level]}`}>
                            {pred.severity_level}
                          </span>
                        ) : (
                          <span className="text-[#0F172A]/30 dark:text-white/30 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setSelected(d)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap"
                        >
                          View <ArrowRight size={12} strokeWidth={2.5} />
                        </button>
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
        <div className="flex items-center justify-between text-sm">
          <p className="text-[#0F172A]/50 dark:text-white/50 text-xs">
            Page {page} of {totalPages} · {total} total
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-xl border border-[#10B981]/20 px-4 py-2 text-xs font-medium text-[#0F172A] dark:text-white hover:bg-[#10B981]/5 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl bg-[#10B981] hover:bg-[#059669] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selected && <DiagnosisModal diagnosis={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
