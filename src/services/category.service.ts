import { generateId, normalizeText } from "@/lib/utils";
import type { Category, CategoryInput, TransactionType } from "@/types";
import { ServiceError, simulateRequest } from "./api";
import { readDatabase, updateDatabase, type Database } from "./storage";

function assertUniqueName(db: Database, userId: string, input: CategoryInput, ignoreId?: string) {
  const name = normalizeText(input.name);
  const duplicated = db.categories.some(
    (c) => c.userId === userId && c.type === input.type && c.id !== ignoreId && normalizeText(c.name) === name,
  );
  if (duplicated) throw new ServiceError("Já existe uma categoria com este nome.");
}

/** Categorias = "origem" dos valores de entrada e saída. */
export const categoryService = {
  async list(userId: string, type?: TransactionType): Promise<Category[]> {
    return simulateRequest(
      () =>
        readDatabase()
          .categories.filter((c) => c.userId === userId && (!type || c.type === type))
          .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
      250,
    );
  },

  /** Quantidade de movimentações por categoria (para mostrar na tela de categorias). */
  async usage(userId: string): Promise<Record<string, number>> {
    return simulateRequest(() => {
      const usage: Record<string, number> = {};
      for (const t of readDatabase().transactions) {
        if (t.userId === userId) usage[t.categoryId] = (usage[t.categoryId] ?? 0) + 1;
      }
      return usage;
    }, 250);
  },

  async create(userId: string, input: CategoryInput): Promise<Category> {
    return simulateRequest(() =>
      updateDatabase((db) => {
        assertUniqueName(db, userId, input);
        const category: Category = {
          id: generateId(),
          userId,
          name: input.name.trim(),
          type: input.type,
          color: input.color,
          createdAt: new Date().toISOString(),
        };
        db.categories.push(category);
        return category;
      }),
    );
  },

  async update(userId: string, id: string, input: CategoryInput): Promise<Category> {
    return simulateRequest(() =>
      updateDatabase((db) => {
        const category = db.categories.find((c) => c.id === id && c.userId === userId);
        if (!category) throw new ServiceError("Categoria não encontrada.");
        if (category.type !== input.type && db.transactions.some((t) => t.categoryId === id)) {
          throw new ServiceError("Não é possível mudar o tipo de uma categoria que já possui movimentações.");
        }
        assertUniqueName(db, userId, input, id);
        category.name = input.name.trim();
        category.type = input.type;
        category.color = input.color;
        return { ...category };
      }),
    );
  },

  async remove(userId: string, id: string): Promise<void> {
    return simulateRequest(() =>
      updateDatabase((db) => {
        const category = db.categories.find((c) => c.id === id && c.userId === userId);
        if (!category) throw new ServiceError("Categoria não encontrada.");
        const inUse = db.transactions.filter((t) => t.categoryId === id).length;
        if (inUse > 0) {
          throw new ServiceError(
            `Esta categoria possui ${inUse} movimentaç${inUse === 1 ? "ão" : "ões"} e não pode ser excluída.`,
          );
        }
        db.categories = db.categories.filter((c) => c.id !== id);
      }),
    );
  },
};
