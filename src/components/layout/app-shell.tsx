"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Menu, Plus, X } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { APP_NAVIGATION } from "@/config/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { QuickAddProvider, useQuickAdd } from "@/features/transactions/quick-add";
import { firstName } from "@/lib/utils";
import { SidebarNav } from "./sidebar-nav";
import { Avatar, UserMenu } from "./user-menu";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 px-4 py-6">
      <div className="px-2">
        <Logo href="/dashboard" variant="light" />
      </div>
      <div className="flex-1 overflow-y-auto">
        <p className="mb-2 px-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">Menu</p>
        <SidebarNav onNavigate={onNavigate} />
      </div>
      <UserMenu />
    </div>
  );
}

function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const { open } = useQuickAdd();
  const current = APP_NAVIGATION.find((item) => pathname.startsWith(item.href));

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          className="-ml-2 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="size-5.5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="hidden text-sm text-slate-500 sm:block">Olá, {user ? firstName(user.name) : ""} 👋</p>
          <p className="truncate text-sm font-semibold text-slate-900 sm:text-xs sm:font-normal sm:text-slate-400">
            {current?.description ?? "Corta Aí"}
          </p>
        </div>
        <Button size="sm" onClick={() => open()} leftIcon={<Plus className="size-4" />} className="hidden sm:inline-flex">
          Nova movimentação
        </Button>
        {user && <Avatar name={user.name} className="size-9 text-sm lg:hidden" />}
      </div>
    </header>
  );
}

/** Botão flutuante de "adicionar" no celular. */
function FloatingAddButton() {
  const { open } = useQuickAdd();
  return (
    <button
      type="button"
      onClick={() => open()}
      className="fixed right-5 bottom-5 z-30 flex size-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/40 transition-transform hover:scale-105 active:scale-95 sm:hidden"
      aria-label="Nova movimentação"
    >
      <Plus className="size-6" />
    </button>
  );
}

/** Estrutura da área logada: menu lateral + barra superior + conteúdo. */
export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <QuickAddProvider>
      <div className="min-h-dvh">
        {/* Menu lateral fixo (computador) */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-68 bg-slate-900 lg:block">
          <SidebarContent />
        </aside>

        {/* Menu gaveta (celular/tablet) */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="absolute inset-0 bg-slate-900/60 animate-fade-in" onClick={() => setMobileOpen(false)} />
            <aside className="relative h-full w-72 max-w-[85vw] bg-slate-900 shadow-xl animate-slide-in-left">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute top-6 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Fechar menu"
              >
                <X className="size-5" />
              </button>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        <div className="lg:pl-68">
          <Topbar onOpenMenu={() => setMobileOpen(true)} />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-24 sm:px-6 sm:pb-10 lg:px-8 lg:py-8">{children}</main>
        </div>
        <FloatingAddButton />
      </div>
    </QuickAddProvider>
  );
}
