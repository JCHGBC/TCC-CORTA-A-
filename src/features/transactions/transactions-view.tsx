"use client";

import { useMemo, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Hash, Plus, ReceiptText, Search, TrendingUp } from "lucide-react";
import { MonthSelector } from "@/components/shared/month-selector";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { calculateTotals, groupByCategory } from "@/lib/finance";
import { currentMonthKey, formatCurrency, formatMonthYear } from "@/lib/formatters";
import type { TransactionType } from "@/types";
import { useCategories, useTransactions } from "./hooks";
import { useQuickAdd } from "./quick-add";
import { TransactionList } from "./transaction-list";

const COPY = {
  entrada: {
    title: "Entradas",
    description: "Registre os valores que você recebe e acompanhe suas receitas.",
    add: "Nova entrada",
    total: "Total recebido",
    icon: <ArrowUpCircle />,
    tone: "income" as const,
    empty: "Nenhuma entrada neste mês",
    emptyDescription: "Registre seu salário, freelas ou qualquer valor que você recebeu.",
    category: "Origem",
    top: "Maior origem",
  },
  saida: {
    title: "Saídas",
    description: "Registre seus gastos e descubra para onde vai o seu dinheiro.",
    add: "Nova saída",
    total: "Total gasto",
    icon: <ArrowDownCircle />,
    tone: "expense" as const,
    empty: "Nenhuma saída neste mês",
    emptyDescription: "Anote suas despesas para saber exatamente onde dá para cortar.",
    category: "Categoria",
    top: "Maior gasto por categoria",
  },
};

/** Tela de Entradas (RF-03) e Saídas (RF-04) — mesmo componente, tipos diferentes. */
export function TransactionsView({ type }: { type: TransactionType }) {
  const copy = COPY[type];
  const { open } = useQuickAdd();
  const [month, setMonth] = useState(currentMonthKey);
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const categories = useCategories(type);
  // Totais do mês inteiro (sem filtros de busca/categoria)
  const monthData = useTransactions({ type, month });
  const list = useTransactions({ type, month, categoryId: categoryId || undefined, search: debouncedSearch || undefined });

  const totals = useMemo(() => calculateTotals(monthData.data ?? []), [monthData.data]);
  const topCategory = useMemo(
    () => groupByCategory(monthData.data ?? [], categories.data ?? [])[0],
    [monthData.data, categories.data],
  );
  const filtered = !!categoryId || !!debouncedSearch;
  const statsLoading = monthData.status === "loading";

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={copy.title}
        description={copy.description}
        actions={
          <Button onClick={() => open({ type })} leftIcon={<Plus className="size-4" />} variant={type === "entrada" ? "primary" : "danger"}>
            {copy.add}
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label={`${copy.total} em ${formatMonthYear(month).split(" ")[0].toLowerCase()}`}
          value={formatCurrency(type === "entrada" ? totals.income : totals.expense)}
          icon={copy.icon}
          tone={copy.tone}
          isLoading={statsLoading}
        />
        <StatCard
          label="Lançamentos"
          value={String(monthData.data?.length ?? 0)}
          icon={<Hash />}
          helper="no mês selecionado"
          isLoading={statsLoading}
        />
        <StatCard
          label={copy.top}
          value={topCategory ? topCategory.name : "—"}
          icon={<TrendingUp />}
          tone="brand"
          helper={topCategory ? `${formatCurrency(topCategory.total)} · ${topCategory.percent}% do total` : "Sem dados"}
          isLoading={statsLoading || categories.status === "loading"}
        />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-end">
          <MonthSelector value={month} onChange={setMonth} className="self-start lg:self-auto" />
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <Input
              id="search"
              type="search"
              placeholder="Buscar pela descrição..."
              aria-label="Buscar"
              leftIcon={<Search />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              id="category-filter"
              aria-label={`Filtrar por ${copy.category.toLowerCase()}`}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              placeholder={`Todas as ${copy.category === "Origem" ? "origens" : "categorias"}`}
              options={(categories.data ?? []).map((c) => ({ value: c.id, label: c.name }))}
            />
          </div>
        </div>

        {list.status === "loading" && <ListSkeleton />}
        {list.status === "error" && <ErrorState message={list.error} onRetry={list.retry} />}
        {list.status === "success" && list.data?.length === 0 && (
          <EmptyState
            icon={filtered ? <Search /> : <ReceiptText />}
            title={filtered ? "Nada encontrado" : copy.empty}
            description={filtered ? "Tente mudar a busca ou o filtro selecionado." : copy.emptyDescription}
            action={
              filtered ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setCategoryId("");
                  }}
                >
                  Limpar filtros
                </Button>
              ) : (
                <Button size="sm" onClick={() => open({ type })} leftIcon={<Plus className="size-4" />}>
                  {copy.add}
                </Button>
              )
            }
          />
        )}
        {list.status === "success" && !!list.data?.length && (
          <>
            <TransactionList transactions={list.data} categories={categories.data ?? []} />
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm">
              <span className="text-slate-500">
                {list.data.length} {list.data.length === 1 ? "lançamento" : "lançamentos"}
                {filtered && " (filtrado)"}
              </span>
              <span className={type === "entrada" ? "font-bold text-income" : "font-bold text-expense"}>
                {formatCurrency(list.data.reduce((sum, t) => sum + t.amount, 0))}
              </span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
