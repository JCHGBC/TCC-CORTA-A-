"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FullPageLoader } from "@/components/ui/feedback";
import { ROUTES } from "@/config/navigation";
import { useAuth } from "./auth-context";

/**
 * Protege as páginas da área logada (RNF-02).
 * Sem sessão → redireciona para o login.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`${ROUTES.login}?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, router, pathname]);

  if (isLoading) return <FullPageLoader label="Verificando sua sessão..." />;
  if (!user) return <FullPageLoader label="Redirecionando para o login..." />;
  return <>{children}</>;
}

/** Aceita apenas caminhos internos (evita redirecionar para sites externos). */
function getSafeRedirect() {
  const target = new URLSearchParams(window.location.search).get("redirect");
  return target && target.startsWith("/") && !target.startsWith("//") ? target : ROUTES.dashboard;
}

/**
 * Páginas de login/cadastro: se já estiver logado (ou acabou de entrar),
 * vai para o painel ou para a página que o usuário tentou acessar antes.
 */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) router.replace(getSafeRedirect());
  }, [isLoading, user, router]);

  if (isLoading) return <FullPageLoader />;
  if (user) return <FullPageLoader label="Entrando..." />;
  return <>{children}</>;
}
