import { Compass } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <span className="flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Compass className="size-8" />
      </span>
      <div>
        <p className="text-sm font-semibold text-brand-600">Erro 404</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Página não encontrada</h1>
        <p className="mt-2 max-w-sm text-slate-500">O endereço que você tentou acessar não existe ou foi movido.</p>
      </div>
      <div className="flex gap-2">
        <ButtonLink href="/" variant="outline">
          Página inicial
        </ButtonLink>
        <ButtonLink href="/dashboard">Ir para o painel</ButtonLink>
      </div>
    </div>
  );
}
