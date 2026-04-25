"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Trash2, X, Loader2 } from "lucide-react";
import { MOCK_USERS } from "@/lib/mock-data";
import type { User } from "@/lib/types";
import { useToast } from "@/context/ToastContext";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const ROLE_STYLE: Record<string, string> = {
  admin: "bg-[#10B981]/20 text-[#059669] dark:text-[#10B981]",
  lab:   "bg-[#10B981]/10 text-[#10B981]",
};

function AddUserModal({ onClose, onAdd }: { onClose: () => void; onAdd: (u: User) => void }) {
  const [form, setForm]           = useState({ name: "", email: "", role: "lab", department: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { success }               = useToast();

  async function handleAdd() {
    if (!form.name || !form.email) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const newUser: User = {
      id: `u${Date.now()}`,
      name: form.name,
      email: form.email,
      role: form.role as User["role"],
      department: form.department,
      createdAt: new Date().toISOString(),
      status: "active",
    };
    onAdd(newUser);
    success(`User "${form.name}" added successfully.`);
    onClose();
  }

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
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#0F172A]/40 dark:text-white/40 hover:bg-[#10B981]/5 transition-colors"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="space-y-4">
          {[
            { key: "name",       label: "Full name",   type: "text",  placeholder: "Dr. Jane Doe" },
            { key: "email",      label: "Email",        type: "email", placeholder: "jane@visiondx.ai" },
            { key: "department", label: "Department",   type: "text",  placeholder: "Microbiology" },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-[#0F172A]/50 dark:text-white/50 mb-1.5">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full rounded-xl border border-[#10B981]/20 bg-[#10B981]/5 dark:bg-white/5 px-4 py-2.5 text-sm text-[#0F172A] dark:text-white placeholder-[#0F172A]/30 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-shadow"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-[#0F172A]/50 dark:text-white/50 mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="w-full rounded-xl border border-[#10B981]/20 bg-[#10B981]/5 dark:bg-white/5 px-4 py-2.5 text-sm text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            >
              <option value="lab">Lab Technician</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-[#10B981]/30 px-4 py-2 text-sm font-medium text-[#0F172A] dark:text-white hover:bg-[#10B981]/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={isLoading || !form.name || !form.email}
            className="flex items-center gap-2 rounded-xl bg-[#10B981] hover:bg-[#059669] disabled:opacity-60 px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            Add user
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function UsersPage() {
  const [users, setUsers]     = useState<User[]>(MOCK_USERS);
  const [search, setSearch]   = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const { success }           = useToast();

  function toggleStatus(id: string) {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u));
    success("User status updated.");
  }

  function removeUser(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    success("User removed.");
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">User Management</h2>
          <p className="mt-0.5 text-sm text-[#0F172A]/50 dark:text-white/50">{users.length} registered users</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] hover:bg-[#059669] px-4 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add user
        </button>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#10B981]/60" strokeWidth={2} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full rounded-xl border border-[#10B981]/20 bg-white dark:bg-[#0F172A] pl-10 pr-4 py-2.5 text-sm text-[#0F172A] dark:text-white placeholder-[#0F172A]/30 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#10B981] shadow-sm"
        />
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-[#0F172A]/50 dark:text-white/50 uppercase tracking-wider bg-[#10B981]/5 dark:bg-white/5">
                {["User", "Email", "Role", "Department", "Joined", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#10B981]/10">
              {filtered.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-[#10B981]/5 dark:hover:bg-white/3 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-[#10B981] flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-medium text-[#0F172A] dark:text-white whitespace-nowrap">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[#0F172A]/50 dark:text-white/50 text-xs">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${ROLE_STYLE[u.role]}`}>
                      {u.role === "lab" ? "Lab Tech" : "Admin"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[#0F172A]/70 dark:text-white/70 text-xs whitespace-nowrap">{u.department ?? "—"}</td>
                  <td className="px-5 py-3.5 text-[#0F172A]/50 dark:text-white/50 text-xs whitespace-nowrap">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleStatus(u.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                        u.status === "active"
                          ? "bg-[#10B981]/10 text-[#10B981]"
                          : "bg-[#0F172A]/5 dark:bg-white/5 text-[#0F172A]/50 dark:text-white/50"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${u.status === "active" ? "bg-[#10B981]" : "bg-[#0F172A]/30 dark:bg-white/30"}`} />
                      {u.status}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => removeUser(u.id)}
                      className="rounded-lg p-1.5 text-[#0F172A]/30 dark:text-white/30 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      aria-label="Remove user"
                    >
                      <Trash2 size={15} strokeWidth={2} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {showAdd && (
          <AddUserModal
            onClose={() => setShowAdd(false)}
            onAdd={(u) => setUsers((prev) => [u, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
