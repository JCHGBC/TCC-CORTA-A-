import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Field, controlStyles } from "./field";

interface TextareaProps extends ComponentProps<"textarea"> {
  id: string;
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export function Textarea({ id, label, error, hint, className, containerClassName, required, ...props }: TextareaProps) {
  return (
    <Field id={id} label={label} error={error} hint={hint} required={required} className={containerClassName}>
      <textarea
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(controlStyles(!!error), "min-h-20 resize-y px-3.5 py-2.5", className)}
        {...props}
      />
    </Field>
  );
}
