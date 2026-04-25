import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ScanProvider } from "@/context/ScanContext";
import { ToastProvider } from "@/context/ToastContext";
import { LangProvider } from "@/context/LangContext";
import { ThemeScript } from "@/components/ThemeScript";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "VisionDX — AI Malaria Diagnostics",
  description: "AI-powered blood smear analysis for malaria detection and staging",
  keywords: ["malaria", "diagnostics", "AI", "blood smear", "YOLO"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="h-full antialiased" suppressHydrationWarning>
        <LangProvider>
          <AuthProvider>
            <ScanProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </ScanProvider>
          </AuthProvider>
        </LangProvider>
      </body>
    </html>
  );
}
