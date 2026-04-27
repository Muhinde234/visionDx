"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ImageIcon, Loader2 } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  accept?: string;
}

export default function FileUpload({ onFileSelect, isLoading = false, accept = "image/*" }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFilename(file.name);
    const url = URL.createObjectURL(file);
    setPreview(url);
    onFileSelect(file);
  }, [onFileSelect]);

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function onDragLeave() {
    setIsDragOver(false);
  }

  function clearFile() {
    setPreview(null);
    setFilename(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      <div
        onClick={() => !isLoading && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 ${
          isDragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onInputChange}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative p-4"
            >
              <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-contain" />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-300 truncate max-w-xs">
                  {filename}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  className="ml-2 rounded-lg p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  aria-label="Remove file"
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 px-6 text-center"
            >
              <div className={`rounded-2xl p-4 mb-4 ${isDragOver ? "bg-blue-100 dark:bg-blue-900/40" : "bg-slate-100 dark:bg-slate-700"} transition-colors`}>
                <ImageIcon
                  size={40}
                  className={`${isDragOver ? "text-blue-500" : "text-slate-400"} transition-colors`}
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                {isDragOver ? "Drop image here" : "Drop your blood smear image"}
              </p>
              <p className="mt-1 text-sm text-slate-400">or click to browse — PNG, JPG, TIFF up to 20 MB</p>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && (
          <div className="absolute inset-0 rounded-2xl bg-white/70 dark:bg-slate-900/70 flex items-center justify-center">
            <div className="flex items-center gap-3 text-blue-600">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm font-medium">Analysing…</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
