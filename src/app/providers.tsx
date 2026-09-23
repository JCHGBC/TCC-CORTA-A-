"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "@/features/auth/auth-context";

/** Provedores globais: sessão do usuário e mensagens de feedback (toasts). */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster richColors closeButton position="top-right" toastOptions={{ duration: 3500 }} />
    </AuthProvider>
  );
}
