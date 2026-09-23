import type { ComponentProps } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Field, controlStyles } from "./field";

interface SelectProps extends ComponentProps<"select"> {
  id: string;
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  containerClassName?: string;
}

export function Select({
  id,
  label,
  error,
  hint,
  placeholder,
  options,
  className,
  containerClassName,
  required,
  ...props
}: SelectProps) {
  return (
    <Field id={id} label={label} error={error} hint={hint} required={required} className={containerClassName}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(controlStyles(!!error), "h-11 appearance-none pr-10 pl-3.5", className)}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
      </div>
    </Field>
  );
}
