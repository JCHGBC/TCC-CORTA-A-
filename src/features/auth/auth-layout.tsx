import type { ReactNode } from "react";
import { ChartPie, ShieldCheck, Target } from "lucide-react";
import { Logo } from "@/components/shared/logo";

const highlights = [
  { icon: ChartPie, text: "Veja para onde vai cada real com gráficos simples." },
  { icon: Target, text: "Crie metas e acompanhe quanto falta para chegar lá." },
  { icon: ShieldCheck, text: "Sem conectar banco: você anota, você controla." },
];

/** Layout das telas de login, cadastro e recuperação de senha. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 size-96 rounded-full bg-brand-700/30 blur-3xl" />
        <Logo variant="light" className="relative" />
        <div className="relative space-y-8">
          <h2 className="max-w-md text-4xl leading-tight font-bold">
            Troque a planilha por um controle financeiro que você <span className="text-brand-400">entende de verdade</span>.
          </h2>
          <ul className="space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-slate-300">
                <span className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-brand-300">
                  <Icon className="size-4.5" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-slate-500">© {new Date().getFullYear()} Corta Aí · Projeto de TCC — CEDUP</p>
      </aside>

      <main className="flex flex-col px-4 py-8 sm:px-8">
        <Logo className="mb-10 lg:hidden" />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center animate-slide-up">{children}</div>
      </main>
    </div>
  );
}
