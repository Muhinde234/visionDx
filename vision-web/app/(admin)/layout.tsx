"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ScrollText, BrainCircuit, BarChart3,
} from "lucide-react";
import Sidebar, { type NavItem } from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { useLang } from "@/context/LangContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLang();

  const adminNav: NavItem[] = useMemo(() => [
    { href: "/admin",             label: t.nav.overview,   icon: <LayoutDashboard size={16} strokeWidth={1.8} /> },
    { href: "/admin/analytics",   label: t.nav.analytics,  icon: <BarChart3       size={16} strokeWidth={1.8} /> },
    { href: "/admin/users",       label: t.nav.users,      icon: <Users           size={16} strokeWidth={1.8} /> },
    { href: "/admin/logs",        label: t.nav.logs,       icon: <ScrollText      size={16} strokeWidth={1.8} /> },
    { href: "/admin/model",       label: t.nav.model,      icon: <BrainCircuit    size={16} strokeWidth={1.8} /> },
  ], [t]);

  const title = t.navbar.pageTitle[pathname] ?? "Admin";

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-white dark:bg-[#0F172A]">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          navItems={adminNav}
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
