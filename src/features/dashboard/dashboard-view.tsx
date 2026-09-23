"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowRight,
  ArrowUpCircle,
  ChartColumn,
  Lightbulb,
  PiggyBank,
  Plus,
  ReceiptText,
  Scissors,
  Target,
  Wallet,
} from "lucide-react";
import { MonthSelector } from "@/components/shared/month-selector";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState, ErrorState, ListSkeleton, Skeleton } from "@/components/ui/feedback";
import { ProgressBar } from "@/components/ui/misc";
import { useCurrentUser } from "@/features/auth/auth-context";
import { useGoals } from "@/features/goals/hooks";
import { CategoryBreakdown, IncomeExpenseChart } from "@/features/reports/charts";
import { useCategories, useTransactions } from "@/features/transactions/hooks";
import { useQuickAdd } from "@/features/transactions/quick-add";
import { TransactionList } from "@/features/transactions/transaction-list";
import {
  balanceUntil,
  calculateTotals,
  goalProgress,
  groupByCategory,
  isGoalCompleted,
  monthlySeries,
  percentChange,
  savingsRate,
} from "@/lib/finance";
import { currentMonthKey, formatCurrency, formatMonthYear, formatPercent, shiftMonth } from "@/lib/formatters";
import { cn, firstName } from "@/lib/utils";

function ChangeHelper({ value, inverse }: { value: number; inverse?: boolean }) {
  if (value === 0) return <span>Igual ao mês anterior</span>;
  const good = inverse ? value < 0 : value > 0;
  return (
    <span className={cn("font-semibold", good ? "text-income" : "text-expense")}>
      {value > 0 ? "▲" : "▼"} {formatPercent(Math.abs(value))} <span className="font-normal text-slate-500">vs. mês anterior</span>
    </span>
  );
}

