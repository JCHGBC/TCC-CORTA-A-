import type { ComponentProps, ReactNode } from "react";
import { Inbox, Loader2, RefreshCw, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

/**
 * Estados visuais padronizados: carregando, vazio e erro.
 * (O estado de sucesso é mostrado com toasts — ver lib/toast.ts)
 */

export function Spinner({ className, label = "Carregando..." }: { className?: string; label?: string }) {
  return (
    <span role="status" className="inline-flex items-center">
      <Loader2 className={cn("size-5 animate-spin text-brand-600", className)} aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div aria-hidden className={cn("animate-pulse rounded-lg bg-slate-200/80", className)} {...props} />;
}

/** Lista "fantasma" exibida enquanto os dados carregam. */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Carregando" className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-5 py-4">
          <Skeleton className="size-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

interface StateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ title, description, icon, action, className, compact }: StateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center animate-fade-in",
        compact ? "gap-2 px-4 py-8" : "gap-3 px-6 py-14",
        className,
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 [&>svg]:size-7">
        {icon ?? <Inbox />}
      </span>
      <div className="max-w-sm space-y-1">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string | null;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ title = "Não foi possível carregar", message, onRetry, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn("flex flex-col items-center justify-center gap-3 px-6 py-14 text-center animate-fade-in", className)}
    >
      <span className="flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
        <TriangleAlert className="size-7" />
      </span>
      <div className="max-w-sm space-y-1">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500">{message ?? "Verifique sua conexão e tente novamente."}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="size-4" />}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

/** Tela cheia de carregamento (ex.: verificando a sessão). */
export function FullPageLoader({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-slate-50">
      <Spinner className="size-8" label={label} />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
