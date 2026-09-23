import { Check, X } from "lucide-react";
import { passwordRules } from "@/lib/validations";
import { cn } from "@/lib/utils";

const levels = [
  { label: "Muito fraca", color: "bg-rose-500" },
  { label: "Fraca", color: "bg-orange-500" },
  { label: "Média", color: "bg-amber-500" },
  { label: "Boa", color: "bg-lime-500" },
  { label: "Forte", color: "bg-brand-500" },
];

/** Indicador visual da força da senha durante a digitação. */
export function PasswordStrength({ password = "" }: { password?: string }) {
  if (!password) return null;
  const passed = passwordRules.filter((rule) => rule.test(password)).length;
  const score = Math.min(4, passed + (password.length >= 12 ? 1 : 0));
  const level = levels[score];

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i < score ? level.color : "bg-slate-200")} />
          ))}
        </div>
        <span className="text-xs font-medium text-slate-600">{level.label}</span>
      </div>
      <ul className="grid gap-1 text-xs">
        {passwordRules.map((rule) => {
          const ok = rule.test(password);
          return (
            <li key={rule.id} className={cn("flex items-center gap-1.5", ok ? "text-brand-700" : "text-slate-500")}>
              {ok ? <Check className="size-3.5" /> : <X className="size-3.5" />}
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
