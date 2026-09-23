import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const badgeTones = {
  neutral: "bg-slate-100 text-slate-700",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  danger: "bg-rose-50 text-rose-700 ring-rose-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  info: "bg-sky-50 text-sky-700 ring-sky-600/20",
  goal: "bg-violet-50 text-violet-700 ring-violet-600/20",
};

interface BadgeProps extends ComponentProps<"span"> {
  tone?: keyof typeof badgeTones;
  icon?: ReactNode;
}

export function Badge({ tone = "neutral", icon, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-transparent ring-inset [&>svg]:size-3",
        badgeTones[tone],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}

interface ProgressBarProps {
  value: number;
  color?: string;
  className?: string;
  label?: string;
}

export function ProgressBar({ value, color = "#10b981", className, label }: ProgressBarProps) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={safe}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-slate-100", className)}
    >
      <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${safe}%`, backgroundColor: color }} />
    </div>
  );
}

/** Bolinha colorida que representa uma categoria. */
export function ColorDot({ color, className }: { color: string; className?: string }) {
  return <span className={cn("inline-block size-2.5 shrink-0 rounded-full", className)} style={{ backgroundColor: color }} />;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; icon?: ReactNode }[];
  className?: string;
  ariaLabel: string;
}

/** Seletor em abas (ex.: Entradas | Saídas). */
export function SegmentedControl<T extends string>({ value, onChange, options, className, ariaLabel }: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn("inline-flex rounded-xl bg-slate-100 p-1", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all [&>svg]:size-4",
              active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
