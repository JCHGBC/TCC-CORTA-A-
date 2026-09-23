"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/features/auth/auth-context";
import { notify } from "@/lib/toast";
import { getInitials } from "@/lib/utils";

export function Avatar({ name, className = "size-9 text-sm" }: { name: string; className?: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 font-semibold text-white ${className}`}
      aria-hidden
    >
      {getInitials(name)}
    </span>
  );
}

/** Rodapé do menu lateral com dados do usuário e botão de sair. */
export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  if (!user) return null;

  async function handleLogout() {
    setLeaving(true);
    await logout();
    notify.info("Você saiu da sua conta.", "Até logo!");
    router.replace("/login");
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
      <Avatar name={user.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{user.name}</p>
        <p className="truncate text-xs text-slate-400">{user.email}</p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={leaving}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-rose-300 disabled:opacity-50"
        aria-label="Sair da conta"
        title="Sair"
      >
        <LogOut className="size-4.5" />
      </button>
    </div>
  );
}
