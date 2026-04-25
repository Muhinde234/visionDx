"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, X, Loader2, AlertCircle,
  ShieldCheck, ShieldOff, ChevronLeft, ChevronRight,
  RefreshCw, BadgeCheck,
} from "lucide-react";
import { apiGetUsers, apiUpdateUser, apiRegister } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import type { User, ApiRole } from "@/lib/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES: { value: ApiRole; label: string }[] = [
  { value: "admin",          label: "Administrator" },
  { value: "doctor",         label: "Doctor" },
  { value: "lab_technician", label: "Lab Technician" },
  { value: "technician",     label: "Technician" },
];

const ROLE_STYLE: Record<string, string> = {
  admin:          "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  doctor:         "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  lab_technician: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  technician:     "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
};

const ROLE_LABEL: Record<string, string> = {
  admin:          "Admin",
  doctor:         "Doctor",
  lab_technician: "Lab Tech",
  technician:     "Technician",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── Add-User modal ───────────────────────────────────────────────────────────

const EMPTY = { full_name: "", email: "", role: "lab_technician", facility: "", password: "", confirm: "" };

function AddUserModal({ onClose, onAdded }: { onClose: () => void; onAdded: (u: User) => void }) {
  const [form, setForm]         = useState(EMPTY);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr]           = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const field = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate() {
    if (!form.full_name.trim())      return "Full name is required.";
    if (!form.email.includes("@"))   return "Enter a valid email.";
    if (form.password.length < 8)    return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(form.password)) return "Password must contain at least one uppercase letter.";
    if (!/\d/.test(form.password))   return "Password must contain at least one digit.";
    if (form.password !== form.confirm) return "Passwords do not match.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErr = validate();
    if (validationErr) { setErr(validationErr); return; }
    setErr(null);
    setIsLoading(true);

    try {
      await apiRegister({
        email:         form.email.trim(),
        full_name:     form.full_name.trim(),
        password:      form.password,
        role:          form.role,
        facility_name: form.facility.trim() || undefined,
      });
      success(`User "${form.full_name}" created successfully.`);
      // Fetch the newly created user to get their ID — refresh the list instead
      onAdded({
        id:          `temp-${Date.now()}`,
        name:        form.full_name.trim(),
        full_name:   form.full_name.trim(),
        email:       form.email.trim(),
        role:        form.role as ApiRole,
        facility_name: form.facility.trim() || undefined,
        is_active:   true,
        is_verified: false,
        created_at:  new Date().toISOString(),
        createdAt:   new Date().toISOString(),
        status:      "active",
      });
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to create user.";
      setErr(msg);
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  const inputCls = "w-full rounded-xl border border-[#10B981]/20 bg-[#10B981]/5 dark:bg-white/5 px-4 py-2.5 text-sm text-[#0F172A] dark:text-white placeholder-[#0F172A]/30 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-shadow";

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
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-[#0F172A] dark:text-white">Add New User</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#0F172A]/40 dark:text-white/40 hover:bg-[#10B981]/5 transition-colors">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {err && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={14} className="shrink-0 mt-0.5" /> {err}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-[#10B981] uppercase tracking-widest mb-1.5">Full Name *</label>
            <input type="text" value={form.full_name} onChange={field("full_name")} placeholder="Dr. Full Name" className={inputCls} required />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#10B981] uppercase tracking-widest mb-1.5">Email *</label>
            <input type="email" value={form.email} onChange={field("email")} placeholder="user@hospital.org" className={inputCls} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[#10B981] uppercase tracking-widest mb-1.5">Role *</label>
              <select value={form.role} onChange={field("role")} className={inputCls}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#10B981] uppercase tracking-widest mb-1.5">Facility</label>
              <input type="text" value={form.facility} onChange={field("facility")} placeholder="Hospital name" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#10B981] uppercase tracking-widest mb-1.5">Password *</label>
            <input type="password" value={form.password} onChange={field("password")} placeholder="Min 8 chars, 1 uppercase, 1 digit" className={inputCls} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#10B981] uppercase tracking-widest mb-1.5">Confirm Password *</label>
            <input type="password" value={form.confirm} onChange={field("confirm")} placeholder="Repeat password" className={inputCls} />
          </div>

          {/* Password hints */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
            {[
              { ok: form.password.length >= 8,       label: "8+ chars" },
              { ok: /[A-Z]/.test(form.password),     label: "Uppercase" },
              { ok: /\d/.test(form.password),         label: "Digit" },
              { ok: form.password === form.confirm && form.confirm.length > 0, label: "Match" },
            ].map(({ ok, label }) => (
              <span key={label} className={`text-[10px] font-semibold ${ok ? "text-[#10B981]" : "text-[#0F172A]/30 dark:text-white/30"}`}>
                {ok ? "✓" : "○"} {label}
              </span>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-[#10B981]/30 px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-white hover:bg-[#10B981]/5 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#10B981] hover:bg-[#059669] disabled:opacity-60 px-4 py-2.5 text-sm font-semibold text-white transition-colors">
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : "Create User"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers]           = useState<User[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [showAdd, setShowAdd]       = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { success, error: toastError } = useToast();
  const PAGE_SIZE = 20;

  const load = useCallback(async (p: number, role: string) => {
    setLoading(true);
    setFetchError(false);
    try {
      const data = await apiGetUsers({
        page: p,
        page_size: PAGE_SIZE,
        role: role || undefined,
      });
      setUsers(data.items);
      setTotal(data.total);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page, roleFilter); }, [page, roleFilter, load]);

  async function toggleActive(u: User) {
    setTogglingId(u.id);
    try {
      const updated = await apiUpdateUser(u.id, { is_active: !u.is_active });
      setUsers((prev) => prev.map((x) => x.id === u.id ? updated : x));
      success(`${updated.full_name} ${updated.is_active ? "activated" : "deactivated"}.`);
    } catch (e: unknown) {
      toastError(e instanceof Error ? e.message : "Failed to update user.");
    } finally {
      setTogglingId(null);
    }
  }

  function handleRoleFilter(r: string) { setRoleFilter(r); setPage(1); }

  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <AnimatePresence>
        {showAdd && (
          <AddUserModal
            onClose={() => setShowAdd(false)}
            onAdded={(u) => {
              setUsers((prev) => [u, ...prev]);
              setTotal((t) => t + 1);
              // Refresh to get real ID from backend
              setTimeout(() => load(1, roleFilter), 1500);
            }}
          />
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">User Management</h2>
            <p className="mt-0.5 text-sm text-[#0F172A]/50 dark:text-white/50">{total} registered users</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => load(page, roleFilter)}
              className="p-2.5 rounded-xl border border-[#10B981]/20 text-[#0F172A]/50 dark:text-white/50 hover:bg-[#10B981]/5 transition-colors"
              title="Refresh">
              <RefreshCw size={16} />
            </button>
            <button onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] hover:bg-[#059669] px-4 py-2.5 text-sm font-semibold text-white transition-colors">
              <Plus size={16} strokeWidth={2.5} /> Add User
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#10B981]/60" strokeWidth={2} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full rounded-xl border border-[#10B981]/20 bg-white dark:bg-[#0F172A] pl-10 pr-4 py-2.5 text-sm text-[#0F172A] dark:text-white placeholder-[#0F172A]/30 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#10B981] shadow-sm" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[{ value: "", label: "All Roles" }, ...ROLES.map((r) => ({ value: r.value, label: r.label }))].map((r) => (
              <button key={r.value} onClick={() => handleRoleFilter(r.value)}
                className={`rounded-xl px-3 py-2 text-xs font-medium transition-colors border ${
                  roleFilter === r.value
                    ? "bg-[#10B981] text-white border-[#10B981]"
                    : "border-[#10B981]/20 text-[#0F172A] dark:text-white hover:bg-[#10B981]/5"
                }`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 shadow-sm overflow-hidden">

          {fetchError ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <AlertCircle size={28} className="text-red-400" />
              <p className="text-sm text-[#0F172A]/50 dark:text-white/50">Failed to load users.</p>
              <button onClick={() => load(page, roleFilter)}
                className="text-sm text-[#10B981] hover:underline">Retry</button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-40 gap-3 text-[#0F172A]/40 dark:text-white/40">
              <Loader2 className="w-5 h-5 animate-spin text-[#10B981]" />
              <span className="text-sm">Loading users…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-[#0F172A]/40 dark:text-white/40">
              <p className="text-sm">No users found.</p>
              <button onClick={() => setShowAdd(true)} className="text-sm text-[#10B981] hover:underline">Add the first user</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-[#0F172A]/50 dark:text-white/50 uppercase tracking-wider bg-[#10B981]/5 dark:bg-white/5">
                    {["User", "Email", "Role", "Facility", "Verified", "Joined", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#10B981]/10">
                  {filtered.map((u, i) => (
                    <motion.tr key={u.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-[#10B981]/5 dark:hover:bg-white/3 transition-colors">

                      {/* Avatar + name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-[#10B981] flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
                            {u.full_name.charAt(0)}
                          </div>
                          <span className="font-medium text-[#0F172A] dark:text-white whitespace-nowrap">{u.full_name}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-[#0F172A]/50 dark:text-white/50 text-xs">{u.email}</td>

                      {/* Role badge */}
                      <td className="px-5 py-3.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_STYLE[u.role] ?? ""}`}>
                          {ROLE_LABEL[u.role] ?? u.role}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-[#0F172A]/60 dark:text-white/60 text-xs">
                        {u.facility_name ?? "—"}
                      </td>

                      {/* Verified */}
                      <td className="px-5 py-3.5">
                        {u.is_verified
                          ? <BadgeCheck size={16} className="text-[#10B981]" />
                          : <span className="text-xs text-[#0F172A]/30 dark:text-white/30">—</span>
                        }
                      </td>

                      <td className="px-5 py-3.5 text-[#0F172A]/50 dark:text-white/50 text-xs whitespace-nowrap">
                        {formatDate(u.created_at)}
                      </td>

                      {/* Status toggle */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          u.is_active
                            ? "bg-[#10B981]/10 text-[#10B981]"
                            : "bg-[#0F172A]/5 dark:bg-white/5 text-[#0F172A]/40 dark:text-white/40"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${u.is_active ? "bg-[#10B981]" : "bg-[#0F172A]/30 dark:bg-white/30"}`} />
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => toggleActive(u)}
                          disabled={togglingId === u.id}
                          title={u.is_active ? "Deactivate user" : "Activate user"}
                          className={`rounded-lg p-1.5 transition-colors disabled:opacity-40 ${
                            u.is_active
                              ? "text-[#0F172A]/30 dark:text-white/30 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                              : "text-[#0F172A]/30 dark:text-white/30 hover:text-[#10B981] hover:bg-[#10B981]/10"
                          }`}
                        >
                          {togglingId === u.id
                            ? <Loader2 size={15} className="animate-spin" />
                            : u.is_active
                            ? <ShieldOff size={15} strokeWidth={2} />
                            : <ShieldCheck size={15} strokeWidth={2} />
                          }
                        </button>
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
              Page {page} of {totalPages} · {total} users
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
