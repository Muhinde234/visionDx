"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Loader2, AlertCircle, CheckCircle2,
  AlertTriangle, Clock, BarChart3,
} from "lucide-react";
import { apiGetPrediction } from "@/lib/api";
import type { Prediction, SeverityLevel } from "@/lib/types";

const SEVERITY_CONFIG: Record<SeverityLevel, { label: string; color: string; bg: string; border: string }> = {
  negative: { label: "Negative",  color: "text-green-700 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-900/20",  border: "border-green-200 dark:border-green-800" },
  mild:     { label: "Mild",      color: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-800" },
  moderate: { label: "Moderate",  color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800" },
  severe:   { label: "Severe",    color: "text-red-700 dark:text-red-400",       bg: "bg-red-50 dark:bg-red-900/20",       border: "border-red-200 dark:border-red-800" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export default function PredictionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);

  useEffect(() => {
    if (!id) return;
    apiGetPrediction(id)
      .then(setPrediction)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#10B981]" />
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-sm text-[#0F172A]/50 dark:text-white/50">Failed to load prediction.</p>
        <Link href="/history" className="text-sm text-[#10B981] hover:underline">Back to history</Link>
      </div>
    );
  }

  const sev     = SEVERITY_CONFIG[prediction.severity_level] ?? SEVERITY_CONFIG.negative;
  const pct     = Math.round(prediction.confidence_score * 100);
  const rawEntries = Object.entries(prediction.raw_output ?? {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back nav */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/history" className="inline-flex items-center gap-2 text-sm text-[#0F172A]/50 dark:text-white/50 hover:text-[#10B981] transition-colors">
          <ArrowLeft size={14} /> Back to History
        </Link>
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">Prediction Detail</h2>
            <p className="mt-0.5 text-xs text-[#0F172A]/40 dark:text-white/40 font-mono">{prediction.id}</p>
          </div>
          <div className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold border ${sev.bg} ${sev.border} ${sev.color}`}>
            {prediction.severity_level === "negative"
              ? <CheckCircle2 size={14} className="mr-1.5" />
              : <AlertTriangle size={14} className="mr-1.5" />
            }
            {sev.label}
          </div>
        </div>
      </motion.div>

      {/* Summary cards */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-[#10B981]/20 bg-white dark:bg-[#0F172A] p-4">
          <p className="text-xs text-[#0F172A]/50 dark:text-white/50">Predicted Class</p>
          <p className="mt-1 text-lg font-bold text-[#0F172A] dark:text-white leading-tight">{prediction.predicted_class}</p>
        </div>
        <div className="rounded-xl border border-[#10B981]/20 bg-white dark:bg-[#0F172A] p-4">
          <p className="text-xs text-[#0F172A]/50 dark:text-white/50">Confidence</p>
          <p className="mt-1 text-lg font-bold text-[#10B981]">{pct}%</p>
        </div>
        <div className="rounded-xl border border-[#10B981]/20 bg-white dark:bg-[#0F172A] p-4">
          <p className="text-xs text-[#0F172A]/50 dark:text-white/50">Disease Type</p>
          <p className="mt-1 text-lg font-bold text-[#0F172A] dark:text-white">Malaria</p>
        </div>
        <div className="rounded-xl border border-[#10B981]/20 bg-white dark:bg-[#0F172A] p-4 flex flex-col">
          <p className="text-xs text-[#0F172A]/50 dark:text-white/50 flex items-center gap-1">
            <Clock size={11} /> Inference
          </p>
          <p className="mt-1 text-lg font-bold text-[#0F172A] dark:text-white">{prediction.inference_time_ms} ms</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence breakdown */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={15} className="text-[#10B981]" />
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Class Confidence Scores</h3>
          </div>

          {/* Primary confidence */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-bold text-[#0F172A] dark:text-white">{prediction.predicted_class}</span>
              <span className="font-bold text-[#10B981]">{pct}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-[#10B981]/10">
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                className="h-3 rounded-full bg-[#10B981]" />
            </div>
          </div>

          {rawEntries.length > 0 && (
            <div className="space-y-2">
              {rawEntries.map(([cls, conf]) => {
                const p = Math.round(conf * 100);
                const isActive = cls === prediction.predicted_class;
                return (
                  <div key={cls} className={`rounded-xl border p-3 ${isActive ? "border-[#10B981]/40 bg-[#10B981]/5" : "border-[#10B981]/10"}`}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-medium text-[#0F172A] dark:text-white">{cls}</span>
                      <span className={`text-xs font-bold ${isActive ? "text-[#10B981]" : "text-[#0F172A]/50 dark:text-white/50"}`}>{p}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#10B981]/10">
                      <div className={`h-1.5 rounded-full ${isActive ? "bg-[#10B981]" : "bg-[#0F172A]/20 dark:bg-white/20"}`}
                        style={{ width: `${p}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Recommendation + metadata */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Clinical Recommendation</h3>

          <div className={`flex items-start gap-3 rounded-xl border p-4 ${sev.bg} ${sev.border}`}>
            {prediction.severity_level === "negative"
              ? <CheckCircle2 size={18} className={`shrink-0 mt-0.5 ${sev.color}`} />
              : <AlertTriangle size={18} className={`shrink-0 mt-0.5 ${sev.color}`} />
            }
            <p className={`text-sm leading-relaxed ${sev.color}`}>{prediction.recommendation}</p>
          </div>

          <div className="space-y-2.5 text-xs border-t border-[#10B981]/10 pt-4">
            {[
              ["Prediction ID",  prediction.id],
              ["Predicted Stage", prediction.predicted_class],
              ["Severity",        sev.label],
              ["Confidence",      `${pct}%`],
              ["Inference Time",  `${prediction.inference_time_ms} ms`],
              ["Date",            formatDate(prediction.created_at)],
              ...(prediction.diagnosis_id ? [["Diagnosis ID", prediction.diagnosis_id]] : []),
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between gap-3">
                <span className="text-[#0F172A]/50 dark:text-white/50">{label}</span>
                <span className="font-medium text-[#0F172A] dark:text-white text-right break-all">{val}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Link href="/history"
              className="flex-1 text-center py-2.5 rounded-xl border border-[#10B981]/20 text-sm font-medium text-[#0F172A] dark:text-white hover:bg-[#10B981]/5 transition-colors">
              All History
            </Link>
            <Link href="/diagnoses/new"
              className="flex-1 text-center py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-sm font-semibold transition-colors">
              New Diagnosis
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
