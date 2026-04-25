"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Zap, Microscope, FlaskConical, BarChart3 } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { useScan } from "@/context/ScanContext";
import { apiPredict } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

type Stage = "idle" | "ready" | "loading" | "error";

const INFO_CARDS = [
  { icon: Microscope,  title: "YOLO Detection",       desc: "State-of-the-art object detection trained on malaria blood smear datasets" },
  { icon: FlaskConical, title: "Multi-Stage",          desc: "Detects Ring Stage, Trophozoite, Schizont, and Gametocyte parasites" },
  { icon: BarChart3,   title: "Confidence Scoring",   desc: "Returns per-class confidence scores and severity classification" },
];

export default function UploadPage() {
  const [stage, setStage]       = useState<Stage>("idle");
  const [file, setFile]         = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const { setLatestResult }     = useScan();
  const { error: toastError }   = useToast();
  const router = useRouter();

  function onFileSelect(f: File) {
    setFile(f);
    setStage("ready");
    setErrorMsg("");
  }

  async function handleSubmit() {
    if (!file) return;
    setStage("loading");
    setErrorMsg("");

    try {
      const result = await apiPredict(file);
      setLatestResult(result);
      router.push("/results");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Prediction failed.";
      setErrorMsg(msg);
      toastError(msg);
      setStage("error");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Upload Blood Smear</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Upload a Giemsa-stained blood smear image (JPEG/PNG/TIFF, max 10 MB) for AI malaria detection.
        </p>
      </motion.div>

      {/* Upload card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-6 shadow-sm"
      >
        <FileUpload onFileSelect={onFileSelect} isLoading={stage === "loading"} />

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-400">Supported: PNG, JPG, TIFF · Max 10 MB</p>
          <button
            onClick={handleSubmit}
            disabled={stage !== "ready"}
            className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
              stage === "ready"
                ? "bg-[#10B981] hover:bg-[#059669] text-white shadow-sm hover:shadow-[#10B981]/30"
                : "bg-slate-100 dark:bg-[#0F172A]/60 text-slate-400 cursor-not-allowed"
            }`}
          >
            {stage === "loading" ? (
              <><Loader2 size={16} className="animate-spin" />Analysing…</>
            ) : (
              <><Zap size={16} strokeWidth={2.5} />Run AI Diagnosis</>
            )}
          </button>
        </div>
      </motion.div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {INFO_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-4 shadow-sm"
            >
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl mb-3 bg-[#10B981]/10">
                <Icon size={18} className="text-[#10B981]" strokeWidth={1.8} />
              </div>
              <h4 className="text-sm font-semibold text-[#0F172A] dark:text-white">{card.title}</h4>
              <p className="mt-1 text-xs text-[#0F172A]/50 dark:text-white/50">{card.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
