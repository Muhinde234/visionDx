"use client";

import React, {
  createContext, useContext, useState, useEffect, useCallback,
} from "react";
import { translations, type Locale, type Dict } from "@/lib/i18n/translations";

const LANG_KEY = "visiondx_lang";
const DEFAULT_LOCALE: Locale = "en";

interface LangContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dict;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  
  useEffect(() => {
    const stored = localStorage.getItem(LANG_KEY) as Locale | null;
    if (stored && stored in translations) setLocaleState(stored);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(LANG_KEY, l);
  }, []);

  return (
    <LangContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}
