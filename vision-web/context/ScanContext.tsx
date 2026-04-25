"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { Prediction } from "@/lib/types";

interface ScanContextValue {
  latestResult: Prediction | null;
  setLatestResult: (r: Prediction | null) => void;
  clearResult: () => void;
}

const ScanContext = createContext<ScanContextValue | null>(null);

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [latestResult, setLatestResultState] = useState<Prediction | null>(null);

  const setLatestResult = useCallback((r: Prediction | null) => {
    setLatestResultState(r);
  }, []);

  const clearResult = useCallback(() => setLatestResultState(null), []);

  return (
    <ScanContext.Provider value={{ latestResult, setLatestResult, clearResult }}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error("useScan must be used inside <ScanProvider>");
  return ctx;
}
