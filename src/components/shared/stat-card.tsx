import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/feedback";

const tones = {
  brand: "bg-brand-50 text-brand-600",
  income: "bg-income-soft text-income",
  expense: "bg-expense-soft text-expense",
  goal: "bg-goal-soft text-goal",
  neutral: "bg-slate-100 text-slate-600",
};

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: keyof typeof tones;
  helper?: ReactNode;
  highlight?: boolean;
  isLoading?: boolean;
}

export function StatCard({ label, value, icon, tone = "neutral", helper, highlight, isLoading }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-sm",
        highlight
          ? "border-transparent bg-gradient-to-br from-brand-600 to-brand-800 text-white"
          : "border-slate-200 bg-white",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={cn("text-sm font-medium", highlight ? "text-brand-100" : "text-slate-500")}>{label}</p>
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-xl [&>svg]:size-4.5",
            highlight ? "bg-white/15 text-white" : tones[tone],
          )}
        >
          {icon}
        </span>
      </div>
      {isLoading ? (
        <Skeleton className={cn("mt-3 h-8 w-32", highlight && "bg-white/20")} />
      ) : (
        <p className="mt-2 truncate text-2xl font-bold tracking-tight">{value}</p>
      )}
      {helper && !isLoading && (
        <div className={cn("mt-1 text-xs", highlight ? "text-brand-100" : "text-slate-500")}>{helper}</div>
      )}
    </div>
  );
}
