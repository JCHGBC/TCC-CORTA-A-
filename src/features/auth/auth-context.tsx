"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService } from "@/services";
import type { ProfileInput, RegisterInput, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  /** true enquanto verifica se existe uma sessão salva */
  isLoading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (input: ProfileInput) => Promise<User>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authService
      .getCurrentUser()
      .then((current) => active && setUser(current))
      .catch(() => active && setUser(null))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const logged = await authService.login(email, password, remember);
    setUser(logged);
    return logged;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const created = await authService.register(input);
    setUser(created);
    return created;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (input: ProfileInput) => {
      if (!user) throw new Error("Sessão expirada.");
      const updated = await authService.updateProfile(user.id, input);
      setUser(updated);
      return updated;
    },
    [user],
  );

  const deleteAccount = useCallback(async () => {
    if (!user) return;
    await authService.deleteAccount(user.id);
    setUser(null);
  }, [user]);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, updateProfile, deleteAccount }),
    [user, isLoading, login, register, logout, updateProfile, deleteAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de <AuthProvider>.");
  return context;
}

/** Atalho para telas da área logada (o layout garante que o usuário existe). */
export function useCurrentUser() {
  const { user } = useAuth();
  if (!user) throw new Error("Usuário não autenticado.");
  return user;
}
