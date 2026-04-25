"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Upload, BarChart2, Clock, FileText,
  Users, Stethoscope,
} from "lucide-react";
import Sidebar, { type NavItem } from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { useLang } from "@/context/LangContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLang();

  const labNav: NavItem[] = useMemo(() => [
    { href: "/dashboard",    label: t.nav.dashboard,    icon: <LayoutDashboard size={16} strokeWidth={1.8} /> },
    { href: "/diagnoses/new", label: "New Diagnosis",    icon: <Upload          size={16} strokeWidth={1.8} /> },
    { href: "/patients",     label: "Patients",          icon: <Users           size={16} strokeWidth={1.8} /> },
    { href: "/diagnoses",    label: "Diagnoses",         icon: <Stethoscope     size={16} strokeWidth={1.8} /> },
    { href: "/history",      label: t.nav.history,       icon: <Clock           size={16} strokeWidth={1.8} /> },
    { href: "/results",      label: t.nav.results,       icon: <BarChart2       size={16} strokeWidth={1.8} /> },
    { href: "/reports",      label: t.nav.reports,       icon: <FileText        size={16} strokeWidth={1.8} /> },
  ], [t]);

  const title = t.navbar.pageTitle[pathname] ?? "VisionDX";

  return (
    <AuthGuard requiredRole="lab">
      <div className="min-h-screen bg-white dark:bg-[#0F172A]">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          navItems={labNav}
        />
        <div className="lg:pl-64 flex flex-col min-h-screen">
          <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />
          <main className="flex-1 p-4 lg:p-6 page-enter">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
