"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/types";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (requiredRole && !hasRole(requiredRole)) {
     
      router.replace(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [user, isLoading, requiredRole, hasRole, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0F1C]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin" />
          <p className="text-sm text-slate-400">Loading VisionDX…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (requiredRole && !hasRole(requiredRole)) return null;

  return <>{children}</>;
}
