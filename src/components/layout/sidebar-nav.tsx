"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAVIGATION } from "@/config/navigation";
import { cn } from "@/lib/utils";

/** Lista de links do menu, destacando a página atual. */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Menu principal" className="flex flex-col gap-1">
      {APP_NAVIGATION.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-brand-600 text-white shadow-sm shadow-brand-900/40" : "text-slate-300 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className={cn("size-5 shrink-0", active ? "text-white" : "text-slate-400 group-hover:text-brand-300")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
