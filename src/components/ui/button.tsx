import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:ring-brand-500",
  secondary: "bg-brand-50 text-brand-700 hover:bg-brand-100 focus-visible:ring-brand-500",
  outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-brand-500",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400",
  danger: "bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:ring-rose-500",
  "danger-outline": "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 focus-visible:ring-rose-500",
};

const sizes = {
  sm: "h-9 gap-1.5 px-3 text-sm",
  md: "h-11 gap-2 px-4 text-sm",
  lg: "h-12 gap-2 px-6 text-base",
  icon: "h-10 w-10",
};

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function buttonStyles({ variant = "primary", size = "md", fullWidth }: StyleProps = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-xl font-semibold transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-60",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
  );
}

interface ButtonProps extends ComponentProps<"button">, StyleProps {
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
}

export function Button({
  variant,
  size,
  fullWidth,
  isLoading,
  loadingText,
  leftIcon,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonStyles({ variant, size, fullWidth }), className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : leftIcon}
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link>, StyleProps {
  leftIcon?: ReactNode;
}

export function ButtonLink({ variant, size, fullWidth, leftIcon, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={cn(buttonStyles({ variant, size, fullWidth }), className)} {...props}>
      {leftIcon}
      {children}
    </Link>
  );
}
