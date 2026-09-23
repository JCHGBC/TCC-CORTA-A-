import Link from "next/link";
import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
  variant?: "dark" | "light";
  showText?: boolean;
}

export function Logo({ href = "/", className, variant = "dark", showText = true }: LogoProps) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 font-bold", className)} aria-label="Corta Aí — página inicial">
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-md shadow-brand-600/30">
        <Scissors className="size-5 -rotate-45" strokeWidth={2.5} />
      </span>
      {showText && (
        <span className={cn("text-xl tracking-tight", variant === "dark" ? "text-slate-900" : "text-white")}>
          Corta<span className="text-brand-500"> Aí</span>
        </span>
      )}
    </Link>
  );
}
