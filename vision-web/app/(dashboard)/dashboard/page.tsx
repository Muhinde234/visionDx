"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Upload, Activity, AlertCircle, CheckCircle2,
  BarChart3, ArrowUpRight, Loader2, Stethoscope,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { apiGetAnalytics } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { AnalyticsDashboard } from "@/lib/types";

const CHART_TOOLTIP = {
  contentStyle: {
    background: "#0F172A",
    border: "1px solid rgba(16,185,129,0.2)",
    borderRadius: 12,
    color: "#ffffff",
    fontSize: 12,
  },
  cursor: { fill: "rgba(16,185,129,0.04)" },
};

const SEVERITY_COLORS: Record<string, string> = {
  negative: "#10B981",
  mild:     "#FBBF24",
  moderate: "#F97316",
  severe:   "#EF4444",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [error, setError]         = useState(false);

  useEffect(() => {
    apiGetAnalytics()
      .then(setAnalytics)
      .catch(() => setError(true));
  }, []);

  if (!analytics && !error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-[#0F172A]/50 dark:text-white/50">
          <Loader2 className="w-5 h-5 animate-spin text-[#10B981]" />
          <span className="text-sm">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-[#0F172A]/50 dark:text-white/50">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-sm">Failed to load analytics. Check your connection.</p>
      </div>
    );
  }

  const severityPieData = Object.entries(analytics.severity_breakdown).map(
    ([key, val]) => ({ name: key.charAt(0).toUpperCase() + key.slice(1), value: val, color: SEVERITY_COLORS[key] ?? "#94A3B8" })
  );

  const stagePieData = Object.entries(analytics.stage_breakdown).map(([key, val]) => ({
    name: key, value: val,
  }));

  const STAGE_COLORS = ["#10B981", "#FBBF24", "#F97316", "#EF4444", "#8B5CF6"];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-[#0F172A]/200 text-white p-5 sm:p-7 border border-[#10B981]/20"
      >
        <div className="absolute top-0 right-0 h-40 w-64 rounded-full bg-[#10B981]/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-32 h-24 w-40 rounded-full bg-[#10B981]/5 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#10B981] uppercase tracking-widest mb-1">
              VisionDx Dashboard
            </p>
            <h2 className="text-lg sm:text-xl font-bold leading-snug">
              {getGreeting()}, {user?.name?.split(" ")[0] ?? "User"} 👋
            </h2>
            <p className="mt-1 text-sm text-white/60">
              AI-powered malaria diagnostic system — real-time analytics
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-xs font-medium text-[#10B981]">AI Model Online</span>
            </div>
            <Link
              href="/diagnoses/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10B981] hover:bg-[#059669] px-5 py-2.5 text-sm font-semibold text-white transition-all shadow-lg shadow-[#10B981]/25 hover:-translate-y-px whitespace-nowrap w-full sm:w-auto"
            >
              <Upload size={15} strokeWidth={2.5} />
              New Diagnosis
            </Link>
          </div>
        </div>

        {/* Quick stat pills */}
        <div className="relative mt-5 flex flex-wrap gap-2">
          {[
            { label: "Total Diagnoses", value: analytics.total_diagnoses,  icon: Activity    },
            { label: "Positive Cases",  value: analytics.positive_cases,   icon: AlertCircle },
            { label: "Negative Cases",  value: analytics.total_diagnoses - analytics.positive_cases, icon: CheckCircle2 },
            { label: "Positivity Rate", value: `${analytics.positivity_rate.toFixed(1)}%`, icon: BarChart3 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
              <Icon size={13} className="text-[#10B981] shrink-0" strokeWidth={2} />
              <span className="text-xs text-white/60">{label}:</span>
              <span className="text-xs font-bold text-white">{value}</span>
            </div>
          ))}
        </div>
      </motion.div>

     
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Diagnoses"  value={analytics.total_diagnoses}  subtitle="All time"          delay={0}    trend={12} icon={<Activity    size={18} strokeWidth={1.8} />} />
        <StatCard title="Positive Cases"   value={analytics.positive_cases}   subtitle={`${analytics.positivity_rate.toFixed(1)}% positivity`} delay={0.05} trend={-3} icon={<AlertCircle  size={18} strokeWidth={1.8} />} />
        <StatCard title="Negative Cases"   value={analytics.total_diagnoses - analytics.positive_cases} subtitle="Clear results" delay={0.1} trend={8} icon={<CheckCircle2 size={18} strokeWidth={1.8} />} />
        <StatCard title="Pending Reviews"  value={analytics.severity_breakdown?.severe ?? 0} subtitle="Severe cases" delay={0.15} trend={0} icon={<Stethoscope size={18} strokeWidth={1.8} />} />
      </div>

    
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

     
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="xl:col-span-2 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Diagnoses per Day</h3>
              <p className="text-xs text-[#0F172A]/50 dark:text-white/50">Recent trend</p>
            </div>
            <Link href="/diagnoses" className="flex items-center gap-1 text-xs text-[#10B981] hover:text-[#059669] font-medium">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.recent_trend} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.1)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP} />
              <Bar dataKey="count" name="Diagnoses" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

      
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white mb-0.5">Severity Breakdown</h3>
          <p className="text-xs text-[#0F172A]/50 dark:text-white/50 mb-4">All diagnoses</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={severityPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={false}>
                {severityPieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip {...CHART_TOOLTIP} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

     
      {Object.keys(analytics.stage_breakdown).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white mb-0.5">Parasite Stage Breakdown</h3>
          <p className="text-xs text-[#0F172A]/50 dark:text-white/50 mb-4">Detected parasite stages across all diagnoses</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stagePieData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.1)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(15,23,42,0.5)" }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP} />
              <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                {stagePieData.map((_, i) => (
                  <Cell key={i} fill={STAGE_COLORS[i % STAGE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
