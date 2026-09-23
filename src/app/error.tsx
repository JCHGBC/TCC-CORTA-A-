"use client";

import { ErrorState } from "@/components/ui/feedback";

/** Tela exibida quando acontece um erro inesperado em qualquer página. */
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <ErrorState title="Algo deu errado" message={error.message || "Ocorreu um erro inesperado."} onRetry={retry} />
    </div>
  );
}
