"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const THEME_KEY = "visiondx_theme";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#0F172A] dark:text-white">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] ${checked ? "bg-[#10B981]" : "bg-[#0F172A]/15 dark:bg-white/15"}`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-[#10B981]/20 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-[#10B981]/10">
        <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">{title}</h3>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { success } = useToast();

  const [isDark, setIsDark] = useState(false);
  const [notifs, setNotifs] = useState({ scanComplete: true, weeklyReport: false, systemAlerts: true });
  const [profile, setProfile] = useState({ name: user?.name ?? "", email: user?.email ?? "", department: user?.facility_name ?? "" });

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    setIsDark(stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches));
  }, []);

  function applyTheme(dark: boolean) {
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }

  function saveProfile() {
    success("Profile updated successfully.");
  }

  function changePassword() {
    success("Password change link sent to your email. (Demo mode)");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">Settings</h2>
        <p className="mt-0.5 text-sm text-[#0F172A]/50 dark:text-white/50">Manage your account and preferences.</p>
      </motion.div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Section title="Profile">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-[#10B981] flex items-center justify-center text-2xl font-bold text-white uppercase">
              {user?.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F172A] dark:text-white">{user?.name}</p>
              <p className="text-xs text-[#0F172A]/50 dark:text-white/50 capitalize mt-0.5">{user?.role === "admin" ? "Administrator" : "Lab Technician"}</p>
              <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${user?.status === "active" ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${user?.status === "active" ? "bg-green-500" : "bg-red-500"}`} />
                {user?.status}
              </span>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {[
              { key: "name", label: "Full name", type: "text" },
              { key: "email", label: "Email address", type: "email" },
              { key: "department", label: "Department", type: "text" },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-[#0F172A]/50 dark:text-white/50 mb-1.5">{label}</label>
                <input
                  type={type}
                  value={profile[key as keyof typeof profile]}
                  onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full rounded-xl border border-[#10B981]/20 bg-[#10B981]/5 dark:bg-white/5 px-4 py-2.5 text-sm text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-shadow"
                />
              </div>
            ))}
          </div>

          <button onClick={saveProfile} className="w-full rounded-xl bg-[#10B981] hover:bg-[#059669] py-2.5 text-sm font-semibold text-white transition-colors">
            Save changes
          </button>
        </Section>
      </motion.div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Section title="Appearance">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#0F172A] dark:text-white">Dark mode</p>
              <p className="text-xs text-[#0F172A]/50 dark:text-white/50 mt-0.5">Persisted across sessions via localStorage.</p>
            </div>
            <button
              onClick={() => applyTheme(!isDark)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] ${isDark ? "bg-[#10B981]" : "bg-[#0F172A]/15 dark:bg-white/15"}`}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${isDark ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          <div>
            <p className="text-xs font-medium text-[#0F172A]/50 dark:text-white/50 uppercase tracking-wider mb-3">Theme preview</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => applyTheme(false)}
                className={`rounded-xl border-2 p-4 text-left transition-colors ${!isDark ? "border-[#10B981]" : "border-[#10B981]/20 hover:border-[#10B981]/40"}`}
              >
                <div className="w-full h-10 rounded-lg bg-slate-100 border border-slate-200 mb-2 flex items-center gap-2 px-2">
                  <div className="h-2 w-2 rounded-full bg-[#10B981]" />
                  <div className="h-1.5 w-12 rounded-full bg-slate-300" />
                </div>
                <p className="text-xs font-medium text-[#0F172A] dark:text-white">Light</p>
              </button>
              <button
                onClick={() => applyTheme(true)}
                className={`rounded-xl border-2 p-4 text-left transition-colors ${isDark ? "border-[#10B981]" : "border-[#10B981]/20 hover:border-[#10B981]/40"}`}
              >
                <div className="w-full h-10 rounded-lg bg-[#0F172A] border border-white/10 mb-2 flex items-center gap-2 px-2">
                  <div className="h-2 w-2 rounded-full bg-[#10B981]" />
                  <div className="h-1.5 w-12 rounded-full bg-white/20" />
                </div>
                <p className="text-xs font-medium text-[#0F172A] dark:text-white">Dark</p>
              </button>
            </div>
          </div>
        </Section>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Section title="Notifications">
          <Toggle
            label="Scan analysis complete"
            checked={notifs.scanComplete}
            onChange={(v) => setNotifs((n) => ({ ...n, scanComplete: v }))}
          />
          <Toggle
            label="Weekly summary report"
            checked={notifs.weeklyReport}
            onChange={(v) => setNotifs((n) => ({ ...n, weeklyReport: v }))}
          />
          <Toggle
            label="System alerts"
            checked={notifs.systemAlerts}
            onChange={(v) => setNotifs((n) => ({ ...n, systemAlerts: v }))}
          />
        </Section>
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Section title="Security">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#0F172A] dark:text-white">Password</p>
              <p className="text-xs text-[#0F172A]/50 dark:text-white/50 mt-0.5">Last changed: Never (demo account)</p>
            </div>
            <button onClick={changePassword} className="rounded-xl border border-[#10B981]/30 px-4 py-2 text-xs font-semibold text-[#0F172A] dark:text-white hover:bg-[#10B981]/5 transition-colors">
              Change
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#0F172A] dark:text-white">Two-factor authentication</p>
              <p className="text-xs text-[#0F172A]/50 dark:text-white/50 mt-0.5">Adds an extra layer of security.</p>
            </div>
            <span className="rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-medium px-3 py-1">
              Coming soon
            </span>
          </div>
        </Section>
      </motion.div>
    </div>
  );
}
