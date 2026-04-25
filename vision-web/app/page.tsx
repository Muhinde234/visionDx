"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Sun,
  Moon,
  Menu,
  X,
  Microscope,
  FlaskConical,
  BarChart3,
  FileText,
  Smartphone,
  Shield,
  ArrowRight,
  ArrowUpRight,
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


const FloatingShapes = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
 
    <motion.div
      animate={{ rotateX: 360, rotateY: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute top-[10%] left-[15%] w-32 h-32 rounded-full border border-primary/20"
      style={{ transformStyle: "preserve-3d", perspective: 800 }}
    />
   
    <motion.div
      animate={{
        y: [0, -20, 0],
        rotateX: [0, 180, 360],
        rotateY: [0, 180, 360],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-[20%] right-[10%] w-24 h-24"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="w-full h-full border-2 border-primary/10 bg-primary/5 backdrop-blur-sm rounded-2xl" />
      <div className="absolute inset-2 border border-primary/20 rounded-xl" />
    </motion.div>

    <motion.div
      animate={{ scale: [1, 1.2, 1], rotate: 360 }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[40%] right-[30%] w-40 h-40 rounded-full bg-primary/5 blur-3xl"
    />
    <motion.div
      animate={{ y: [0, -30, 0], opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[30%] right-[25%] w-20 h-20 rounded-full bg-primary/10 blur-xl"
    />
  </div>
);

export default function LandingPage() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  return (
    <div className="min-h-screen w-full flex flex-col transition-colors duration-300">
      
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 border-b ${
          scrolled
            ? "bg-bg/90 dark:bg-bg-dark/90 backdrop-blur-xl border-primary/10 shadow-lg shadow-dark/5"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo width={110} height={32} />

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold hover:text-primary transition-colors">
              Features
            </a>
            <button
              onClick={toggleDark}
              className="p-2 rounded-xl hover:bg-primary/10 text-primary transition-colors"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/login" className="text-sm font-bold text-dark dark:text-light">
              Sign In
            </Link>
            <Link
              href="/login"
              className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-primary/20"
            >
              Try Demo
            </Link>
          </div>

          <button className="md:hidden text-primary" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>

 
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden bg-bg dark:bg-bg-dark border-t border-primary/10 px-6 py-4 flex flex-col gap-4"
          >
            <a href="#features" className="text-sm font-semibold hover:text-primary" onClick={() => setMobileOpen(false)}>
              Features
            </a>
            <button
              onClick={() => {
                toggleDark();
                setMobileOpen(false);
              }}
              className="flex items-center gap-2 text-sm font-semibold text-primary"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
              Toggle theme
            </button>
            <Link href="/login" className="text-sm font-bold text-dark dark:text-light" onClick={() => setMobileOpen(false)}>
              Sign In
            </Link>
            <Link
              href="/login"
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-sm font-bold text-center"
              onClick={() => setMobileOpen(false)}
            >
              Try Demo
            </Link>
          </motion.div>
        )}
      </nav>

     
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      
        <FloatingShapes />

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative w-full max-w-7xl mx-auto px-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-8">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-primary"
              />
              Powered by YOLOv9 AI
            </span>

            <h1 className="text-5xl md:text-7xl font-extrabold text-dark dark:text-light tracking-tight leading-[1.1]">
              Malaria Detection <br />
              <motion.span
                className="text-primary inline-block"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Reimagined.
              </motion.span>
            </h1>

            <p className="mt-8 text-dark/60 dark:text-light/60 text-lg max-w-2xl mx-auto leading-relaxed">
              Achieve clinical-grade parasite detection and quantification in seconds. Designed for laboratory
              precision using only white-light microscopy images.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/login"
                  className="block w-full sm:w-auto px-10 py-4 bg-primary hover:bg-primary-hover text-white rounded-full font-bold transition-all shadow-xl shadow-primary/25"
                >
                  Start Analysis Free
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/login"
                  className="block w-full sm:w-auto px-10 py-4 bg-light dark:bg-dark border border-primary/20 hover:bg-primary/5 text-dark dark:text-light rounded-full font-bold transition-all"
                >
                  View Documentation
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ---------- Features with 3D tilt cards ---------- */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-dark dark:text-light">
            Diagnostic Excellence
          </h2>
          <motion.div
            className="mt-4 h-1 w-12 bg-primary mx-auto rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: 48 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              // 3D tilt on hover
              whileHover={{
                rotateY: 5,
                rotateX: -5,
                scale: 1.03,
              }}
              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
              className="group relative bg-surface dark:bg-dark/40 p-8 rounded-[2rem] border border-primary/15 hover:border-primary transition-all duration-500"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] rounded-[2rem] transition-colors" />

              <div className="relative" style={{ transformStyle: "preserve-3d" }}>
                <motion.div
                  className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8"
                  whileHover={{
                    rotateY: 180,
                    backgroundColor: "rgba(var(--primary), 1)",
                    color: "#fff",
                    scale: 1.1,
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <feature.icon size={28} strokeWidth={1.5} />
                </motion.div>

                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-dark dark:text-light mb-4">{feature.title}</h3>
                  <motion.span
                    whileHover={{ rotate: 45 }}
                    className="text-primary/40 group-hover:text-primary transition-colors"
                  >
                    <ArrowUpRight size={18} />
                  </motion.span>
                </div>

                <p className="text-dark/60 dark:text-light/60 text-sm leading-relaxed mb-8">{feature.desc}</p>

                <div className="flex items-center gap-3">
                  <motion.div
                    className="h-[2px] w-6 bg-primary/30 group-hover:w-12 group-hover:bg-primary transition-all duration-500"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-dark/40 dark:text-light/40 group-hover:text-primary">
                    Learn More
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- CTA with 3D card ---------- */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto bg-black dark:bg-primary/10 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden"
        >
          {/* Animated glow behind */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
          <motion.div
            className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to upgrade your laboratory?
          </h2>
          <p className="text-white/60 mb-10 text-lg max-w-xl mx-auto font-medium">
            Join medical practitioners worldwide using VisionDx for rapid, error-free diagnostics.
          </p>

          <motion.div
            whileHover={{ scale: 1.05, rotateX: 5, rotateY: -5 }}
            whileTap={{ scale: 0.95 }}
            style={{ transformStyle: "preserve-3d" }}
            className="inline-block"
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-3 px-10 py-5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold transition-all shadow-2xl shadow-primary/30"
            >
              Get Started Now
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight size={20} />
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ---------- Footer (Modernized) ---------- */}
      <footer className="relative py-12 text-center overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-primary/5 blur-3xl rounded-full" />
        </div>

        {/* Animated top separator line */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* 3D logo hover */}
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 5 }}
            style={{ transformStyle: "preserve-3d" }}
            className="inline-block grayscale mb-8"
          >
            <Logo width={100} height={32} />
          </motion.div>

          {/* Copyright */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-dark/40 dark:text-light/40 text-xs font-bold uppercase tracking-[0.2em]"
          >
            VisionDx Diagnostic AI © 2026
          </motion.p>

    
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-4 flex justify-center gap-6 text-xs text-primary font-bold"
          >
            {["Privacy", "Terms", "Contact"].map((item) => (
              <motion.a
                key={item}
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative hover:underline decoration-primary/50 underline-offset-4 transition-all"
              >
                {item}
                {/* Expanding underline on hover */}
                <motion.span
                  className="absolute -bottom-1 left-0 h-[1px] bg-primary"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.2 }}
                />
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </footer>
    </div>
  );
}