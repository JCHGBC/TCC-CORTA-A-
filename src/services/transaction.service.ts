import { normalizeText, generateId } from "@/lib/utils";
import type { Transaction, TransactionFilters, TransactionInput } from "@/types";
import { ServiceError, simulateRequest } from "./api";
import { readDatabase, updateDatabase } from "./storage";

function sortByDateDesc(a: Transaction, b: Transaction) {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.createdAt < b.createdAt ? 1 : -1;
}

/**
 * RF-03 (entradas) e RF-04 (saídas).
 * Todas as operações recebem o userId e só enxergam os dados do próprio
 * usuário (RNF-02 — cada usuário acessa apenas os seus dados).
 */
export const transactionService = {
  async list(userId: string, filters: TransactionFilters = {}): Promise<Transaction[]> {
    return simulateRequest(() => {
      const search = filters.search ? normalizeText(filters.search) : "";
      return readDatabase()
        .transactions.filter((t) => t.userId === userId)
        .filter((t) => !filters.type || t.type === filters.type)
        .filter((t) => !filters.month || t.date.startsWith(filters.month))
        .filter((t) => !filters.categoryId || t.categoryId === filters.categoryId)
        .filter((t) => !search || normalizeText(`${t.description} ${t.notes ?? ""}`).includes(search))
        .sort(sortByDateDesc);
    });
  },

  async create(userId: string, input: TransactionInput): Promise<Transaction> {
    return simulateRequest(() =>
      updateDatabase((db) => {
        const category = db.categories.find((c) => c.id === input.categoryId && c.userId === userId);
        if (!category) throw new ServiceError("Categoria inválida.");
        const transaction: Transaction = {
          id: generateId(),
          userId,
          ...input,
          description: input.description.trim(),
          notes: input.notes?.trim() || undefined,
          createdAt: new Date().toISOString(),
        };
        db.transactions.push(transaction);
        return transaction;
      }),
    );
  },

  async update(userId: string, id: string, input: TransactionInput): Promise<Transaction> {
    return simulateRequest(() =>
      updateDatabase((db) => {
        const index = db.transactions.findIndex((t) => t.id === id && t.userId === userId);
        if (index === -1) throw new ServiceError("Movimentação não encontrada.");
        const updated: Transaction = {
          ...db.transactions[index],
          ...input,
          description: input.description.trim(),
          notes: input.notes?.trim() || undefined,
        };
        db.transactions[index] = updated;
        return updated;
      }),
    );
  },

  async remove(userId: string, id: string): Promise<void> {
    return simulateRequest(() =>
      updateDatabase((db) => {
        const exists = db.transactions.some((t) => t.id === id && t.userId === userId);
        if (!exists) throw new ServiceError("Movimentação não encontrada.");
        db.transactions = db.transactions.filter((t) => t.id !== id);
      }),
    );
  },
};
