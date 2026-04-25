"use client";

import React, {
  createContext, useContext, useState, useCallback, useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "i",
};

const STYLES: Record<ToastVariant, string> = {
  success: "bg-green-500",
  error:   "bg-red-500",
  warning: "bg-amber-500",
  info:    "bg-blue-500",
};

const DURATION = 4000;

function ToastItem({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, DURATION);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.22 }}
      className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 shadow-lg min-w-[280px] max-w-sm"
    >
      <span className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold ${STYLES[item.variant]}`}>
        {ICONS[item.variant]}
      </span>
      <p className="text-sm text-slate-800 dark:text-slate-100 flex-1">{item.message}</p>
      <button
        onClick={onDismiss}
        className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-sm"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const success = useCallback((m: string) => toast(m, "success"), [toast]);
  const error   = useCallback((m: string) => toast(m, "error"), [toast]);
  const warning = useCallback((m: string) => toast(m, "warning"), [toast]);
  const info    = useCallback((m: string) => toast(m, "info"), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      {/* Toaster portal */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end">
        <AnimatePresence mode="popLayout">
          {toasts.map((item) => (
            <ToastItem key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
