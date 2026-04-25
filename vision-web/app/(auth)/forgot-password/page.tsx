"use client";

import { useState } from "react";
import Link from "next/link";
import { motion} from "framer-motion";
import { Loader2, Mail, ArrowLeft, Activity, Fingerprint, Zap } from "lucide-react";
import Logo from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    setSent(true);
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
            <span className="text-[9px] font-black text-dark dark:text-primary tracking-[0.5em] uppercase">Access Recovery</span>
          </div>
        </div>

        {/* ── Terminal Card ── */}
        <div className="relative">
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-primary/40" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-primary/40" />

          <div className="relative bg-white dark:bg-white/[0.03] backdrop-blur-3xl border border-dark/5 dark:border-primary/20 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="flex justify-center mb-8">
                  <div className="h-20 w-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Mail size={40} strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-dark dark:text-white uppercase tracking-tighter mb-4">Transmission Sent</h3>
                <p className="text-sm text-dark/50 dark:text-white/40 mb-2 font-medium">
                  Recovery instructions dispatched to:
                </p>
                <p className="text-primary font-mono text-xs font-bold mb-10 tracking-widest">{email}</p>
                
                <Link
                  href="/login"
                  className="inline-flex items-center gap-3 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20"
                >
                  <ArrowLeft size={16} /> Back to Node
                </Link>
              </motion.div>
            ) : (
              <>
                <div className="mb-10 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-dark dark:text-white tracking-tighter uppercase leading-none">
                      Reset<br/><span className="text-primary">Protocol</span>
                    </h2>
                    <p className="text-[10px] font-mono text-dark/30 dark:text-primary/40 mt-3 flex items-center gap-2 uppercase tracking-widest">
                      <span className="w-1 h-1 bg-primary rounded-full animate-pulse" /> Status: Awaiting_Email
                    </p>
                  </div>
                  <div className="h-14 w-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
                    <Fingerprint size={28} strokeWidth={1.5} />
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-primary uppercase tracking-[0.3em] ml-1">Identity Mail Node</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="YOU@HOSPITAL.ORG"
                      className="w-full bg-dark/5 dark:bg-white/5 border border-dark/10 dark:border-primary/20 rounded-2xl px-5 py-4 text-dark dark:text-white text-sm focus:outline-none focus:border-primary transition-all font-mono"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 py-5 rounded-2xl text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 transition-all"
                  >
                    {isLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>Initialize Reset <Zap size={18} /></>
                    )}
                  </motion.button>
                </form>

                <div className="mt-12 pt-8 border-t border-dark/5 dark:border-primary/10 text-center">
                   <Link href="/login" className="text-[11px] font-black text-primary hover:text-primary-hover uppercase tracking-widest flex items-center justify-center gap-2 group transition-all">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Secure Portal
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Technical Footer ── */}
        <div className="mt-10 flex justify-center opacity-30">
          <p className="text-[8px] font-mono text-primary uppercase tracking-[0.5em]">VisionDx Access Recovery Module // V4.0</p>
        </div>
      </motion.div>
    </div>
  );
}