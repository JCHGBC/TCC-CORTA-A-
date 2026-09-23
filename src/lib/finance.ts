import type { Category, Goal, Transaction } from "@/types";
import { formatMonthShort, shiftMonth } from "./formatters";

/**
 * Cálculos financeiros puros (sem acesso a dados).
 * Usados pelo painel e pelos relatórios.
 */

export interface Totals {
  income: number;
  expense: number;
  balance: number;
}

export function calculateTotals(transactions: Transaction[]): Totals {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.type === "entrada") income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, balance: income - expense };
}

/** Porcentagem da renda que sobrou no período (taxa de economia). */
export function savingsRate({ income, balance }: Totals) {
  if (income <= 0) return 0;
  return Math.round((balance / income) * 100);
}

/** Variação percentual entre dois valores (ex.: gastos deste mês x mês passado). */
export function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

export interface CategorySlice {
  categoryId: string;
  name: string;
  color: string;
  total: number;
  count: number;
  percent: number;
}

export function groupByCategory(transactions: Transaction[], categories: Category[]): CategorySlice[] {
  const map = new Map<string, { total: number; count: number }>();
  for (const t of transactions) {
    const current = map.get(t.categoryId) ?? { total: 0, count: 0 };
    current.total += t.amount;
    current.count += 1;
    map.set(t.categoryId, current);
  }
  const grandTotal = [...map.values()].reduce((sum, item) => sum + item.total, 0);
  return [...map.entries()]
    .map(([categoryId, { total, count }]) => {
      const category = categories.find((c) => c.id === categoryId);
      return {
        categoryId,
        name: category?.name ?? "Sem categoria",
        color: category?.color ?? "#94a3b8",
        total,
        count,
        percent: grandTotal ? Math.round((total / grandTotal) * 1000) / 10 : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export interface MonthlyPoint {
  month: string;
  label: string;
  income: number;
  expense: number;
  balance: number;
}

/** Série mensal (últimos N meses até endMonth) para os gráficos. Valores em REAIS. */
export function monthlySeries(transactions: Transaction[], endMonth: string, months = 6): MonthlyPoint[] {
  const points: MonthlyPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const month = shiftMonth(endMonth, -i);
    const totals = calculateTotals(transactions.filter((t) => t.date.startsWith(month)));
    points.push({
      month,
      label: formatMonthShort(month),
      income: totals.income / 100,
      expense: totals.expense / 100,
      balance: totals.balance / 100,
    });
  }
  return points;
}

/** Soma acumulada de todas as movimentações até o fim do mês informado. */
export function balanceUntil(transactions: Transaction[], monthKey: string) {
  return calculateTotals(transactions.filter((t) => t.date.slice(0, 7) <= monthKey)).balance;
}

export function goalProgress(goal: Goal) {
  if (goal.targetAmount <= 0) return 0;
  return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
}

export function isGoalCompleted(goal: Goal) {
  return goal.currentAmount >= goal.targetAmount;
}

/** Agrupa movimentações por data (para listas do histórico). */
export function groupByDate(transactions: Transaction[]) {
  const groups: { date: string; items: Transaction[]; total: number }[] = [];
  for (const t of transactions) {
    let group = groups.find((g) => g.date === t.date);
    if (!group) {
      group = { date: t.date, items: [], total: 0 };
      groups.push(group);
    }
    group.items.push(t);
    group.total += t.type === "entrada" ? t.amount : -t.amount;
  }
  return groups;
}

/** Gera um CSV (abre no Excel) com as movimentações — base para exportação de relatórios. */
export function transactionsToCSV(transactions: Transaction[], categories: Category[]) {
  const header = ["Data", "Tipo", "Descrição", "Categoria", "Valor (R$)"];
  const rows = transactions.map((t) => [
    t.date.split("-").reverse().join("/"),
    t.type === "entrada" ? "Entrada" : "Saída",
    `"${t.description.replace(/"/g, '""')}"`,
    categories.find((c) => c.id === t.categoryId)?.name ?? "",
    ((t.type === "entrada" ? 1 : -1) * t.amount / 100).toFixed(2).replace(".", ","),
  ]);
  return [header, ...rows].map((row) => row.join(";")).join("\n");
}
