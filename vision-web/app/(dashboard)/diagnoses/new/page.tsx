"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Loader2, Search, User, Upload,
  Camera, Zap, CheckCircle2, AlertTriangle, Clock,
} from "lucide-react";
import {
  apiGetPatients, apiCreateDiagnosis, apiPredict,
} from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import type { Patient, Diagnosis, Prediction, SeverityLevel } from "@/lib/types";

const SEVERITY_CONFIG: Record<SeverityLevel, { label: string; color: string; bg: string; border: string }> = {
  negative: { label: "Negative", color: "text-green-700 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-900/20",  border: "border-green-200 dark:border-green-800" },
  mild:     { label: "Mild",     color: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-800" },
  moderate: { label: "Moderate", color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800" },
  severe:   { label: "Severe",   color: "text-red-700 dark:text-red-400",       bg: "bg-red-50 dark:bg-red-900/20",       border: "border-red-200 dark:border-red-800" },
};

type Step = "patient" | "notes" | "upload" | "result";

export default function NewDiagnosisPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const initPatientId = searchParams.get("patient_id") ?? "";

  const [step, setStep]               = useState<Step>(initPatientId ? "notes" : "patient");
  const [patientSearch, setPatientSearch] = useState("");
  const [patients, setPatients]       = useState<Patient[]>([]);
  const [pLoading, setPLoading]       = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [clinicalNotes, setClinicalNotes]  = useState("");
  const [diagnosis, setDiagnosis]     = useState<Diagnosis | null>(null);
  const [file, setFile]               = useState<File | null>(null);
  const [preview, setPreview]         = useState<string | null>(null);
  const [uploading, setUploading]     = useState(false);
  const [result, setResult]           = useState<Prediction | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { success: toastSuccess, error: toastError } = useToast();

  // Load pre-selected patient
  useEffect(() => {
    if (!initPatientId) return;
    import("@/lib/api").then(({ apiGetPatient }) =>
      apiGetPatient(initPatientId)
        .then(setSelectedPatient)
        .catch(() => {})
    );
  }, [initPatientId]);

  // Patient search
  useEffect(() => {
    if (!patientSearch.trim()) { setPatients([]); return; }
    const t = setTimeout(async () => {
      setPLoading(true);
      try {
        const data = await apiGetPatients({ search: patientSearch, page_size: 6 });
        setPatients(data.items);
      } catch {
        setPatients([]);
      } finally {
        setPLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [patientSearch]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  }

  async function handleCreateDiagnosis() {
    if (!selectedPatient) return;
    setError(null);
    try {
      const d = await apiCreateDiagnosis({
        patient_id:     selectedPatient.id,
        clinical_notes: clinicalNotes || undefined,
      });
      setDiagnosis(d);
      setStep("upload");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to create diagnosis.";
      setError(msg);
      toastError(msg);
    }
  }

  async function handleRunAI() {
    if (!file || !diagnosis) return;
    setUploading(true);
    setError(null);
    try {
      const pred = await apiPredict(file, diagnosis.id);
      setResult(pred);
      setStep("result");
      toastSuccess("AI diagnosis complete.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Prediction failed.";
      setError(msg);
      toastError(msg);
    } finally {
      setUploading(false);
    }
  }

  const inputCls = "w-full bg-[#0F172A]/5 dark:bg-white/5 border border-[#10B981]/20 rounded-xl px-4 py-2.5 text-sm text-[#0F172A] dark:text-white focus:outline-none focus:border-[#10B981] transition-all";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/diagnoses" className="inline-flex items-center gap-2 text-sm text-[#0F172A]/50 dark:text-white/50 hover:text-[#10B981] transition-colors">
          <ArrowLeft size={14} /> Back to Diagnoses
        </Link>
        <h2 className="mt-3 text-2xl font-bold text-[#0F172A] dark:text-white">New Diagnosis</h2>
        <p className="mt-0.5 text-sm text-[#0F172A]/50 dark:text-white/50">
          Select a patient, add clinical notes, upload a blood smear and get an instant AI result.
        </p>
      </motion.div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {(["patient", "notes", "upload", "result"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              step === s ? "bg-[#10B981] text-white" :
              (["patient","notes","upload","result"].indexOf(step) > i) ? "bg-[#10B981]/20 text-[#10B981]" :
              "bg-[#0F172A]/5 dark:bg-white/5 text-[#0F172A]/40 dark:text-white/40"
            }`}>
              {i + 1}
            </div>
            {i < 3 && <div className="h-px w-8 bg-[#10B981]/20" />}
          </div>
        ))}
        <span className="ml-2 text-xs text-[#0F172A]/50 dark:text-white/50 capitalize">{step}</span>
      </div>

      {/* ── Step 1: Patient selection ── */}
      {step === "patient" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Select Patient</h3>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#10B981]/60 pointer-events-none" />
            <input type="text" value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Search patient by name…"
              className={`${inputCls} pl-10`} />
            {pLoading && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#10B981]" />}
          </div>

          <AnimatePresence>
            {patients.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-1.5 max-h-64 overflow-y-auto">
                {patients.map((p) => (
                  <button key={p.id} onClick={() => { setSelectedPatient(p); setStep("notes"); }}
                    className="w-full flex items-center gap-3 rounded-xl border border-[#10B981]/10 px-4 py-3 hover:border-[#10B981]/40 hover:bg-[#10B981]/5 transition-colors text-left">
                    <div className="h-8 w-8 rounded-full bg-[#10B981]/10 flex items-center justify-center shrink-0">
                      <User size={14} className="text-[#10B981]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0F172A] dark:text-white">{p.full_name}</p>
                      <p className="text-xs text-[#0F172A]/50 dark:text-white/50">{p.sex} · {p.facility_name ?? "No facility"}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-2 border-t border-[#10B981]/10">
            <p className="text-xs text-[#0F172A]/40 dark:text-white/40">
              Patient not found?{" "}
              <Link href="/patients" className="text-[#10B981] hover:underline">Create one first</Link>
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Step 2: Notes ── */}
      {step === "notes" && selectedPatient && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#10B981]/5 border border-[#10B981]/10">
            <div className="h-8 w-8 rounded-full bg-[#10B981]/10 flex items-center justify-center shrink-0">
              <User size={14} className="text-[#10B981]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F172A] dark:text-white">{selectedPatient.full_name}</p>
              <p className="text-xs text-[#0F172A]/50 dark:text-white/50">{selectedPatient.sex} · {selectedPatient.facility_name ?? "—"}</p>
            </div>
            <button onClick={() => { setSelectedPatient(null); setStep("patient"); }}
              className="ml-auto text-xs text-[#0F172A]/40 dark:text-white/40 hover:text-red-500 transition-colors">
              Change
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">Clinical Notes (optional)</label>
            <textarea value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)}
              rows={4} placeholder="Symptoms, history, observations…"
              className={`${inputCls} resize-none`} />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
              <AlertTriangle size={14} className="shrink-0" /> {error}
            </div>
          )}

          <button onClick={handleCreateDiagnosis}
            className="w-full py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-sm transition-colors">
            Continue to Upload →
          </button>
        </motion.div>
      )}

      {/* ── Step 3: Upload ── */}
      {step === "upload" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Upload Blood Smear</h3>

          {/* Drop zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className="relative cursor-pointer rounded-2xl border-2 border-dashed border-[#10B981]/30 hover:border-[#10B981]/60 bg-[#10B981]/5 p-8 text-center transition-colors"
          >
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/tiff"
              capture="environment" className="hidden" onChange={handleFileChange} />

            {preview ? (
              <img src={preview} alt="Preview" className="mx-auto max-h-48 rounded-xl object-contain" />
            ) : (
              <>
                <Upload size={32} className="mx-auto mb-3 text-[#10B981]/50" strokeWidth={1.5} />
                <p className="text-sm font-medium text-[#0F172A] dark:text-white">Drop image here or click to browse</p>
                <p className="text-xs text-[#0F172A]/40 dark:text-white/40 mt-1">JPEG / PNG / TIFF · max 10 MB</p>
              </>
            )}
          </div>

          {/* Mobile camera shortcut */}
          <button onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#10B981]/20 py-2.5 text-sm text-[#0F172A] dark:text-white hover:bg-[#10B981]/5 transition-colors">
            <Camera size={15} className="text-[#10B981]" />
            Take Photo (mobile)
          </button>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
              <AlertTriangle size={14} className="shrink-0" /> {error}
            </div>
          )}

          <button onClick={handleRunAI} disabled={!file || uploading}
            className="w-full py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
            {uploading
              ? <><Loader2 size={16} className="animate-spin" />Analysing…</>
              : <><Zap size={16} />Run AI Diagnosis</>
            }
          </button>
        </motion.div>
      )}

      {/* ── Step 4: Result ── */}
      {step === "result" && result && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-6 shadow-sm space-y-5">
          {(() => {
            const sev = SEVERITY_CONFIG[result.severity_level] ?? SEVERITY_CONFIG.negative;
            const pct = Math.round(result.confidence_score * 100);
            return (
              <>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={22} className="text-[#10B981] shrink-0" />
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">AI Diagnosis Complete</h3>
                </div>

                {/* Result summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-[#10B981]/20 p-4">
                    <p className="text-xs text-[#0F172A]/50 dark:text-white/50">Predicted Class</p>
                    <p className="mt-1 text-base font-bold text-[#0F172A] dark:text-white leading-tight">{result.predicted_class}</p>
                  </div>
                  <div className="rounded-xl border border-[#10B981]/20 p-4">
                    <p className="text-xs text-[#0F172A]/50 dark:text-white/50">Confidence</p>
                    <p className="mt-1 text-base font-bold text-[#10B981]">{pct}%</p>
                  </div>
                  <div className={`rounded-xl border p-4 ${sev.bg} ${sev.border}`}>
                    <p className={`text-xs opacity-70 ${sev.color}`}>Severity</p>
                    <p className={`mt-1 text-base font-bold ${sev.color}`}>{sev.label}</p>
                  </div>
                </div>

                {/* Confidence bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-[#0F172A] dark:text-white">{result.predicted_class}</span>
                    <span className="text-[#10B981] font-bold">{pct}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[#10B981]/10">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-2.5 rounded-full bg-[#10B981]" />
                  </div>
                </div>

                {/* Recommendation */}
                <div className={`flex items-start gap-3 rounded-xl border p-4 ${sev.bg} ${sev.border}`}>
                  {result.severity_level === "negative"
                    ? <CheckCircle2 size={18} className={`shrink-0 mt-0.5 ${sev.color}`} />
                    : <AlertTriangle size={18} className={`shrink-0 mt-0.5 ${sev.color}`} />
                  }
                  <p className={`text-sm leading-relaxed ${sev.color}`}>{result.recommendation}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#0F172A]/40 dark:text-white/40">
                  <Clock size={12} />
                  Inference: {result.inference_time_ms} ms
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => router.push("/diagnoses")}
                    className="flex-1 py-2.5 rounded-xl border border-[#10B981]/20 text-sm font-medium text-[#0F172A] dark:text-white hover:bg-[#10B981]/5 transition-colors">
                    Back to Diagnoses
                  </button>
                  <Link href={`/predictions/${result.id}`}
                    className="flex-1 text-center py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-sm font-semibold transition-colors">
                    Full Detail
                  </Link>
                </div>
              </>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}
