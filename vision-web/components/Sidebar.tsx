"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, LogOut, User, Activity } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useLang } from "@/context/LangContext";
import Logo from "@/components/Logo";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
}

function SidebarContent({
  navItems,
  onClose,
}: {
  navItems: NavItem[];
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { success } = useToast();
  const { t } = useLang();
  const router = useRouter();

  function handleLogout() {
    logout();
    success("AUTHENTICATION_TERMINATED: Session Closed");
    router.push("/login");
  }

  return (
    
    <div className="flex h-full flex-col w-64 bg-primary dark:bg-primary-hover border-r border-white/10 text-white overflow-hidden shadow-2xl">

   
      <div className="flex h-24 shrink-0 items-center justify-center px-5 border-b border-white/10 bg-black/5">
        <div
          
          className="bg-white/60 p-1 rounded-full w-18 h-18 mt-12 flex items-center justify-center shadow-xl shadow-black/10 border-4 border-white/20"
        >
       
          <div className="">
            <Logo width={100} height={32} />
          </div>
        </div>
      </div>

     
      {user && (
        <div className="mx-4 mt-12">
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 border border-white/10">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-primary font-black shadow-inner shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-white truncate uppercase tracking-tighter">{user.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="h-1 w-1 rounded-full bg-white animate-pulse" />
                <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest">
                  {user.role === "admin" ? "Root_Admin" : "Lab_Technician"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Diagnostic Navigation ── */}
      <nav className="flex-1 px-3 mt-6 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="px-4 mb-2 text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Systems_Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all group ${
                isActive ? "text-white" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-xl bg-white/10 border border-white/20 shadow-lg"
                  transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                />
              )}
              <span className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-white" : "text-white/40 group-hover:text-white"}`}>
                {item.icon}
              </span>
              <span className="relative z-10 uppercase tracking-widest">{item.label}</span>
              
              {item.badge != null && item.badge > 0 && (
                <span className="relative z-10 ml-auto flex h-5 min-w-5 items-center justify-center rounded-lg bg-white text-primary text-[10px] font-black px-1.5 shadow-sm">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Terminal Actions ── */}
      <div className="px-3 py-6 border-t border-white/10 bg-black/5">
        <Link
          href={user?.role === "admin" ? "/admin/settings" : "/settings"}
          onClick={onClose}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <Settings size={16} strokeWidth={2} />
          {t.nav.settings}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full mt-1 flex items-center gap-3 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-red-500/20 transition-all"
        >
          <LogOut size={16} strokeWidth={2} />
          {t.nav.signOut}
        </button>
      </div>

      {/* ── HUD Meta Footer ── */}
      <div className="p-4 bg-black/10 flex items-center justify-between">
          <Activity size={12} className="text-white/20" />
          <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest leading-none">V-DX_SYSTEM_ACTIVE</span>
      </div>
    </div>
  );
}

export default function Sidebar({ isOpen, onClose, navItems }: SidebarProps) {
  return (
    <>
      {/* Desktop Interface */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-40">
        <SidebarContent navItems={navItems} onClose={() => {}} />
      </aside>

      {/* Mobile Terminal Interface */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <SidebarContent navItems={navItems} onClose={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}