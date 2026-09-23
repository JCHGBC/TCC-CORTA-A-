import {
  ArrowDownCircle,
  ArrowRight,
  ArrowUpCircle,
  ChartPie,
  Check,
  History,
  PencilLine,
  ShieldCheck,
  Smartphone,
  Target,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ButtonLink } from "@/components/ui/button";
import { TEAM } from "@/config/constants";
import { LandingHeader } from "./landing-header";

const features = [
  {
    icon: ArrowUpCircle,
    title: "Registro de entradas",
    text: "Anote salário, freelas e qualquer valor recebido, definindo a origem de cada um.",
    color: "text-income bg-income-soft",
  },
  {
    icon: ArrowDownCircle,
    title: "Registro de saídas",
    text: "Registre seus gastos por categoria e descubra exatamente onde dá para cortar.",
    color: "text-expense bg-expense-soft",
  },
  {
    icon: Target,
    title: "Metas financeiras",
    text: "Crie objetivos, guarde aos poucos e veja quanto falta — e quanto guardar por mês.",
    color: "text-goal bg-goal-soft",
  },
  {
    icon: ChartPie,
    title: "Relatórios visuais",
    text: "Gráficos claros de entradas x saídas e gastos por categoria, mês a mês.",
    color: "text-sky-600 bg-sky-50",
  },
  {
    icon: History,
    title: "Histórico completo",
    text: "Consulte, filtre e exporte todas as movimentações para CSV quando quiser.",
    color: "text-amber-600 bg-amber-50",
  },
  {
    icon: ShieldCheck,
    title: "Seus dados, só seus",
    text: "Acesso com login e senha. Nada de conectar sua conta bancária.",
    color: "text-slate-700 bg-slate-100",
  },
];

const steps = [
  { icon: PencilLine, title: "Crie sua conta", text: "Cadastro rápido, com categorias prontas para usar." },
  { icon: Wallet, title: "Anote suas movimentações", text: "Registre entradas e saídas em segundos, até pelo celular." },
  { icon: TrendingUp, title: "Acompanhe e corte", text: "Veja seu saldo, gráficos e metas atualizados na hora." },
];

const comparison = [
  { item: "Fórmulas e configuração manual", sheet: true, app: false },
  { item: "Gráficos prontos e atualizados automaticamente", sheet: false, app: true },
  { item: "Fácil de usar no celular", sheet: false, app: true },
  { item: "Metas com progresso visual", sheet: false, app: true },
  { item: "Risco de apagar uma fórmula sem querer", sheet: true, app: false },
  { item: "Categorias e filtros prontos", sheet: false, app: true },
];

