import type { ComponentProps, ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends Omit<ComponentProps<"input">, "type"> {
  id: string;
  label: ReactNode;
  error?: string;
}

export function Checkbox({ id, label, error, className, ...props }: CheckboxProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-600 select-none">
        <input
          id={id}
          type="checkbox"
          aria-invalid={!!error}
          className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-slate-300 accent-brand-600"
          {...props}
        />
        <span>{label}</span>
      </label>
      {error && (
        <p role="alert" className="flex items-center gap-1 text-xs font-medium text-rose-600">
          <CircleAlert className="size-3.5" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
