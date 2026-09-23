"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarRange,
  ChartColumn,
  ChartLine,
  Download,
  Flame,
  Scale,
  Table2,
  Tags,
} from "lucide-react";
import { MonthSelector } from "@/components/shared/month-selector";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { SegmentedControl } from "@/components/ui/misc";
import { useCategories, useTransactions } from "@/features/transactions/hooks";
import { downloadTextFile } from "@/lib/download";
import { calculateTotals, groupByCategory, monthlySeries, transactionsToCSV } from "@/lib/finance";
import { currentMonthKey, formatCurrency, formatDate, formatMonthYear, shiftMonth } from "@/lib/formatters";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { BalanceTrendChart, CategoryBreakdown, IncomeExpenseChart } from "./charts";

type Range = "3" | "6" | "12";

function signed(cents: number) {
  return `${cents < 0 ? "-" : ""}${formatCurrency(Math.abs(cents))}`;
}

/** Relatórios: gráficos e resumos por período. */
export function ReportsView() {
  const [endMonth, setEndMonth] = useState(currentMonthKey);
  const [range, setRange] = useState<Range>("6");
  const transactions = useTransactions();
  const categories = useCategories();

  const months = Number(range);
  const startMonth = shiftMonth(endMonth, -(months - 1));

  const report = useMemo(() => {
    const inPeriod = (transactions.data ?? []).filter((t) => {
      const key = t.date.slice(0, 7);
      return key >= startMonth && key <= endMonth;
    });
    const totals = calculateTotals(inPeriod);
    const cats = categories.data ?? [];
    return {
      inPeriod,
      totals,
      averageExpense: Math.round(totals.expense / months),
      series: monthlySeries(transactions.data ?? [], endMonth, months),
      expenses: groupByCategory(inPeriod.filter((t) => t.type === "saida"), cats),
      incomes: groupByCategory(inPeriod.filter((t) => t.type === "entrada"), cats),
      topExpenses: inPeriod
        .filter((t) => t.type === "saida")
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5),
    };
  }, [transactions.data, categories.data, startMonth, endMonth, months]);

  const isLoading = transactions.status === "loading" || categories.status === "loading";
  const periodLabel = `${formatMonthYear(startMonth)} a ${formatMonthYear(endMonth)}`;

  function handleExport() {
    if (report.inPeriod.length === 0) {
      notify.warning("Não há movimentações no período para exportar.");
      return;
    }
    downloadTextFile(transactionsToCSV(report.inPeriod, categories.data ?? []), `corta-ai-relatorio-${startMonth}-a-${endMonth}.csv`);
    notify.success("Relatório exportado!");
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Relatórios"
        description="Entenda seus hábitos financeiros com gráficos e resumos."
        actions={
          <Button variant="outline" onClick={handleExport} disabled={isLoading} leftIcon={<Download className="size-4" />}>
            Exportar CSV
          </Button>
        }
      />

      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <CalendarRange className="size-4.5 text-slate-400" />
          <span>
            Período: <strong className="text-slate-800">{periodLabel}</strong>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            ariaLabel="Quantidade de meses"
            value={range}
            onChange={setRange}
            options={[
              { value: "3", label: "3 meses" },
              { value: "6", label: "6 meses" },
              { value: "12", label: "12 meses" },
            ]}
          />
          <MonthSelector value={endMonth} onChange={setEndMonth} />
        </div>
      </Card>

      {transactions.status === "error" ? (
        <Card>
          <ErrorState message={transactions.error} onRetry={transactions.retry} />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total de entradas" value={formatCurrency(report.totals.income)} icon={<ArrowUpCircle />} tone="income" isLoading={isLoading} />
            <StatCard label="Total de saídas" value={formatCurrency(report.totals.expense)} icon={<ArrowDownCircle />} tone="expense" isLoading={isLoading} />
            <StatCard
              label="Resultado do período"
              value={signed(report.totals.balance)}
              icon={<Scale />}
              tone={report.totals.balance >= 0 ? "brand" : "expense"}
              isLoading={isLoading}
            />
            <StatCard label="Gasto médio mensal" value={formatCurrency(report.averageExpense)} icon={<Flame />} tone="neutral" isLoading={isLoading} />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader title="Entradas x Saídas" description="Comparativo mês a mês" icon={<ChartColumn />} />
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : report.inPeriod.length === 0 ? (
                  <EmptyState compact icon={<ChartColumn />} title="Sem movimentações no período" />
                ) : (
                  <IncomeExpenseChart data={report.series} />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Evolução do resultado" description="Quanto sobrou (ou faltou) em cada mês" icon={<ChartLine />} />
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[290px] w-full" />
                ) : report.inPeriod.length === 0 ? (
                  <EmptyState compact icon={<ChartLine />} title="Sem movimentações no período" />
                ) : (
                  <BalanceTrendChart data={report.series} height={290} />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Saídas por categoria" description={periodLabel} icon={<Tags />} />
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : report.expenses.length === 0 ? (
                  <EmptyState compact title="Nenhuma saída no período" />
                ) : (
                  <CategoryBreakdown slices={report.expenses} />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Entradas por origem" description={periodLabel} icon={<Tags />} />
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : report.incomes.length === 0 ? (
                  <EmptyState compact title="Nenhuma entrada no período" />
                ) : (
                  <CategoryBreakdown slices={report.incomes} />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <Card className="overflow-hidden lg:col-span-3">
              <CardHeader title="Resumo mensal" description="Tabela com os valores de cada mês" icon={<Table2 />} />
              <div className="mt-4 overflow-x-auto">
                {isLoading ? (
                  <div className="space-y-2 p-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : (
                  <table className="w-full min-w-[480px] text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      <tr>
                        <th scope="col" className="px-5 py-3">Mês</th>
                        <th scope="col" className="px-5 py-3 text-right">Entradas</th>
                        <th scope="col" className="px-5 py-3 text-right">Saídas</th>
                        <th scope="col" className="px-5 py-3 text-right">Resultado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...report.series].reverse().map((row) => {
                        const balance = Math.round(row.balance * 100);
                        return (
                          <tr key={row.month} className="hover:bg-slate-50/60">
                            <th scope="row" className="px-5 py-3 text-left font-medium text-slate-700">
                              {formatMonthYear(row.month)}
                            </th>
                            <td className="px-5 py-3 text-right text-slate-700">{formatCurrency(Math.round(row.income * 100))}</td>
                            <td className="px-5 py-3 text-right text-slate-700">{formatCurrency(Math.round(row.expense * 100))}</td>
                            <td className={cn("px-5 py-3 text-right font-semibold", balance >= 0 ? "text-income" : "text-expense")}>
                              {signed(balance)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                      <tr>
                        <th scope="row" className="px-5 py-3 text-left text-slate-800">Total</th>
                        <td className="px-5 py-3 text-right text-slate-800">{formatCurrency(report.totals.income)}</td>
                        <td className="px-5 py-3 text-right text-slate-800">{formatCurrency(report.totals.expense)}</td>
                        <td className={cn("px-5 py-3 text-right", report.totals.balance >= 0 ? "text-income" : "text-expense")}>
                          {signed(report.totals.balance)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader title="Maiores gastos" description="Top 5 saídas do período" icon={<Flame />} />
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : report.topExpenses.length === 0 ? (
                  <EmptyState compact title="Nenhuma saída no período" />
                ) : (
                  <ol className="space-y-3">
                    {report.topExpenses.map((t, index) => (
                      <li key={t.id} className="flex items-center gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-800">{t.description}</p>
                          <p className="text-xs text-slate-500">
                            {categories.data?.find((c) => c.id === t.categoryId)?.name} · {formatDate(t.date)}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-expense">{formatCurrency(t.amount)}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
