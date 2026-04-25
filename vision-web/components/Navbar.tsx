"use client";

import { useEffect, useState, useCallback } from "react";
import { Menu, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LangContext";
import Logo from "@/components/Logo";
import LangDropdown from "@/components/LangDropdown";

const THEME_KEY = "visiondx_theme";

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
}

function isDarkNow() {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

interface NavbarProps {
  onMenuClick: () => void;
  title?: string;
}

export default function Navbar({ onMenuClick, title }: NavbarProps) {
  const { user } = useAuth();
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => { setDark(isDarkNow()); }, []);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 6); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleDark = useCallback(() => {
    const next = !isDarkNow();
    applyTheme(next);
    setDark(next);
  }, []);

  return (
    <header
      className={`
        sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3
        border-b border-[#10B981]/20 dark:border-white/10
        bg-white dark:bg-[#0F172A]
        px-4 lg:px-6
        transition-shadow duration-200
        ${scrolled ? "shadow-sm shadow-[#10B981]/10 dark:shadow-black/30" : ""}
      `}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden rounded-xl p-2 text-[#0F172A] dark:text-white hover:bg-[#10B981]/10 dark:hover:bg-white/5 transition-colors"
        aria-label="Open navigation"
      >
        <Menu size={20} strokeWidth={2} />
      </button>

      {/* Logo — mobile only (desktop shows it in sidebar) */}
      <div className="lg:hidden">
        <Logo width={100} height={32} />
      </div>

      {/* Page title — desktop */}
      {title && (
        <h1 className="hidden lg:block text-sm font-semibold text-[#0F172A] dark:text-white truncate">
          {title}
        </h1>
      )}

      {/* Right cluster */}
      <div className="ml-auto flex items-center gap-1.5">

        {/* AI status pill */}
        <div className="hidden sm:flex items-center gap-2 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-xs font-medium text-[#10B981]">
            {t.navbar.aiOnline}
          </span>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          suppressHydrationWarning
          className="rounded-xl p-2 text-[#0F172A] dark:text-white hover:bg-[#10B981]/10 dark:hover:bg-white/5 transition-colors"
          aria-label={dark ? t.navbar.lightMode : t.navbar.darkMode}
          title={dark ? t.navbar.lightMode : t.navbar.darkMode}
        >
          {dark
            ? <Sun  size={18} strokeWidth={1.8} />
            : <Moon size={18} strokeWidth={1.8} />
          }
        </button>

        {/* Language switcher */}
        <LangDropdown />

        {/* User avatar chip */}
        {user && (
          <div className="flex items-center gap-2 rounded-xl bg-[#10B981]/10 dark:bg-white/5 border border-[#10B981]/20 dark:border-white/10 pl-2 pr-3 py-1.5 ml-1">
            <div className="h-6 w-6 rounded-full bg-[#10B981] flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-[#0F172A] dark:text-white leading-none">
                {user.name}
              </p>
              <p className="text-[10px] text-[#0F172A]/50 dark:text-white/50 capitalize leading-tight">
                {user.role}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
