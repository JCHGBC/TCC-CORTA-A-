import type { Goal, GoalInput } from "@/types";
import { request } from "./http";

/** RF-05 — Definição de metas */
export const goalService = {
  async list(): Promise<Goal[]> {
    return request<Goal[]>("GET", "/goals");
  },

  async create(input: GoalInput): Promise<Goal> {
    return request<Goal>("POST", "/goals", { body: input });
  },

  async update(id: string, input: GoalInput): Promise<Goal> {
    return request<Goal>("PUT", `/goals/${id}`, { body: input });
  },

  /** Guarda (deposit) ou retira (withdraw) dinheiro de uma meta. */
  async move(id: string, operation: "deposit" | "withdraw", amount: number): Promise<Goal> {
    return request<Goal>("POST", `/goals/${id}/move`, { body: { operation, amount } });
  },

  async remove(id: string): Promise<void> {
    await request("DELETE", `/goals/${id}`);
  },
};
