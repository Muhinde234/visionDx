"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight, Zap, Fingerprint, Activity } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useLang } from "@/context/LangContext";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const { login } = useAuth();
  const { success, error } = useToast();
  const { t } = useLang();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);
    if (!email || !password) {
      setFieldError("CREDENTIAL_LOG: FIELDS_EMPTY");
      return;
    }
    setIsLoading(true);
    try {
      const me = await login(email.trim(), password);
      success("AUTHENTICATED: SESSION_START");
      router.push(me.role === "admin" ? "/admin" : "/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ACCESS_DENIED";
      setFieldError(msg);
      error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-dark relative overflow-hidden p-6 transition-colors duration-500">
      
     
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.1] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#10B981 0.5px, transparent 0.5px)`, backgroundSize: '30px 30px' }} />
      
    
      <motion.div 
        animate={{ x: ['-100%', '100%'] }} 
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 bottom-0 w-[1px] bg-primary/20 pointer-events-none" 
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[480px] relative z-10"
      >
        {/* ── Branding Section: Circular Logo Interface ── */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative h-32 w-32 flex items-center justify-center">
            {/* Outer Rotating Dash Ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full"
            />
            {/* Middle Glow Ring */}
            <div className="absolute inset-2 border border-primary/10 rounded-full bg-primary/5 backdrop-blur-sm shadow-[0_0_20px_rgba(16,185,129,0.05)]" />
            
            {/* Inner Circle & Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative z-10 p-4"
            >
              <Logo width={100} height={30} />
            </motion.div>
          </div>

          <div className="flex items-center gap-2 mt-6 opacity-60">
            <Activity size={12} className="text-primary animate-pulse" />
            <span className="text-[10px] font-black text-dark dark:text-primary tracking-[0.5em] uppercase">Security Interface</span>
          </div>
        </div>

        {/* ── The Terminal Interface ── */}
        <div className="relative">
          {/* Corner Precision Markers */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-primary/40" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-primary/40" />

          <div className="relative bg-white dark:bg-white/[0.03] backdrop-blur-3xl border border-dark/5 dark:border-primary/20 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden transition-all">
            
            <div className="mb-10 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-dark dark:text-white tracking-tighter uppercase leading-none">
                  User<br/><span className="text-primary">Portal</span>
                </h2>
                <p className="text-[10px] font-mono text-dark/30 dark:text-primary/40 mt-3 flex items-center gap-2 uppercase tracking-[0.2em]">
                  <span className="w-1 h-1 bg-primary rounded-full" /> node: 0xff429
                </p>
              </div>
              <div className="h-14 w-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
                <Fingerprint size={28} strokeWidth={1.5} />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {fieldError && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 bg-red-500/5 border-l-2 border-red-500 py-3 px-4 rounded-r-lg"
                  >
                    <AlertCircle size={14} className="text-red-500" />
                    <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{fieldError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Identification Input */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-primary uppercase tracking-[0.3em] ml-1">Identification String</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="USER@VISIONDX.AI"
                  className="w-full bg-dark/[0.02] dark:bg-white/[0.03] border border-dark/10 dark:border-primary/20 rounded-2xl px-5 py-4 text-dark dark:text-white text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-dark/20 dark:placeholder:text-white/10 font-mono"
                />
              </div>

              {/* Security Key Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Security Key</label>
                  <Link href="/forgot-password" className="text-[9px] font-black text-dark/30 dark:text-white/30 hover:text-primary transition-colors uppercase">Forgot?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-dark/[0.02] dark:bg-white/[0.03] border border-dark/10 dark:border-primary/20 rounded-2xl px-5 py-4 text-dark dark:text-white text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-dark/20 dark:placeholder:text-white/10 tracking-[0.4em]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-dark/20 dark:text-primary/40 hover:text-primary transition-colors"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 py-5 rounded-2xl text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 transition-all mt-4"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>Access Portal <ArrowRight size={18} /></>
                )}
              </motion.button>
            </form>

            {/* Signup Link Integration */}
            <div className="mt-10 pt-8 border-t border-dark/5 dark:border-primary/10 flex items-center justify-between">
              <span className="text-[10px] font-bold text-dark/30 dark:text-white/30 uppercase">Not Registered?</span>
              <Link href="/signup" className="text-[11px] font-black text-primary hover:text-primary-hover uppercase tracking-widest flex items-center gap-2 group transition-all">
                Create Account 
                <div className="w-5 h-[2px] bg-primary group-hover:w-8 transition-all" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Quick-Fill Module ── */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          {[
            { label: "ADMIN_ROOT", email: "admin@visiondx.ai", pass: "admin123" },
            { label: "LAB_TECH", email: "lab@visiondx.ai", pass: "lab123" },
          ].map((creds) => (
            <button
              key={creds.email}
              type="button"
              onClick={() => { setEmail(creds.email); setPassword(creds.pass); }}
              className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-dark/[0.02] dark:bg-white/[0.02] border border-dark/5 dark:border-primary/10 hover:border-primary transition-all group"
            >
              <div className="flex flex-col items-start">
                <span className="text-[9px] font-black text-primary tracking-widest uppercase opacity-70">{creds.label}</span>
                <span className="text-[8px] font-mono text-dark/40 dark:text-white/20 uppercase mt-0.5">Quick-Link</span>
              </div>
              <Zap size={12} className="text-primary/30 group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>
      </motion.div>
      
      {/* ── Fixed Console Errors (Next/Link spacing removed) ── */}
      <div className="absolute bottom-10 left-10 hidden lg:block pointer-events-none">
        <p className="text-[8px] font-mono text-primary/30 uppercase tracking-[0.5em]">SYSTEM_STATUS: SECURE_V4</p>
      </div>
    </div>
  );
}