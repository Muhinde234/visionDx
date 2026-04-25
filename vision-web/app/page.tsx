"use client";

import  { useEffect, useState } from "react";
import Link from "next/link";
import { motion} from "framer-motion";
import {
  Sun, Moon, Menu, X, Microscope, FlaskConical,
  BarChart3, FileText, Smartphone, Shield,
  ArrowRight, ArrowUpRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";


const FEATURES = [
  {
    title: "YOLO Detection",
    desc: "YOLOv9 trained on 50k+ clinical images. Detects malaria parasites with clinical accuracy in <2s.",
    icon: Microscope,
  },
  {
    title: "Species Staging",
    desc: "Identifies P. falciparum, vivax, malariae, and ovale with full life-cycle classification.",
    icon: FlaskConical,
  },
  {
    title: "Quantification",
    desc: "Automatically calculates percentage of infected RBCs for precise clinical severity grading.",
    icon: BarChart3,
  },
  {
    title: "Instant Reports",
    desc: "Generate downloadable diagnostic reports with annotated images and treatment guidance.",
    icon: FileText,
  },
  {
    title: "Works Anywhere",
    desc: "Fully responsive web platform—use it from workstations, tablets, or mobile devices in the field.",
    icon: Smartphone,
  },
  {
    title: "Audit & Compliance",
    desc: "Complete audit trail of all scans and system events—ready for clinical regulatory review.",
    icon: Shield,
  },
] as const;

export default function LandingPage() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  return (
    <div className="min-h-screen w-full flex flex-col transition-colors duration-300">
      
    
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 border-b ${
        scrolled ? "bg-bg/90 dark:bg-bg-dark/90 backdrop-blur-xl border-primary/10 shadow-lg shadow-dark/5" : "bg-transparent border-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo width={110} height={32} />

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold hover:text-primary transition-colors">Features</a>
            <button onClick={toggleDark} className="p-2 rounded-xl hover:bg-primary/10 text-primary transition-colors">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/login" className="text-sm font-bold text-dark dark:text-light">Sign In</Link>
            <Link href="/login" className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20">
              Try Demo
            </Link>
          </div>

          <button className="md:hidden text-primary" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

 
      <section className="relative pt-32 pb-24 overflow-hidden">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Powered by YOLOv9 AI
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-dark dark:text-light tracking-tight leading-[1.1]">
              Malaria Detection <br />
              <span className="text-primary">Reimagined.</span>
            </h1>
            <p className="mt-8 text-dark/60 dark:text-light/60 text-lg max-w-2xl mx-auto leading-relaxed">
              Achieve clinical-grade parasite detection and quantification in seconds. 
              Designed for laboratory precision using only white-light microscopy images.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="w-full sm:w-auto px-10 py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold transition-all shadow-xl shadow-primary/25 hover:-translate-y-1">
                Start Analysis Free
              </Link>
              <Link href="/login" className="w-full sm:w-auto px-10 py-4 bg-light dark:bg-dark border border-primary/20 hover:bg-primary/5 text-dark dark:text-light rounded-2xl font-bold transition-all">
                View Documentation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

  
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-dark dark:text-light">Diagnostic Excellence</h2>
          <div className="mt-4 h-1 w-12 bg-primary mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative bg-surface dark:bg-dark/40 p-8 rounded-[2rem] border border-primary/15 hover:border-primary transition-all duration-500"
            >
       
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] rounded-[2rem] transition-colors" />
              
              <div className="relative">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <feature.icon size={28} strokeWidth={1.5} />
                </div>
                
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-dark dark:text-light mb-4">{feature.title}</h3>
                  <ArrowUpRight size={18} className="text-primary/40 group-hover:text-primary transition-colors" />
                </div>
                
                <p className="text-dark/60 dark:text-light/60 text-sm leading-relaxed mb-8">
                  {feature.desc}
                </p>

                <div className="flex items-center gap-3">
                  <div className="h-[2px] w-6 bg-primary/30 group-hover:w-12 group-hover:bg-primary transition-all duration-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-dark/40 dark:text-light/40 group-hover:text-primary">
                    Learn More
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

   
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-black dark:bg-primary/10 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
         
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to upgrade your laboratory?</h2>
          <p className="text-white/60 mb-10 text-lg max-w-xl mx-auto font-medium">
            Join medical practitioners worldwide using VisionDx for rapid, error-free diagnostics.
          </p>
          <Link href="/login" className="inline-flex items-center gap-3 px-10 py-5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95">
            Get Started Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>

     
      <footer className="py-12 border-t border-primary/90 text-center">
        <div className="flex justify-center mb-8 grayscale">
          <Logo width={100} height={32} />
        </div>
        <p className="text-dark/40 dark:text-light/40 text-xs font-bold uppercase tracking-[0.2em]">
          VisionDx Diagnostic AI © 2026
        </p>
        <div className="mt-4 flex justify-center gap-6 text-xs text-primary font-bold">
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>
      </footer>
    </div>
  );
}