"use client";

import React, {
  createContext, useContext, useState, useEffect, useCallback,
} from "react";
import type { User, UserRole } from "@/lib/types";
import { apiLogin, apiGetMe, clearTokens, getStoredAccessToken } from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]         = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session by validating stored token
  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) { setIsLoading(false); return; }

    apiGetMe()
      .then(setUser)
      .catch(() => clearTokens())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    await apiLogin(email, password);   // stores tokens
    const me = await apiGetMe();
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (role: UserRole) => {
      if (!user) return false;
      // "lab" is a legacy alias meaning any non-admin clinical role
      if (role === "lab") {
        return ["doctor", "lab_technician", "technician"].includes(user.role);
      }
      return user.role === role;
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, logout, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
