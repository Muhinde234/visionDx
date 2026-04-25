"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Loader2, AlertCircle, Stethoscope,
  ArrowRight, User, Phone, MapPin, Building2, FileText,
} from "lucide-react";
import { apiGetPatient, apiGetDiagnoses } from "@/lib/api";
import type { Patient, Diagnosis } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_CONFIG: Record<Diagnosis["status"], { label: string; cls: string }> = {
  pending:  { label: "Pending",  cls: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800" },
  complete: { label: "Complete", cls: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" },
  reviewed: { label: "Reviewed", cls: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" },
};

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient]     = useState<Patient | null>(null);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiGetPatient(id),
      apiGetDiagnoses({ patient_id: id }),
    ])
      .then(([p, d]) => {
        setPatient(p);
        setDiagnoses(d.items);
      })
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

  if (error || !patient) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-sm text-[#0F172A]/50 dark:text-white/50">Failed to load patient.</p>
        <Link href="/patients" className="text-sm text-[#10B981] hover:underline">Back to patients</Link>
      </div>
    );
  }

  const age = Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back nav */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/patients" className="inline-flex items-center gap-2 text-sm text-[#0F172A]/50 dark:text-white/50 hover:text-[#10B981] transition-colors">
          <ArrowLeft size={14} /> Back to Patients
        </Link>
      </motion.div>

      {/* Patient card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="h-16 w-16 rounded-2xl bg-[#10B981]/10 flex items-center justify-center shrink-0">
            <User size={28} className="text-[#10B981]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">{patient.full_name}</h2>
            <p className="text-sm text-[#0F172A]/50 dark:text-white/50 mt-0.5">
              {patient.sex} · {age} years old · Born {formatDate(patient.date_of_birth)}
            </p>
          </div>
          <Link href={`/diagnoses/new?patient_id=${patient.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap">
            <Stethoscope size={14} strokeWidth={2} /> New Diagnosis
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Phone,     label: "Phone",    value: patient.phone ?? "—" },
            { icon: MapPin,    label: "Address",  value: patient.address ?? "—" },
            { icon: Building2, label: "Facility", value: patient.facility_name ?? "—" },
            { icon: FileText,  label: "Notes",    value: patient.notes ?? "—" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border border-[#10B981]/10 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={12} className="text-[#10B981]" />
                <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">{label}</span>
              </div>
              <p className="text-xs text-[#0F172A] dark:text-white truncate">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Diagnoses history */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#10B981]/10">
          <div className="flex items-center gap-2">
            <Stethoscope size={15} className="text-[#10B981]" strokeWidth={1.8} />
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Diagnosis History</h3>
            <span className="text-xs text-[#0F172A]/40 dark:text-white/40">({diagnoses.length})</span>
          </div>
        </div>

        {diagnoses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-[#0F172A]/40 dark:text-white/40">
            <p className="text-sm">No diagnoses yet.</p>
            <Link href={`/diagnoses/new?patient_id=${patient.id}`} className="text-sm text-[#10B981] hover:underline">
              Create first diagnosis
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-[#0F172A]/50 dark:text-white/50 uppercase tracking-wider bg-[#10B981]/5 dark:bg-white/5">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Notes</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#10B981]/10">
                {diagnoses.map((d, idx) => {
                  const sc = STATUS_CONFIG[d.status] ?? STATUS_CONFIG.pending;
                  return (
                    <tr key={d.id}
                      className="hover:bg-[#10B981]/5 dark:hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3.5 text-xs text-[#0F172A]/70 dark:text-white/70 whitespace-nowrap">
                        {formatDate(d.created_at)}
                      </td>
                      <td className="px-5 py-3.5 text-[#0F172A]/70 dark:text-white/70 max-w-xs truncate">
                        {d.clinical_notes ?? "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/diagnoses/${d.id}`}
                          className="inline-flex items-center gap-1 text-xs text-[#10B981] hover:text-[#059669] hover:underline font-medium">
                          View <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