/** Mini "print" do sistema usado como ilustração no topo da página. */
function HeroPreview() {
  const bars = [
    [60, 45],
    [72, 50],
    [65, 58],
    [80, 52],
    [70, 40],
    [85, 48],
  ];
  return (
    <div className="relative mx-auto w-full max-w-lg" aria-hidden>
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-brand-200/60 via-sky-100/60 to-violet-100/60 blur-2xl" />
      <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-3 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white sm:col-span-1">
            <p className="text-xs text-brand-100">Saldo atual</p>
            <p className="mt-1 text-xl font-bold">R$ 4.820</p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4 max-sm:col-span-3 sm:col-span-1">
            <p className="text-xs text-slate-500">Entradas</p>
            <p className="mt-1 text-lg font-bold text-income">R$ 3.900</p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4 max-sm:col-span-3 sm:col-span-1">
            <p className="text-xs text-slate-500">Saídas</p>
            <p className="mt-1 text-lg font-bold text-expense">R$ 2.310</p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-slate-100 p-4">
          <p className="text-xs font-semibold text-slate-700">Entradas x Saídas</p>
          <div className="mt-3 flex h-28 items-end justify-between gap-3">
            {bars.map(([a, b], i) => (
              <div key={i} className="flex h-full flex-1 items-end justify-center gap-0.5">
                <span className="w-full max-w-3 rounded-t bg-[#0d9488]" style={{ height: `${a}%` }} />
                <span className="w-full max-w-3 rounded-t bg-[#f43f5e]" style={{ height: `${b}%` }} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-slate-100 p-4">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-700">Viagem de férias</span>
            <span className="text-slate-500">72%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div className="h-2 w-[72%] rounded-full bg-violet-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="bg-white">
      <LandingHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
            <div className="animate-slide-up">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 ring-1 ring-brand-200">
                <Smartphone className="size-4" /> Funciona no computador e no celular
              </span>
              <h1 className="mt-6 text-4xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Chega de planilha. <span className="text-brand-600">Corta aí</span> os gastos e veja seu dinheiro render.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-600">
                O Corta Aí é um controle financeiro pessoal simples e visual: anote suas entradas e saídas, acompanhe seu saldo, crie
                metas e entenda seus hábitos — sem precisar conectar sua conta bancária.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/cadastro" size="lg">
                  Começar agora — é grátis <ArrowRight className="size-4.5" />
                </ButtonLink>
                <ButtonLink href="/login" size="lg" variant="outline">
                  Ver demonstração
                </ButtonLink>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                {["Sem cartão de crédito", "Sem integração bancária", "Pronto em 1 minuto"].map((text) => (
                  <li key={text} className="flex items-center gap-1.5">
                    <Check className="size-4 text-brand-600" /> {text}
                  </li>
                ))}
              </ul>
            </div>
            <HeroPreview />
          </div>
        </section>

        {/* Recursos */}
        <section id="recursos" className="scroll-mt-16 bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold tracking-wider text-brand-600 uppercase">Recursos</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Tudo o que você precisa, nada que atrapalhe</h2>
              <p className="mt-4 text-slate-600">Pensado para quem quer organizar as finanças sem complicação.</p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, text, color }) => (
                <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <span className={`flex size-11 items-center justify-center rounded-xl ${color}`}>
                    <Icon className="size-5.5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className="scroll-mt-16 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold tracking-wider text-brand-600 uppercase">Como funciona</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Em 3 passos você está no controle</h2>
            </div>
            <ol className="mt-12 grid gap-8 md:grid-cols-3">
              {steps.map(({ icon: Icon, title, text }, index) => (
                <li key={title} className="relative text-center">
                  <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
                    <Icon className="size-6" />
                  </span>
                  <span className="mt-4 block text-sm font-semibold text-brand-600">Passo {index + 1}</span>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Comparativo */}
        <section id="comparativo" className="scroll-mt-16 bg-slate-50 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center">
              <p className="text-sm font-semibold tracking-wider text-brand-600 uppercase">Comparativo</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Planilha x Corta Aí</h2>
            </div>
            <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  <tr>
                    <th scope="col" className="px-5 py-3 text-left">Característica</th>
                    <th scope="col" className="px-3 py-3 text-center">Planilha</th>
                    <th scope="col" className="px-3 py-3 text-center text-brand-700">Corta Aí</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparison.map((row) => (
                    <tr key={row.item}>
                      <th scope="row" className="px-5 py-3.5 text-left font-medium text-slate-700">{row.item}</th>
                      {[row.sheet, row.app].map((value, i) => (
                        <td key={i} className="px-3 py-3.5 text-center">
                          {value ? (
                            <Check className="mx-auto size-5 text-slate-700" aria-label="Sim" />
                          ) : (
                            <X className="mx-auto size-5 text-slate-300" aria-label="Não" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Chamada final */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-14 text-center sm:px-12">
              <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-brand-500/30 blur-3xl" />
              <h2 className="relative text-3xl font-bold text-white sm:text-4xl">Pronto para cortar os gastos desnecessários?</h2>
              <p className="relative mx-auto mt-4 max-w-xl text-slate-300">
                Crie sua conta gratuita e faça seu primeiro registro em menos de um minuto.
              </p>
              <ButtonLink href="/cadastro" size="lg" className="relative mt-8">
                Criar minha conta <ArrowRight className="size-4.5" />
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>

      <footer id="equipe" className="scroll-mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              Sistema web de controle financeiro pessoal desenvolvido como Trabalho de Conclusão de Curso.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Equipe</h3>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
              {TEAM.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Instituição</h3>
            <p className="mt-3 text-sm text-slate-600">CEDUP — Curso Técnico em Desenvolvimento de Sistemas</p>
          </div>
        </div>
        <p className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Corta Aí. Projeto acadêmico.
        </p>
      </footer>
    </div>
  );
}
