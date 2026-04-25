"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Microscope, Upload, History, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { useScan } from "@/context/ScanContext";
import type { Prediction, SeverityLevel } from "@/lib/types";

const SEVERITY_CONFIG: Record<SeverityLevel, { label: string; color: string; bg: string; border: string }> = {
  negative: { label: "Negative",  color: "text-green-700 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-900/20",  border: "border-green-200 dark:border-green-800" },
  mild:     { label: "Mild",      color: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-800" },
  moderate: { label: "Moderate",  color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800" },
  severe:   { label: "Severe",    color: "text-red-700 dark:text-red-400",       bg: "bg-red-50 dark:bg-red-900/20",       border: "border-red-200 dark:border-red-800" },
};

function ConfidenceBar({ label, value, active }: { label: string; value: number; active: boolean }) {
  const pct = Math.round(value * 100);
  return (
    <div className={`rounded-xl border p-3 transition-colors ${active ? "border-[#10B981]/40 bg-[#10B981]/5" : "border-[#10B981]/10"}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-[#0F172A] dark:text-white">{label}</span>
        <span className={`text-xs font-bold ${active ? "text-[#10B981]" : "text-[#0F172A]/50 dark:text-white/50"}`}>{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#10B981]/10">
        <div
          className={`h-1.5 rounded-full transition-all ${active ? "bg-[#10B981]" : "bg-[#0F172A]/20 dark:bg-white/20"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const { latestResult } = useScan();
  const [result, setResult] = useState<Prediction | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (latestResult) setResult(latestResult);
  }, [latestResult]);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-8 text-center shadow-sm">
          <Microscope size={40} className="mx-auto mb-3 text-[#10B981]/40" strokeWidth={1.5} />
          <h3 className="text-base font-semibold text-[#0F172A] dark:text-white">No results yet</h3>
          <p className="mt-1 text-sm text-[#0F172A]/50 dark:text-white/50">
            Upload a blood smear image to see AI results here.
          </p>
          <Link
            href="/upload"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            <Upload size={14} strokeWidth={2.5} />
            Upload Now
          </Link>
        </div>
      </div>
    );
  }

  const sev     = SEVERITY_CONFIG[result.severity_level] ?? SEVERITY_CONFIG.negative;
  const pct     = Math.round(result.confidence_score * 100);
  const rawEntries = Object.entries(result.raw_output ?? {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">AI Diagnosis Result</h2>
          <p className="mt-0.5 text-xs text-[#0F172A]/50 dark:text-white/50">
            Prediction ID: {result.id}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-xl border border-[#10B981]/30 bg-white dark:bg-[#0F172A] px-4 py-2 text-sm font-medium text-[#0F172A] dark:text-white hover:bg-[#10B981]/5 transition-colors"
          >
            <Upload size={14} strokeWidth={2} />
            New Scan
          </Link>
          <Link
            href="/history"
            className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 text-sm font-semibold transition-colors"
          >
            <History size={14} strokeWidth={2} />
            History
          </Link>
        </div>
      </motion.div>

      {/* Summary row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {/* Predicted class */}
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-[#10B981]/20 bg-white dark:bg-[#0F172A] p-4">
          <p className="text-xs font-medium text-[#0F172A]/50 dark:text-white/50">Predicted Class</p>
          <p className="mt-1 text-lg font-bold text-[#0F172A] dark:text-white leading-tight">{result.predicted_class}</p>
        </div>

        {/* Confidence */}
        <div className="rounded-xl border border-[#10B981]/20 bg-white dark:bg-[#0F172A] p-4">
          <p className="text-xs font-medium text-[#0F172A]/50 dark:text-white/50">Confidence</p>
          <p className="mt-1 text-lg font-bold text-[#10B981]">{pct}%</p>
        </div>

        {/* Inference time */}
        <div className="rounded-xl border border-[#10B981]/20 bg-white dark:bg-[#0F172A] p-4">
          <p className="text-xs font-medium text-[#0F172A]/50 dark:text-white/50">Inference Time</p>
          <div className="mt-1 flex items-center gap-1.5">
            <Clock size={14} className="text-[#10B981]" />
            <p className="text-lg font-bold text-[#0F172A] dark:text-white">{result.inference_time_ms} ms</p>
          </div>
        </div>

        {/* Severity */}
        <div className={`rounded-xl border p-4 ${sev.bg} ${sev.border}`}>
          <p className={`text-xs font-medium opacity-70 ${sev.color}`}>Severity</p>
          <p className={`mt-1 text-lg font-bold ${sev.color}`}>{sev.label}</p>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Confidence breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white mb-4">
            Class Confidence Scores
          </h3>

          {/* Top confidence bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-bold text-[#0F172A] dark:text-white">{result.predicted_class}</span>
              <span className="text-sm font-bold text-[#10B981]">{pct}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-[#10B981]/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                className="h-3 rounded-full bg-[#10B981]"
              />
            </div>
          </div>

          {rawEntries.length > 0 && (
            <div className="space-y-2">
              {rawEntries.map(([cls, conf]) => (
                <ConfidenceBar
                  key={cls}
                  label={cls}
                  value={conf}
                  active={cls === result.predicted_class}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm flex flex-col gap-4"
        >
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Clinical Recommendation</h3>

          {/* Severity badge */}
          <div className={`flex items-start gap-3 rounded-xl border p-4 ${sev.bg} ${sev.border}`}>
            {result.severity_level === "negative"
              ? <CheckCircle2 size={20} className={`shrink-0 mt-0.5 ${sev.color}`} />
              : <AlertTriangle size={20} className={`shrink-0 mt-0.5 ${sev.color}`} />
            }
            <p className={`text-sm leading-relaxed ${sev.color}`}>
              {result.recommendation}
            </p>
          </div>

          {/* Metadata */}
          <div className="space-y-2 text-xs text-[#0F172A]/50 dark:text-white/50 border-t border-[#10B981]/10 pt-4">
            <div className="flex justify-between">
              <span>Disease Type</span>
              <span className="font-medium text-[#0F172A] dark:text-white capitalize">Malaria</span>
            </div>
            <div className="flex justify-between">
              <span>Predicted Stage</span>
              <span className="font-medium text-[#0F172A] dark:text-white">{result.predicted_class}</span>
            </div>
            <div className="flex justify-between">
              <span>Result Date</span>
              <span className="font-medium text-[#0F172A] dark:text-white">
                {new Date(result.created_at).toLocaleString("en-GB", {
                  day: "2-digit", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Link
              href="/diagnoses/new"
              className="flex-1 text-center rounded-xl bg-[#10B981] hover:bg-[#059669] text-white py-2.5 text-sm font-semibold transition-colors"
            >
              New Diagnosis
            </Link>
            <Link
              href={`/predictions/${result.id}`}
              className="flex-1 text-center rounded-xl border border-[#10B981]/30 hover:bg-[#10B981]/5 text-[#0F172A] dark:text-white py-2.5 text-sm font-medium transition-colors"
            >
              Full Detail
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
