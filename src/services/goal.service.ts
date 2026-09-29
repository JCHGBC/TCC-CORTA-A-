import { addDoc, deleteDoc, doc, getDoc, getDocs, runTransaction, Timestamp, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import type { Goal, GoalInput } from "@/types";
import { notifyDataChanged, run, ServiceError } from "./api";
import { currentUid, toISO, userCollection, type Data } from "./db";

function toGoal(id: string, d: Data, uid: string): Goal {
  return {
    id,
    userId: uid,
    name: d.nome,
    description: d.descricao || undefined,
    targetAmount: d.valorAlvoCentavos,
    currentAmount: d.valorAtualCentavos,
    deadline: d.prazo,
    color: d.cor,
    createdAt: toISO(d.criadoEm),
  };
}

function toDocument(input: GoalInput) {
  if (input.currentAmount > input.targetAmount) {
    throw new ServiceError("O valor guardado não pode ser maior que o valor da meta.");
  }
  return {
    nome: input.name.trim(),
    descricao: input.description?.trim() || null,
    valorAlvoCentavos: Math.round(input.targetAmount),
    valorAtualCentavos: Math.round(input.currentAmount),
    prazo: input.deadline, // "AAAA-MM-DD"
    cor: input.color,
  };
}

/** RF-05 — Definição de metas */
export const goalService = {
  async list(): Promise<Goal[]> {
    return run(async () => {
      const uid = currentUid();
      const snapshot = await getDocs(userCollection("metas", uid));
      return snapshot.docs.map((d) => toGoal(d.id, d.data(), uid)).sort((a, b) => (a.deadline < b.deadline ? -1 : 1));
    }, "Não foi possível carregar as metas.");
  },

  async create(input: GoalInput): Promise<Goal> {
    return run(async () => {
      const data = { ...toDocument(input), criadoEm: Timestamp.now() };
      const ref = await addDoc(userCollection("metas"), data);
      notifyDataChanged();
      return toGoal(ref.id, data, currentUid());
    }, "Não foi possível salvar a meta.");
  },

  async update(id: string, input: GoalInput): Promise<Goal> {
    return run(async () => {
      const ref = doc(userCollection("metas"), id);
      const current = await getDoc(ref);
      if (!current.exists()) throw new ServiceError("Meta não encontrada.");
      await updateDoc(ref, toDocument(input));
      notifyDataChanged();
      return toGoal(id, { ...current.data(), ...toDocument(input) }, currentUid());
    }, "Não foi possível salvar a meta.");
  },

  /** Guarda (deposit) ou retira (withdraw) dinheiro de uma meta. */
  async move(id: string, operation: "deposit" | "withdraw", amount: number): Promise<Goal> {
    return run(async () => {
      const uid = currentUid();
      const ref = doc(userCollection("metas", uid), id);
      // Transação: lê e grava de forma segura, mesmo com duas operações ao mesmo tempo
      const updated = await runTransaction(firestore(), async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new ServiceError("Meta não encontrada.");
        const current = snap.data().valorAtualCentavos as number;
        if (operation === "withdraw" && amount > current) {
          throw new ServiceError("Você não pode retirar mais do que já foi guardado nesta meta.");
        }
        const valorAtualCentavos = current + (operation === "deposit" ? amount : -amount);
        tx.update(ref, { valorAtualCentavos });
        return { ...snap.data(), valorAtualCentavos };
      });
      notifyDataChanged();
      return toGoal(id, updated, uid);
    }, "Não foi possível atualizar a meta.");
  },

  async remove(id: string): Promise<void> {
    return run(async () => {
      await deleteDoc(doc(userCollection("metas"), id));
      notifyDataChanged();
    }, "Não foi possível excluir a meta.");
  },
};
