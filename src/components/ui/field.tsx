import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldProps {
  id: string;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  labelAction?: ReactNode;
  children: ReactNode;
}

/** Estrutura padrão de um campo: rótulo + controle + mensagem de erro/dica. */
export function Field({ id, label, error, hint, required, className, labelAction, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {(label || labelAction) && (
        <div className="flex items-center justify-between gap-2">
          {label && (
            <label htmlFor={id} className="text-sm font-medium text-slate-700">
              {label}
              {required && (
                <span className="ml-0.5 text-rose-500" aria-hidden>
                  *
                </span>
              )}
            </label>
          )}
          {labelAction}
        </div>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="flex items-start gap-1 text-xs font-medium text-rose-600">
          <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Classes compartilhadas por input, select e textarea. */
export function controlStyles(hasError?: boolean) {
  return cn(
    "w-full rounded-xl border bg-white text-sm text-slate-900 placeholder:text-slate-400 transition-colors",
    "focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
    hasError
      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
      : "border-slate-300 hover:border-slate-400 focus:border-brand-500 focus:ring-brand-100",
  );
}
