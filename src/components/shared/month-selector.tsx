"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { currentMonthKey, formatMonthYear, shiftMonth } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface MonthSelectorProps {
  value: string;
  onChange: (month: string) => void;
  className?: string;
}

/** Navegação entre meses: ‹ Setembro de 2026 › */
export function MonthSelector({ value, onChange, className }: MonthSelectorProps) {
  const isCurrent = value === currentMonthKey();
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm", className)}>
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value, -1))}
        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="size-4.5" />
      </button>
      <span className="min-w-36 text-center text-sm font-semibold text-slate-800" aria-live="polite">
        {formatMonthYear(value)}
      </span>
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value, 1))}
        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        aria-label="Próximo mês"
      >
        <ChevronRight className="size-4.5" />
      </button>
      {!isCurrent && (
        <button
          type="button"
          onClick={() => onChange(currentMonthKey())}
          className="ml-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
        >
          Hoje
        </button>
      )}
    </div>
  );
}
