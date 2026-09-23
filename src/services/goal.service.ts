import { generateId } from "@/lib/utils";
import type { Goal, GoalInput } from "@/types";
import { ServiceError, simulateRequest } from "./api";
import { readDatabase, updateDatabase } from "./storage";

/** RF-05 — Definição de metas */
export const goalService = {
  async list(userId: string): Promise<Goal[]> {
    return simulateRequest(() =>
      readDatabase()
        .goals.filter((g) => g.userId === userId)
        .sort((a, b) => (a.deadline < b.deadline ? -1 : 1)),
    );
  },

  async create(userId: string, input: GoalInput): Promise<Goal> {
    return simulateRequest(() =>
      updateDatabase((db) => {
        const goal: Goal = {
          id: generateId(),
          userId,
          ...input,
          name: input.name.trim(),
          description: input.description?.trim() || undefined,
          createdAt: new Date().toISOString(),
        };
        db.goals.push(goal);
        return goal;
      }),
    );
  },

  async update(userId: string, id: string, input: GoalInput): Promise<Goal> {
    return simulateRequest(() =>
      updateDatabase((db) => {
        const index = db.goals.findIndex((g) => g.id === id && g.userId === userId);
        if (index === -1) throw new ServiceError("Meta não encontrada.");
        const updated: Goal = {
          ...db.goals[index],
          ...input,
          name: input.name.trim(),
          description: input.description?.trim() || undefined,
        };
        db.goals[index] = updated;
        return updated;
      }),
    );
  },

  /** Guarda (deposit) ou retira (withdraw) dinheiro de uma meta. */
  async move(userId: string, id: string, operation: "deposit" | "withdraw", amount: number): Promise<Goal> {
    return simulateRequest(() =>
      updateDatabase((db) => {
        const goal = db.goals.find((g) => g.id === id && g.userId === userId);
        if (!goal) throw new ServiceError("Meta não encontrada.");
        if (operation === "withdraw" && amount > goal.currentAmount) {
          throw new ServiceError("Você não pode retirar mais do que já foi guardado nesta meta.");
        }
        goal.currentAmount += operation === "deposit" ? amount : -amount;
        return { ...goal };
      }),
    );
  },

  async remove(userId: string, id: string): Promise<void> {
    return simulateRequest(() =>
      updateDatabase((db) => {
        if (!db.goals.some((g) => g.id === id && g.userId === userId)) {
          throw new ServiceError("Meta não encontrada.");
        }
        db.goals = db.goals.filter((g) => g.id !== id);
      }),
    );
  },
};
