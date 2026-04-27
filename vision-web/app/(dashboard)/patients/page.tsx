"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Loader2, AlertCircle, X, User,
  ArrowRight, ChevronLeft, ChevronRight,
} from "lucide-react";
import { apiGetPatients, apiCreatePatient } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import type { Patient } from "@/lib/types";

const SEX_OPTS = [
  { value: "male",   label: "Male" },
  { value: "female", label: "Female" },
  { value: "other",  label: "Other" },
];

const EMPTY_FORM = {
  full_name: "", date_of_birth: "", sex: "male",
  phone: "", address: "", facility_name: "", notes: "",
};

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (p: Patient) => void }) {
  const [form, setForm]     = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const field = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name.trim() || !form.date_of_birth || !form.sex) {
      setErr("Name, date of birth, and sex are required.");
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      const patient = await apiCreatePatient({
        full_name:     form.full_name.trim(),
        date_of_birth: form.date_of_birth,
        sex:           form.sex,
        phone:         form.phone || undefined,
        address:       form.address || undefined,
        facility_name: form.facility_name || undefined,
        notes:         form.notes || undefined,
      });
      success("Patient created successfully.");
      onCreated(patient);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to create patient.";
      setErr(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full bg-[#0F172A]/5 dark:bg-white/5 border border-[#10B981]/20 rounded-xl px-4 py-2.5 text-sm text-[#0F172A] dark:text-white focus:outline-none focus:border-[#10B981] transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-2xl border border-[#10B981]/20 shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">New Patient</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#0F172A]/5 dark:hover:bg-white/5 text-[#0F172A]/50 dark:text-white/50 transition-colors">
            <X size={18} />
          </button>
        </div>

        {err && (
          <div className="flex items-center gap-2 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={14} className="shrink-0" /> {err}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">Full Name *</label>
              <input type="text" value={form.full_name} onChange={field("full_name")} placeholder="Patient full name" className={inputCls} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">Date of Birth *</label>
              <input type="date" value={form.date_of_birth} onChange={field("date_of_birth")} className={inputCls} required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">Sex *</label>
              <select value={form.sex} onChange={field("sex")} className={inputCls}>
                {SEX_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">Phone</label>
              <input type="tel" value={form.phone} onChange={field("phone")} placeholder="+250 ..." className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">Facility</label>
              <input type="text" value={form.facility_name} onChange={field("facility_name")} placeholder="Hospital / clinic" className={inputCls} />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">Address</label>
              <input type="text" value={form.address} onChange={field("address")} placeholder="Address" className={inputCls} />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">Notes</label>
              <textarea value={form.notes} onChange={field("notes")} rows={2} placeholder="Clinical notes…" className={`${inputCls} resize-none`} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#10B981]/20 text-sm font-medium text-[#0F172A] dark:text-white hover:bg-[#10B981]/5 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2">
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Create Patient"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [query, setQuery]       = useState("");
  const [loading, setLoading]   = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const PAGE_SIZE = 20;

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true);
    setFetchError(false);
    try {
      const data = await apiGetPatients({ page: p, page_size: PAGE_SIZE, search: q || undefined });
      setPatients(data.items);
      setTotal(data.total);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page, query); }, [page, query, load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  }

  function handleCreated(p: Patient) {
    setShowModal(false);
    setPatients((prev) => [p, ...prev]);
    setTotal((t) => t + 1);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <AnimatePresence>
        {showModal && (
          <CreateModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">Patients</h2>
            <p className="mt-0.5 text-sm text-[#0F172A]/50 dark:text-white/50">{total} total patients</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2.5 text-sm font-semibold transition-colors">
            <Plus size={16} strokeWidth={2.5} /> New Patient
          </button>
        </motion.div>

        {/* Search */}
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#10B981]/60" strokeWidth={2} />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name…"
              className="w-full rounded-xl border border-[#10B981]/20 bg-white dark:bg-[#0F172A] pl-10 pr-28 py-2.5 text-sm text-[#0F172A] dark:text-white placeholder-[#0F172A]/30 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-shadow shadow-sm"
            />
            <button type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold px-3 py-1.5 transition-colors">
              Search
            </button>
          </div>
        </form>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 shadow-sm overflow-hidden">
          {fetchError ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-[#0F172A]/40 dark:text-white/40">
              <AlertCircle size={24} className="text-red-400" />
              <p className="text-sm">Failed to load patients.</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-40 gap-3 text-[#0F172A]/40 dark:text-white/40">
              <Loader2 className="w-5 h-5 animate-spin text-[#10B981]" />
              <span className="text-sm">Loading patients…</span>
            </div>
          ) : patients.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-[#0F172A]/40 dark:text-white/40">
              <User size={32} className="text-[#10B981]/30" />
              <p className="text-sm">No patients found.</p>
              <button onClick={() => setShowModal(true)} className="text-sm text-[#10B981] hover:underline">Add the first patient</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-[#0F172A]/50 dark:text-white/50 uppercase tracking-wider bg-[#10B981]/5 dark:bg-white/5">
                    <th className="px-5 py-3">#</th>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Sex</th>
                    <th className="px-5 py-3">Date of Birth</th>
                    <th className="px-5 py-3">Phone</th>
                    <th className="px-5 py-3">Facility</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#10B981]/10">
                  {patients.map((p, idx) => (
                    <motion.tr key={p.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.025 }}
                      className="hover:bg-[#10B981]/5 dark:hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3.5 text-[#0F172A]/40 dark:text-white/40 text-xs">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="px-5 py-3.5 font-medium text-[#0F172A] dark:text-white">{p.full_name}</td>
                      <td className="px-5 py-3.5 text-[#0F172A]/70 dark:text-white/70">{p.sex}</td>
                      <td className="px-5 py-3.5 text-[#0F172A]/70 dark:text-white/70 text-xs whitespace-nowrap">
                        {new Date(p.date_of_birth).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-5 py-3.5 text-[#0F172A]/50 dark:text-white/50 text-xs">{p.phone ?? "—"}</td>
                      <td className="px-5 py-3.5 text-[#0F172A]/50 dark:text-white/50 text-xs">{p.facility_name ?? "—"}</td>
                      <td className="px-5 py-3.5">
                        <Link href={`/patients/${p.id}`}
                          className="inline-flex items-center gap-1 text-xs text-[#10B981] hover:text-[#059669] hover:underline font-medium">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#0F172A]/50 dark:text-white/50">
              Page {page} of {totalPages} · {total} patients
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
    </>
  );
}
