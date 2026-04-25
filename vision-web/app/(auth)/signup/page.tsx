"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, CheckCircle2, Activity,
  Fingerprint, ArrowRight, UserPlus, AlertCircle,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import Logo from "@/components/Logo";
import { apiRegister } from "@/lib/api";

const ROLES = [
  { value: "doctor",          label: "Doctor" },
  { value: "lab_technician",  label: "Lab Technician" },
  { value: "technician",      label: "Technician" },
  { value: "admin",           label: "Admin" },
];

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "", email: "", role: "lab_technician",
    facility: "", password: "", confirm: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone]           = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const { success, error } = useToast();
  const router = useRouter();

  function validate() {
    if (!form.name.trim())              return "Full name is required.";
    if (!form.email.includes("@"))      return "Enter a valid email.";
    if (form.password.length < 6)       return "Password must be at least 6 characters.";
    if (form.password !== form.confirm) return "Passwords do not match.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setFieldError(err); return; }
    setFieldError(null);
    setIsLoading(true);

    try {
      await apiRegister({
        email:         form.email.trim(),
        full_name:     form.name.trim(),
        password:      form.password,
        role:          form.role,
        facility_name: form.facility.trim() || undefined,
      });
      success("Account created — please sign in.");
      setDone(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      setFieldError(msg);
      error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  const field = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: e.target.value });

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-dark relative overflow-hidden p-6 transition-colors duration-500">
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.1] pointer-events-none"
           style={{ backgroundImage: `radial-gradient(#10B981 0.5px, transparent 0.5px)`, backgroundSize: "30px 30px" }} />

      <motion.div
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 bottom-0 w-px bg-primary/20 pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[500px] relative z-10"
      >
        {/* Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative h-32 w-32 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full"
            />
            <div className="absolute inset-2 border border-primary/10 rounded-full bg-primary/5 backdrop-blur-sm" />
            <motion.div whileHover={{ scale: 1.05 }} className="relative z-10 p-4">
              <Logo width={100} height={30} />
            </motion.div>
          </div>
          <div className="flex items-center gap-2 mt-6 opacity-60">
            <Activity size={12} className="text-primary animate-pulse" />
            <span className="text-[9px] font-black text-dark dark:text-primary tracking-[0.5em] uppercase">
              Registration Interface
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="relative">
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-primary/40" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-primary/40" />

          <div className="relative bg-white dark:bg-white/3 backdrop-blur-3xl border border-dark/5 dark:border-primary/20 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden">
            {done ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                <div className="flex justify-center mb-6 text-primary">
                  <CheckCircle2 size={48} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-black text-dark dark:text-white uppercase mb-4 tracking-tighter">
                  Account Created
                </h3>
                <p className="text-sm text-dark/50 dark:text-white/40 mb-10 leading-relaxed">
                  You can now sign in with your credentials.
                </p>
                <button
                  onClick={() => router.push("/login")}
                  className="inline-flex items-center gap-3 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Go to Login <ArrowRight size={16} />
                </button>
              </motion.div>
            ) : (
              <>
                <div className="mb-10 flex justify-between items-center">
                  <h2 className="text-2xl font-black text-dark dark:text-white tracking-tighter uppercase leading-none">
                    Join<br /><span className="text-primary">VisionDx</span>
                  </h2>
                  <div className="h-14 w-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
                    <Fingerprint size={28} />
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <AnimatePresence mode="wait">
                    {fieldError && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 bg-red-500/5 border-l-2 border-red-500 py-3 px-4 rounded-r-lg"
                      >
                        <AlertCircle size={14} className="text-red-500 shrink-0" />
                        <span className="text-red-500 text-xs">{fieldError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-primary uppercase tracking-widest ml-1">Full Name</label>
                      <input type="text" value={form.name} onChange={field("name")} placeholder="Dr. Full Name"
                        className="w-full bg-dark/5 dark:bg-white/5 border border-dark/10 dark:border-primary/20 rounded-2xl px-5 py-4 text-dark dark:text-white text-sm focus:outline-none focus:border-primary transition-all font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-primary uppercase tracking-widest ml-1">Email</label>
                      <input type="email" value={form.email} onChange={field("email")} placeholder="name@hospital.org"
                        className="w-full bg-dark/5 dark:bg-white/5 border border-dark/10 dark:border-primary/20 rounded-2xl px-5 py-4 text-dark dark:text-white text-sm focus:outline-none focus:border-primary transition-all font-mono" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-primary uppercase tracking-widest ml-1">Role</label>
                      <select value={form.role} onChange={field("role")}
                        className="w-full bg-dark/5 dark:bg-white/5 border border-dark/10 dark:border-primary/20 rounded-2xl px-5 py-4 text-dark dark:text-white text-sm focus:outline-none focus:border-primary transition-all">
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-primary uppercase tracking-widest ml-1">Facility (optional)</label>
                      <input type="text" value={form.facility} onChange={field("facility")} placeholder="Hospital name"
                        className="w-full bg-dark/5 dark:bg-white/5 border border-dark/10 dark:border-primary/20 rounded-2xl px-5 py-4 text-dark dark:text-white text-sm focus:outline-none focus:border-primary transition-all font-mono" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-primary uppercase tracking-widest ml-1">Password</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input type="password" value={form.password} onChange={field("password")} placeholder="Min 6 chars"
                        className="w-full bg-dark/5 dark:bg-white/5 border border-dark/10 dark:border-primary/20 rounded-2xl px-5 py-4 text-dark dark:text-white text-sm focus:outline-none focus:border-primary transition-all tracking-widest" />
                      <input type="password" value={form.confirm} onChange={field("confirm")} placeholder="Confirm"
                        className="w-full bg-dark/5 dark:bg-white/5 border border-dark/10 dark:border-primary/20 rounded-2xl px-5 py-4 text-dark dark:text-white text-sm focus:outline-none focus:border-primary transition-all tracking-widest" />
                    </div>
                  </div>

                  <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.98 }}
                    className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 py-5 rounded-2xl text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 mt-4 transition-all"
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Create Account <UserPlus size={18} /></>}
                  </motion.button>
                </form>

                <div className="mt-10 pt-8 border-t border-dark/5 dark:border-primary/10 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-dark/30 dark:text-white/30 uppercase">Existing User?</span>
                  <Link href="/login" className="text-[11px] font-black text-primary hover:text-primary-hover uppercase tracking-widest flex items-center gap-2 group transition-all">
                    Sign In <div className="w-5 h-0.5 bg-primary group-hover:w-8 transition-all" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
