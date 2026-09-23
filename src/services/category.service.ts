import type { Category, CategoryInput, TransactionType } from "@/types";
import { request } from "./http";

/** Categorias = "origem" dos valores de entrada e saída. */
export const categoryService = {
  async list(type?: TransactionType): Promise<Category[]> {
    return request<Category[]>("GET", "/categories", { query: { type } });
  },

  /** Quantidade de movimentações por categoria (id da categoria → total). */
  async usage(): Promise<Record<string, number>> {
    return request<Record<string, number>>("GET", "/categories/usage");
  },

  async create(input: CategoryInput): Promise<Category> {
    return request<Category>("POST", "/categories", { body: input });
  },

  async update(id: string, input: CategoryInput): Promise<Category> {
    return request<Category>("PUT", `/categories/${id}`, { body: input });
  },

  async remove(id: string): Promise<void> {
    await request("DELETE", `/categories/${id}`);
  },
};
