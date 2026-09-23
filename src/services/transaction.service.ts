import type { Transaction, TransactionFilters, TransactionInput } from "@/types";
import { request } from "./http";

/**
 * RF-03 (entradas) e RF-04 (saídas).
 * O usuário é identificado pelo token de login: a API só devolve e altera
 * os dados do próprio usuário (RNF-02).
 */
export const transactionService = {
  async list(filters: TransactionFilters = {}): Promise<Transaction[]> {
    return request<Transaction[]>("GET", "/transactions", {
      query: {
        type: filters.type,
        month: filters.month,
        categoryId: filters.categoryId,
        search: filters.search,
      },
    });
  },

  async create(input: TransactionInput): Promise<Transaction> {
    return request<Transaction>("POST", "/transactions", { body: input });
  },

  async update(id: string, input: TransactionInput): Promise<Transaction> {
    return request<Transaction>("PUT", `/transactions/${id}`, { body: input });
  },

  async remove(id: string): Promise<void> {
    await request("DELETE", `/transactions/${id}`);
  },
};
