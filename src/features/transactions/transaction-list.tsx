"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PAYMENT_METHOD_LABEL } from "@/config/constants";
import { useCurrentUser } from "@/features/auth/auth-context";
import { groupByDate } from "@/lib/finance";
import { formatCurrency, formatDate, formatRelativeDay, formatSignedCurrency } from "@/lib/formatters";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { transactionService } from "@/services";
import type { Category, Transaction } from "@/types";
import { useQuickAdd } from "./quick-add";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  /** Agrupa por dia (usado no histórico). */
  groupByDay?: boolean;
  /** Esconde os botões de editar/excluir (ex.: painel). */
  readOnly?: boolean;
}

export function TransactionList({ transactions, categories, groupByDay, readOnly }: TransactionListProps) {
  const user = useCurrentUser();
  const { open } = useQuickAdd();
  const [toDelete, setToDelete] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const findCategory = (id: string) => categories.find((c) => c.id === id);

  async function confirmDelete() {
    if (!toDelete) return;
    setIsDeleting(true);
    try {
      await transactionService.remove(user.id, toDelete.id);
      notify.success("Movimentação excluída.");
      setToDelete(null);
    } catch (error) {
      notify.error(error);
    } finally {
      setIsDeleting(false);
    }
  }

  const renderItem = (t: Transaction) => (
    <TransactionRow
      key={t.id}
      transaction={t}
      category={findCategory(t.categoryId)}
      showDate={!groupByDay}
      readOnly={readOnly}
      onEdit={() => open({ transaction: t })}
      onDelete={() => setToDelete(t)}
    />
  );

  return (
    <>
      {groupByDay ? (
        <div className="divide-y divide-slate-100">
          {groupByDate(transactions).map((group) => (
            <section key={group.date} aria-label={formatDate(group.date)}>
              <div className="flex items-center justify-between bg-slate-50/80 px-5 py-2 text-xs font-semibold text-slate-500">
                <span>
                  {formatRelativeDay(group.date)} · {formatDate(group.date)}
                </span>
                <span className={group.total >= 0 ? "text-income" : "text-expense"}>
                  {group.total >= 0 ? "+" : "-"} {formatCurrency(Math.abs(group.total))}
                </span>
              </div>
              <ul className="divide-y divide-slate-100">{group.items.map(renderItem)}</ul>
            </section>
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">{transactions.map(renderItem)}</ul>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Excluir movimentação?"
        description={
          toDelete
            ? `"${toDelete.description}" de ${formatCurrency(toDelete.amount)} será excluída permanentemente e seu saldo será recalculado.`
            : ""
        }
      />
    </>
  );
}

interface TransactionRowProps {
  transaction: Transaction;
  category?: Category;
  showDate: boolean;
  readOnly?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function TransactionRow({ transaction: t, category, showDate, readOnly, onEdit, onDelete }: TransactionRowProps) {
  const isIncome = t.type === "entrada";
  const color = category?.color ?? "#94a3b8";
  return (
    <li className="group flex items-center gap-3 px-4 py-3.5 sm:px-5 transition-colors hover:bg-slate-50/70">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}1a`, color }}
        aria-hidden
      >
        {isIncome ? <ArrowUpRight className="size-5" /> : <ArrowDownRight className="size-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{t.description}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-slate-500">
          <span>{category?.name ?? "Sem categoria"}</span>
          <span aria-hidden className="hidden sm:inline">
            ·
          </span>
          <span className="hidden sm:inline">{PAYMENT_METHOD_LABEL[t.paymentMethod]}</span>
          {showDate && (
            <>
              <span aria-hidden>·</span>
              <span>{formatDate(t.date)}</span>
            </>
          )}
        </p>
      </div>
      <p className={cn("text-right text-sm font-bold whitespace-nowrap", isIncome ? "text-income" : "text-expense")}>
        {formatSignedCurrency(t.amount, t.type)}
      </p>
      {!readOnly && (
        <div className="-mr-2 flex shrink-0 items-center sm:mr-0 sm:gap-0.5 sm:opacity-60 sm:transition-opacity sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 sm:p-2"
            aria-label={`Editar ${t.description}`}
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 sm:p-2"
            aria-label={`Excluir ${t.description}`}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      )}
    </li>
  );
}
