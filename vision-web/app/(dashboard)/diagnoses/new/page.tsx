"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Loader2, Search, User, Upload,
  Camera, Zap, CheckCircle2, AlertTriangle, Clock,
  Microscope, Activity, Percent,
} from "lucide-react";
import {
  apiGetPatients, apiCreateDiagnosis, apiPredict,
} from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import DetectionCanvas from "@/components/DetectionCanvas";
import type { Patient, Diagnosis, Prediction, SeverityLevel, Detection, BoundingBox } from "@/lib/types";

const SEVERITY_CONFIG: Record<SeverityLevel, { label: string; color: string; bg: string; border: string }> = {
  negative: { label: "Negative", color: "text-green-700 dark:text-green-400",  bg: "bg-green-50 dark:bg-green-900/20",  border: "border-green-200 dark:border-green-800" },
  mild:     { label: "Mild",     color: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-800" },
  moderate: { label: "Moderate", color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800" },
  severe:   { label: "Severe",   color: "text-red-700 dark:text-red-400",       bg: "bg-red-50 dark:bg-red-900/20",       border: "border-red-200 dark:border-red-800" },
};

const STAGE_META: Record<string, { label: string; color: string; bg: string }> = {
  ring:         { label: "Ring",         color: "#3B82F6", bg: "bg-blue-50 dark:bg-blue-900/20" },
  trophozoite:  { label: "Trophozoite",  color: "#F97316", bg: "bg-orange-50 dark:bg-orange-900/20" },
  schizont:     { label: "Schizont",     color: "#EF4444", bg: "bg-red-50 dark:bg-red-900/20" },
  gametocyte:   { label: "Gametocyte",   color: "#8B5CF6", bg: "bg-purple-50 dark:bg-purple-900/20" },
};

const STAGE_ORDER = ["ring", "trophozoite", "schizont", "gametocyte"];

/** Convert Detection[] → BoundingBox[] for DetectionCanvas */
function toBBoxes(detections: Detection[]): BoundingBox[] {
  return detections.map((d) => ({
    x1: d.bbox[0],
    y1: d.bbox[1],
    x2: d.bbox[0] + d.bbox[2],
    y2: d.bbox[1] + d.bbox[3],
    label: d.stage,
    confidence: d.confidence,
    stage: d.stage,
  }));
}

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
    <div className={`mx-auto space-y-6 transition-all duration-300 ${step === "result" ? "max-w-4xl" : "max-w-2xl"}`}>
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

          <AnimatePresence>
            {uploading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="flex flex-col items-center gap-4 rounded-2xl border border-[#10B981]/20 bg-[#10B981]/5 py-8"
              >
                <div className="relative h-14 w-14">
                  <div className="absolute inset-0 rounded-full border-4 border-[#10B981]/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-[#10B981] animate-spin" />
                  <Microscope size={22} className="absolute inset-0 m-auto text-[#10B981]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-[#0F172A] dark:text-white">AI Model Running</p>
                  <p className="text-xs text-[#0F172A]/50 dark:text-white/50 mt-0.5">Detecting parasite stages…</p>
                </div>
                {[
                  { label: "Image uploaded",         done: true  },
                  { label: "Running inference",       done: false },
                  { label: "Generating annotations",  done: false },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    {done
                      ? <CheckCircle2 size={13} className="text-[#10B981] shrink-0" />
                      : <Loader2 size={13} className="text-[#10B981]/50 animate-spin shrink-0" />
                    }
                    <span className={done ? "text-[#10B981]" : "text-[#0F172A]/50 dark:text-white/50"}>{label}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {!uploading && (
            <button onClick={handleRunAI} disabled={!file}
              className="w-full py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              <Zap size={16} />Run AI Diagnosis
            </button>
          )}
        </motion.div>
      )}

      {/* ── Step 4: Result ── */}
      {step === "result" && result && (() => {
        const sev        = SEVERITY_CONFIG[result.severity_level] ?? SEVERITY_CONFIG.negative;
        const pct        = Math.round(result.confidence_score * 100);
        const detections = result.detections ?? [];
        const bboxes     = toBBoxes(detections);
        const imageSrc   = preview ?? result.image_url ?? "";

        // Stage counts + avg confidence
        const stageStats = STAGE_ORDER.map((stage) => {
          const hits = detections.filter((d) => d.stage === stage);
          return {
            stage,
            count:   hits.length,
            avgConf: hits.length > 0
              ? Math.round(hits.reduce((s, d) => s + d.confidence, 0) / hits.length * 100)
              : 0,
          };
        });

        // Fallback stage bars from raw_output when no detections
        const rawStages = detections.length === 0
          ? STAGE_ORDER
              .filter((s) => (result.raw_output?.[s] ?? 0) > 0)
              .map((stage) => ({ stage, score: Math.round((result.raw_output[stage] ?? 0) * 100) }))
              .sort((a, b) => b.score - a.score)
          : [];

        const totalCount   = result.parasite_count ?? detections.length;
        const parasitaemia = result.parasitaemia;

        return (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* ── Header ── */}
            <div className="flex items-center justify-between rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                {result.severity_level === "negative"
                  ? <CheckCircle2 size={20} className="text-[#10B981] shrink-0" />
                  : <AlertTriangle size={20} className="text-amber-500 shrink-0" />
                }
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">AI Diagnosis Complete</h3>
                  <p className="text-xs text-[#0F172A]/50 dark:text-white/50 mt-0.5">
                    {result.predicted_class} · {pct}% confidence
                    <span className="mx-1.5">·</span>
                    <Clock size={10} className="inline -mt-0.5" /> {result.inference_time_ms} ms
                  </p>
                </div>
              </div>
              <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${sev.bg} ${sev.border} ${sev.color}`}>
                {sev.label}
              </span>
            </div>

            {/* ── Main two-column grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Canvas */}
              <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-4 shadow-sm">
                <p className="text-xs font-semibold text-[#0F172A]/50 dark:text-white/50 mb-3 uppercase tracking-wide">
                  Annotated Image
                  {bboxes.length > 0 && <span className="ml-2 text-[#10B981]">· {bboxes.length} detection{bboxes.length !== 1 ? "s" : ""}</span>}
                </p>
                {imageSrc ? (
                  <DetectionCanvas imageUrl={imageSrc} detections={bboxes} />
                ) : (
                  <div className="flex items-center justify-center h-48 text-[#0F172A]/30 dark:text-white/30 text-sm rounded-xl border border-dashed border-[#10B981]/20">
                    Image not available
                  </div>
                )}
              </div>

              {/* Right column: stats + stage breakdown */}
              <div className="space-y-4">

                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-4 shadow-sm text-center">
                    <Microscope size={16} className="mx-auto text-[#10B981] mb-1.5" strokeWidth={1.8} />
                    <p className="text-xl font-bold text-[#0F172A] dark:text-white">{totalCount}</p>
                    <p className="text-[10px] text-[#0F172A]/50 dark:text-white/50 mt-0.5">Parasites</p>
                  </div>
                  <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-4 shadow-sm text-center">
                    <Percent size={16} className="mx-auto text-[#10B981] mb-1.5" strokeWidth={1.8} />
                    <p className="text-xl font-bold text-[#0F172A] dark:text-white">
                      {parasitaemia != null ? `${parasitaemia.toFixed(2)}%` : "—"}
                    </p>
                    <p className="text-[10px] text-[#0F172A]/50 dark:text-white/50 mt-0.5">Parasitaemia</p>
                  </div>
                  <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-4 shadow-sm text-center">
                    <Activity size={16} className="mx-auto text-[#10B981] mb-1.5" strokeWidth={1.8} />
                    <p className="text-xl font-bold text-[#10B981]">{pct}%</p>
                    <p className="text-[10px] text-[#0F172A]/50 dark:text-white/50 mt-0.5">Confidence</p>
                  </div>
                </div>

                {/* Stage breakdown */}
                <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-4 shadow-sm">
                  <p className="text-xs font-semibold text-[#0F172A]/50 dark:text-white/50 mb-3 uppercase tracking-wide">Stage Breakdown</p>

                  {detections.length > 0 ? (
                    <div className="space-y-3">
                      {stageStats.map(({ stage, count, avgConf }) => {
                        const m   = STAGE_META[stage];
                        const pct = totalCount > 0 ? Math.round(count / totalCount * 100) : 0;
                        return (
                          <div key={stage}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: m.color }} />
                                <span className="text-xs font-medium text-[#0F172A] dark:text-white">{m.label}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="font-bold text-[#0F172A] dark:text-white">{count}</span>
                                {avgConf > 0 && (
                                  <span className="text-[#0F172A]/40 dark:text-white/40">{avgConf}%</span>
                                )}
                              </div>
                            </div>
                            <div className="h-1.5 rounded-full bg-[#10B981]/10">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                                className="h-1.5 rounded-full"
                                style={{ background: count > 0 ? m.color : "transparent" }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : rawStages.length > 0 ? (
                    // Fallback: show raw_output probabilities
                    <div className="space-y-3">
                      {rawStages.map(({ stage, score }) => {
                        const m = STAGE_META[stage];
                        return (
                          <div key={stage}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: m.color }} />
                                <span className="text-xs font-medium text-[#0F172A] dark:text-white">{m.label}</span>
                              </div>
                              <span className="text-xs font-bold text-[#0F172A] dark:text-white">{score}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-[#10B981]/10">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                                className="h-1.5 rounded-full"
                                style={{ background: m.color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-[#0F172A]/40 dark:text-white/40 text-center py-4">
                      {result.severity_level === "negative" ? "No parasites detected." : "No stage detail available."}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Recommendation ── */}
            <div className={`flex items-start gap-3 rounded-2xl border p-4 ${sev.bg} ${sev.border}`}>
              {result.severity_level === "negative"
                ? <CheckCircle2 size={18} className={`shrink-0 mt-0.5 ${sev.color}`} />
                : <AlertTriangle size={18} className={`shrink-0 mt-0.5 ${sev.color}`} />
              }
              <p className={`text-sm leading-relaxed ${sev.color}`}>{result.recommendation}</p>
            </div>

            {/* ── Actions ── */}
            <div className="flex gap-3">
              <button onClick={() => router.push("/diagnoses")}
                className="flex-1 py-2.5 rounded-xl border border-[#10B981]/20 text-sm font-medium text-[#0F172A] dark:text-white hover:bg-[#10B981]/5 transition-colors">
                Back to Diagnoses
              </button>
              <Link href={`/predictions/${result.id}`}
                className="flex-1 text-center py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-sm font-semibold transition-colors">
                Full Detail
              </Link>
            </div>

          </motion.div>
        );
      })()}
    </div>
  );
}
