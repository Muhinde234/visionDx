"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  /** Kept for API compatibility — ignored in strict palette mode */
  color?: string;
  delay?: number;
  /** Delta value, e.g. +12 or -5 */
  trend?: number;
  /** Unit appended after trend number, defaults to "%" */
  trendUnit?: string;
}

export default function StatCard({
  title, value, subtitle, icon, delay = 0, trend, trendUnit = "%",
}: StatCardProps) {
  const isPositive = trend != null && trend > 0;
  const isNeutral  = trend === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 p-5 shadow-sm hover:shadow-md hover:shadow-[#10B981]/10 dark:hover:shadow-[#10B981]/5 transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1 pr-3">
          <p className="text-sm font-medium text-[#0F172A]/60 dark:text-white/60 truncate">{title}</p>
          <p className="mt-1 text-3xl font-bold text-[#0F172A] dark:text-white tabular-nums">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-[#0F172A]/40 dark:text-white/40 truncate">{subtitle}</p>
          )}

          {/* Trend badge */}
          {trend != null && (
            <div className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              isNeutral
                ? "bg-[#0F172A]/5 dark:bg-white/5 text-[#0F172A]/50 dark:text-white/50"
                : isPositive
                ? "bg-[#10B981]/10 text-[#10B981]"
                : "bg-[#0F172A]/10 dark:bg-white/10 text-[#0F172A] dark:text-white"
            }`}>
              {isNeutral
                ? <Minus size={11} strokeWidth={2.5} />
                : isPositive
                ? <TrendingUp   size={11} strokeWidth={2.5} />
                : <TrendingDown size={11} strokeWidth={2.5} />
              }
              {isPositive && "+"}{trend}{trendUnit} vs last week
            </div>
          )}
        </div>

        {/* Icon well — always green tint */}
        <div className="rounded-xl p-3 shrink-0 bg-[#10B981]/10">
          <span className="text-[#10B981]">{icon}</span>
        </div>
      </div>
    </motion.div>
  );
}
