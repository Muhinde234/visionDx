"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { LOCALE_LABELS, type Locale } from "@/lib/i18n/translations";

interface LangDropdownProps {
  /** "dark" — for dark-background navbars (landing page)
   *  "light" — for light/adaptive navbars (dashboard)  */
  variant?: "dark" | "light";
}

export default function LangDropdown({ variant = "light" }: LangDropdownProps) {
  const { locale, setLocale, t } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouse(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const triggerCls =
    variant === "dark"
      ? "text-slate-400 hover:text-white hover:bg-white/8"
      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t.navbar.language}
        aria-expanded={open}
        className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 transition-colors ${triggerCls}`}
      >
        <Globe size={16} strokeWidth={1.8} />
        <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wide">
          {locale}
        </span>
        <ChevronDown
          size={12}
          strokeWidth={2}
          className={`hidden sm:block transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl shadow-black/10 py-1 z-50 overflow-hidden">
          <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {t.navbar.language}
          </p>
          {(Object.keys(LOCALE_LABELS) as Locale[]).map((l) => {
            const { label, flag } = LOCALE_LABELS[l];
            const active = l === locale;
            return (
              <button
                key={l}
                onClick={() => { setLocale(l); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <span className="text-base leading-none">{flag}</span>
                <span className="flex-1 text-left font-medium">{label}</span>
                {active && <Check size={14} strokeWidth={2.5} className="text-cyan-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
