"use client";

import { useMemo, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Download, History, Scale, Search } from "lucide-react";
import { MonthSelector } from "@/components/shared/month-selector";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/misc";
import { Select } from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { calculateTotals, transactionsToCSV } from "@/lib/finance";
import { currentMonthKey, formatCurrency } from "@/lib/formatters";
import { downloadTextFile } from "@/lib/download";
import { notify } from "@/lib/toast";
import type { TransactionType } from "@/types";
import { useCategories, useTransactions } from "./hooks";
import { TransactionList } from "./transaction-list";

type TypeFilter = "todos" | TransactionType;
type PeriodFilter = "mes" | "tudo";

/** Histórico completo de receitas e despesas com filtros. */
export function HistoryView() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("todos");
  const [period, setPeriod] = useState<PeriodFilter>("mes");
  const [month, setMonth] = useState(currentMonthKey);
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const type = typeFilter === "todos" ? undefined : typeFilter;
  const categories = useCategories();
  const transactions = useTransactions({
    type,
    month: period === "mes" ? month : undefined,
    categoryId: categoryId || undefined,
    search: debouncedSearch || undefined,
  });

  const totals = useMemo(() => calculateTotals(transactions.data ?? []), [transactions.data]);
  const categoryOptions = (categories.data ?? [])
    .filter((c) => !type || c.type === type)
    .map((c) => ({ value: c.id, label: `${c.name} (${c.type === "entrada" ? "entrada" : "saída"})` }));
  const filtered = !!categoryId || !!debouncedSearch || typeFilter !== "todos";
  const isLoading = transactions.status === "loading";

  function handleExport() {
    if (!transactions.data?.length) {
      notify.warning("Não há movimentações para exportar.");
      return;
    }
    const csv = transactionsToCSV(transactions.data, categories.data ?? []);
    downloadTextFile(csv, `corta-ai-historico-${period === "mes" ? month : "completo"}.csv`);
    notify.success("Arquivo exportado!", "Abra o arquivo .csv no Excel ou Google Planilhas.");
  }

  function clearFilters() {
    setTypeFilter("todos");
    setCategoryId("");
    setSearch("");
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Histórico"
        description="Consulte todas as suas receitas e despesas em um só lugar."
        actions={
          <Button variant="outline" onClick={handleExport} leftIcon={<Download className="size-4" />} disabled={isLoading}>
            Exportar CSV
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Entradas" value={formatCurrency(totals.income)} icon={<ArrowUpCircle />} tone="income" isLoading={isLoading} />
        <StatCard label="Saídas" value={formatCurrency(totals.expense)} icon={<ArrowDownCircle />} tone="expense" isLoading={isLoading} />
        <StatCard
          label="Resultado do período"
          value={`${totals.balance < 0 ? "-" : ""}${formatCurrency(Math.abs(totals.balance))}`}
          icon={<Scale />}
          tone={totals.balance >= 0 ? "brand" : "expense"}
          isLoading={isLoading}
        />
      </div>

      <Card>
        <div className="space-y-3 border-b border-slate-100 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <SegmentedControl
              ariaLabel="Tipo"
              value={typeFilter}
              onChange={(value) => {
                setTypeFilter(value);
                setCategoryId("");
              }}
              options={[
                { value: "todos", label: "Todos" },
                { value: "entrada", label: "Entradas" },
                { value: "saida", label: "Saídas" },
              ]}
            />
            <div className="flex flex-wrap items-center gap-2">
              <SegmentedControl
                ariaLabel="Período"
                value={period}
                onChange={setPeriod}
                options={[
                  { value: "mes", label: "Por mês" },
                  { value: "tudo", label: "Tudo" },
                ]}
              />
              {period === "mes" && <MonthSelector value={month} onChange={setMonth} />}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              id="history-search"
              type="search"
              placeholder="Buscar pela descrição ou observação..."
              aria-label="Buscar"
              leftIcon={<Search />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              id="history-category"
              aria-label="Filtrar por categoria"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              placeholder="Todas as categorias"
              options={categoryOptions}
            />
          </div>
        </div>

        {isLoading && <ListSkeleton rows={6} />}
        {transactions.status === "error" && <ErrorState message={transactions.error} onRetry={transactions.retry} />}
        {transactions.status === "success" && transactions.data?.length === 0 && (
          <EmptyState
            icon={filtered ? <Search /> : <History />}
            title={filtered ? "Nenhum resultado para os filtros" : "Nenhuma movimentação no período"}
            description={
              filtered
                ? "Tente outra busca ou limpe os filtros."
                : "Quando você registrar entradas e saídas, elas aparecerão aqui."
            }
            action={
              filtered && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              )
            }
          />
        )}
        {transactions.status === "success" && !!transactions.data?.length && (
          <TransactionList transactions={transactions.data} categories={categories.data ?? []} groupByDay />
        )}
      </Card>
    </div>
  );
}