/** Painel principal: visão geral das finanças do usuário. */
export function DashboardView() {
  const user = useCurrentUser();
  const { open } = useQuickAdd();
  const [month, setMonth] = useState(currentMonthKey);

  const transactions = useTransactions();
  const categories = useCategories();
  const goals = useGoals();

  const data = useMemo(() => {
    const all = transactions.data ?? [];
    const inMonth = all.filter((t) => t.date.startsWith(month));
    const previous = all.filter((t) => t.date.startsWith(shiftMonth(month, -1)));
    const totals = calculateTotals(inMonth);
    const previousTotals = calculateTotals(previous);
    const expensesByCategory = groupByCategory(
      inMonth.filter((t) => t.type === "saida"),
      categories.data ?? [],
    );
    return {
      totals,
      balance: balanceUntil(all, month),
      incomeChange: percentChange(totals.income, previousTotals.income),
      expenseChange: percentChange(totals.expense, previousTotals.expense),
      savings: savingsRate(totals),
      series: monthlySeries(all, month, 6),
      expensesByCategory,
      recent: inMonth.slice(0, 6),
      hasAny: all.length > 0,
    };
  }, [transactions.data, categories.data, month]);

  const activeGoals = (goals.data ?? []).filter((g) => !isGoalCompleted(g)).slice(0, 3);
  const isLoading = transactions.status === "loading";
  const topExpense = data.expensesByCategory[0];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Olá, {firstName(user.name)}!
          </h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-base">Veja como estão suas finanças em {formatMonthYear(month).toLowerCase()}.</p>
        </div>
        <MonthSelector value={month} onChange={setMonth} className="self-start sm:self-auto" />
      </div>

      {transactions.status === "error" ? (
        <Card>
          <ErrorState message={transactions.error} onRetry={transactions.retry} />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Saldo atual"
              value={`${data.balance < 0 ? "-" : ""}${formatCurrency(Math.abs(data.balance))}`}
              icon={<Wallet />}
              highlight
              helper={`Acumulado até ${formatMonthYear(month).toLowerCase()}`}
              isLoading={isLoading}
            />
            <StatCard
              label="Entradas do mês"
              value={formatCurrency(data.totals.income)}
              icon={<ArrowUpCircle />}
              tone="income"
              helper={<ChangeHelper value={data.incomeChange} />}
              isLoading={isLoading}
            />
            <StatCard
              label="Saídas do mês"
              value={formatCurrency(data.totals.expense)}
              icon={<ArrowDownCircle />}
              tone="expense"
              helper={<ChangeHelper value={data.expenseChange} inverse />}
              isLoading={isLoading}
            />
            <StatCard
              label="Economia do mês"
              value={formatPercent(data.savings)}
              icon={<PiggyBank />}
              tone="goal"
              helper={
                data.totals.income > 0
                  ? `${data.totals.balance >= 0 ? "Sobrou" : "Faltou"} ${formatCurrency(Math.abs(data.totals.balance))}`
                  : "Sem entradas no mês"
              }
              isLoading={isLoading}
            />
          </div>

          {!isLoading && !data.hasAny && (
            <Card className="overflow-hidden border-brand-200 bg-gradient-to-br from-brand-50 to-white">
              <EmptyState
                icon={<Scissors className="text-brand-600" />}
                title="Bem-vindo ao Corta Aí!"
                description="Comece registrando sua primeira entrada ou saída. Em poucos lançamentos você já vai ver seus gráficos aqui."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button onClick={() => open({ type: "entrada" })} leftIcon={<ArrowUpCircle className="size-4" />}>
                      Registrar entrada
                    </Button>
                    <Button variant="outline" onClick={() => open({ type: "saida" })} leftIcon={<ArrowDownCircle className="size-4" />}>
                      Registrar saída
                    </Button>
                  </div>
                }
              />
            </Card>
          )}

          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader
                title="Entradas x Saídas"
                description="Últimos 6 meses"
                icon={<ChartColumn />}
                action={
                  <Link href="/relatorios" className="text-sm font-semibold text-brand-700 hover:underline">
                    Relatórios
                  </Link>
                }
              />
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : data.series.every((p) => p.income === 0 && p.expense === 0) ? (
                  <EmptyState compact icon={<ChartColumn />} title="Sem dados para o gráfico" description="Registre movimentações para ver a comparação mês a mês." />
                ) : (
                  <IncomeExpenseChart data={data.series} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Para onde foi o dinheiro" description="Saídas por categoria no mês" icon={<ReceiptText />} />
              <CardContent>
                {isLoading || categories.status === "loading" ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : data.expensesByCategory.length === 0 ? (
                  <EmptyState compact title="Nenhuma saída no mês" description="Seus gastos por categoria aparecerão aqui." />
                ) : (
                  <CategoryBreakdown slices={data.expensesByCategory} limit={5} />
                )}
              </CardContent>
            </Card>
          </div>

          {topExpense && data.totals.expense > 0 && (
            <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Lightbulb className="size-5" />
              </span>
              <div className="text-sm text-amber-900">
                <p className="font-semibold">Dica do Corta Aí</p>
                <p className="mt-0.5">
                  Sua maior despesa em {formatMonthYear(month).split(" ")[0].toLowerCase()} foi com <strong>{topExpense.name}</strong> (
                  {formatCurrency(topExpense.total)}, {topExpense.percent.toLocaleString("pt-BR")}% das saídas). Se cortar 10% dessa
                  categoria, você economiza <strong>{formatCurrency(Math.round(topExpense.total * 0.1))}</strong> por mês.
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="overflow-hidden xl:col-span-2">
              <CardHeader
                title="Últimas movimentações"
                description={formatMonthYear(month)}
                icon={<ReceiptText />}
                action={
                  <Link href="/historico" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
                    Ver tudo <ArrowRight className="size-4" />
                  </Link>
                }
              />
              <div className="mt-3">
                {isLoading ? (
                  <ListSkeleton rows={4} />
                ) : data.recent.length === 0 ? (
                  <EmptyState
                    compact
                    title="Nenhuma movimentação neste mês"
                    action={
                      <Button size="sm" onClick={() => open()} leftIcon={<Plus className="size-4" />}>
                        Nova movimentação
                      </Button>
                    }
                  />
                ) : (
                  <TransactionList transactions={data.recent} categories={categories.data ?? []} />
                )}
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Metas em andamento"
                icon={<Target />}
                action={
                  <Link href="/metas" className="text-sm font-semibold text-brand-700 hover:underline">
                    Ver metas
                  </Link>
                }
              />
              <CardContent>
                {goals.status === "loading" ? (
                  <div className="space-y-5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-2.5 w-full" />
                      </div>
                    ))}
                  </div>
                ) : goals.status === "error" ? (
                  <ErrorState message={goals.error} onRetry={goals.retry} className="py-6" />
                ) : activeGoals.length === 0 ? (
                  <EmptyState
                    compact
                    icon={<Target />}
                    title="Nenhuma meta em andamento"
                    action={
                      <Link href="/metas" className="text-sm font-semibold text-brand-700 hover:underline">
                        Criar uma meta
                      </Link>
                    }
                  />
                ) : (
                  <ul className="space-y-5">
                    {activeGoals.map((goal) => (
                      <li key={goal.id}>
                        <div className="mb-1.5 flex justify-between gap-2 text-sm">
                          <span className="truncate font-medium text-slate-800">{goal.name}</span>
                          <span className="shrink-0 font-semibold text-slate-600">{goalProgress(goal)}%</span>
                        </div>
                        <ProgressBar value={goalProgress(goal)} color={goal.color} label={goal.name} />
                        <p className="mt-1 text-xs text-slate-500">
                          {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
