"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Field, controlStyles } from "./field";

export interface InputProps extends ComponentProps<"input"> {
  id: string;
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  containerClassName?: string;
  labelAction?: ReactNode;
}

export function Input({
  id,
  label,
  error,
  hint,
  leftIcon,
  rightElement,
  className,
  containerClassName,
  required,
  labelAction,
  ...props
}: InputProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <Field
      id={id}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={containerClassName}
      labelAction={labelAction}
    >
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400 [&>svg]:size-4.5">
            {leftIcon}
          </span>
        )}
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          aria-required={required}
          className={cn(controlStyles(!!error), "h-11 px-3.5", leftIcon && "pl-10", rightElement && "pr-11", className)}
          {...props}
        />
        {rightElement && <span className="absolute inset-y-0 right-1.5 flex items-center">{rightElement}</span>}
      </div>
    </Field>
  );
}

/** Campo de senha com botão para mostrar/ocultar. */
export function PasswordInput(props: Omit<InputProps, "type" | "rightElement">) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      rightElement={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        >
          {visible ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
        </button>
      }
    />
  );
}
