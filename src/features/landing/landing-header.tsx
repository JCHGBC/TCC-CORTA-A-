"use client";

import { useState } from "react";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ButtonLink } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";
import { cn } from "@/lib/utils";

const links = [
  { href: "#recursos", label: "Recursos" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#comparativo", label: "Planilha x Corta Aí" },
  { href: "#equipe", label: "Equipe" },
];

export function LandingHeader() {
  const { user, isLoading } = useAuth();
  const [open, setOpen] = useState(false);

  const actions = user ? (
    <ButtonLink href="/dashboard" leftIcon={<LayoutDashboard className="size-4" />}>
      Ir para o painel
    </ButtonLink>
  ) : (
    <>
      <ButtonLink href="/login" variant="ghost">
        Entrar
      </ButtonLink>
      <ButtonLink href="/cadastro">Criar conta grátis</ButtonLink>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Seções da página" className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
              {link.label}
            </a>
          ))}
        </nav>
        <div className={cn("hidden items-center gap-2 transition-opacity md:flex", isLoading && "opacity-0")}>{actions}</div>
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X className="size-5.5" /> : <Menu className="size-5.5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 pt-2 pb-4 animate-fade-in md:hidden">
          <nav className="flex flex-col">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 grid gap-2 [&>a]:w-full">{actions}</div>
        </div>
      )}
    </header>
  );
}
