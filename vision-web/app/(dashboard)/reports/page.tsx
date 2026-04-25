"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertTriangle, X, Info, Loader2, ArrowRight } from "lucide-react";
import { MOCK_REPORTS } from "@/lib/mock-data";
import type { Report } from "@/lib/types";

function severityStyle(s: Report["severity"]) {
  return {
    negative: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20",
    low:      "bg-[#10B981]/20 text-[#059669] border-[#10B981]/30",
    moderate: "bg-[#0F172A]/5 dark:bg-white/5 text-[#0F172A] dark:text-white border-[#0F172A]/10 dark:border-white/10",
    high:     "bg-[#0F172A]/10 dark:bg-white/10 text-[#0F172A] dark:text-white border-[#0F172A]/20 dark:border-white/20",
    severe:   "bg-[#0F172A]/20 dark:bg-white/20 text-[#0F172A] dark:text-white border-[#0F172A]/30 dark:border-white/30",
  }[s];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function ReportModal({ report, onClose }: { report: Report; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
        {/* Modal header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-[#10B981]/20 bg-white dark:bg-[#0F172A] rounded-t-2xl z-10">
          <div>
            <h3 className="text-base font-bold text-[#0F172A] dark:text-white">Diagnostic Report</h3>
            <p className="text-xs text-[#0F172A]/40 dark:text-white/40">{report.sampleId} · {formatDate(report.timestamp)}</p>
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
          {/* Patient info */}
          <section>
            <h4 className="text-xs font-semibold text-[#0F172A]/50 dark:text-white/50 uppercase tracking-wider mb-3">Patient Information</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Name",         value: report.patientName },
                { label: "Patient ID",   value: report.patientId },
                { label: "Age / Gender", value: `${report.age} yrs / ${report.gender === "M" ? "Male" : "Female"}` },
                { label: "Sample ID",    value: report.sampleId },
                { label: "Technician",   value: report.technician },
                { label: "File",         value: report.filename },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-xs text-[#0F172A]/50 dark:text-white/50">{f.label}</p>
                  <p className="text-sm font-medium text-[#0F172A] dark:text-white mt-0.5 truncate">{f.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Results */}
          <section>
            <h4 className="text-xs font-semibold text-[#0F172A]/50 dark:text-white/50 uppercase tracking-wider mb-3">Detection Results</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Parasitaemia",  value: `${report.parasitaemia.toFixed(1)}%`, accent: report.parasitaemia > 0 },
                { label: "Infected RBCs", value: report.infectedCells },
                { label: "Total RBCs",    value: report.totalCells },
                { label: "Detections",    value: report.detections.length },
              ].map((m) => (
                <div key={m.label} className="rounded-xl bg-[#10B981]/5 dark:bg-white/5 border border-[#10B981]/20 p-3">
                  <p className="text-xs text-[#0F172A]/50 dark:text-white/50">{m.label}</p>
                  <p className={`text-xl font-bold mt-0.5 ${m.accent ? "text-red-500" : "text-[#0F172A] dark:text-white"}`}>{m.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Species & stages */}
          {(report.species.length > 0 || report.stages.length > 0) && (
            <section>
              <h4 className="text-xs font-semibold text-[#0F172A]/50 dark:text-white/50 uppercase tracking-wider mb-3">Classification</h4>
              <div className="flex flex-wrap gap-2">
                {report.species.map((s) => (
                  <span key={s} className="rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-xs font-medium px-3 py-1">{s}</span>
                ))}
                {report.stages.map((s) => (
                  <span key={s} className="rounded-full bg-[#0F172A]/5 dark:bg-white/5 border border-[#10B981]/20 text-[#0F172A] dark:text-white text-xs font-medium px-3 py-1">{s}</span>
                ))}
              </div>
            </section>
          )}

          {/* Severity & recommendation */}
          <section>
            <h4 className="text-xs font-semibold text-[#0F172A]/50 dark:text-white/50 uppercase tracking-wider mb-3">Assessment</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#0F172A]/50 dark:text-white/50">Severity:</span>
                <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${severityStyle(report.severity)}`}>
                  {report.severity}
                </span>
              </div>
              <div className="rounded-xl bg-[#10B981]/5 border border-[#10B981]/20 p-4">
                <p className="text-xs font-semibold text-[#10B981] mb-1">Clinical Recommendation</p>
                <p className="text-sm text-[#0F172A] dark:text-white/80">{report.recommendation}</p>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <p className="text-xs text-[#0F172A]/40 dark:text-white/40 leading-relaxed flex items-start gap-1.5">
            <Info size={13} className="shrink-0 mt-0.5" strokeWidth={2} />
            This report is AI-generated and must be reviewed and validated by a qualified clinical microscopist before clinical decision-making.
          </p>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 px-6 py-4 border-t border-[#10B981]/20 bg-white dark:bg-[#0F172A] rounded-b-2xl">
          <p className="text-xs text-[#0F172A]/40 dark:text-white/40 flex items-center gap-1.5">
            <Info size={13} className="shrink-0" strokeWidth={2} />
            Export available to administrators
          </p>
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

export default function ReportsPage() {
  const [reports, setReports]   = useState<Report[]>([]);
  const [selected, setSelected] = useState<Report | null>(null);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    const t = setTimeout(() => setReports(MOCK_REPORTS), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = reports.filter(
    (r) =>
      r.patientName.toLowerCase().includes(search.toLowerCase()) ||
      r.patientId.toLowerCase().includes(search.toLowerCase()) ||
      r.sampleId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-3"
      >
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">Reports</h2>
          <p className="mt-0.5 text-sm text-[#0F172A]/50 dark:text-white/50">{reports.length} diagnostic reports · view only</p>
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
          placeholder="Search by patient name, ID, or sample…"
          className="w-full rounded-xl border border-[#10B981]/20 bg-white dark:bg-[#0F172A] pl-10 pr-4 py-2.5 text-sm text-[#0F172A] dark:text-white placeholder-[#0F172A]/30 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#10B981] shadow-sm transition-shadow"
        />
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 shadow-sm overflow-hidden"
      >
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-[#0F172A]/40 dark:text-white/40">
            <Loader2 className="w-5 h-5 animate-spin text-[#10B981]" />
            <span className="text-sm">Loading reports…</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-[#0F172A]/50 dark:text-white/50 uppercase tracking-wider bg-[#10B981]/5 dark:bg-white/5">
                  {["Patient", "ID", "Sample", "Date", "Parasitaemia", "Severity", "Technician", ""].map((h) => (
                    <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#10B981]/10">
                {filtered.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-[#10B981]/5 dark:hover:bg-white/3 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-medium text-[#0F172A] dark:text-white whitespace-nowrap">{r.patientName}</td>
                    <td className="px-4 py-3.5 text-[#0F172A]/50 dark:text-white/50 text-xs">{r.patientId}</td>
                    <td className="px-4 py-3.5 text-[#0F172A]/50 dark:text-white/50 text-xs font-mono">{r.sampleId}</td>
                    <td className="px-4 py-3.5 text-[#0F172A]/50 dark:text-white/50 text-xs whitespace-nowrap">{formatDate(r.timestamp)}</td>
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
                    <td className="px-4 py-3.5 text-[#0F172A]/70 dark:text-white/70 text-xs whitespace-nowrap">{r.technician}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setSelected(r)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap"
                      >
                        View <ArrowRight size={12} strokeWidth={2.5} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selected && <ReportModal report={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
