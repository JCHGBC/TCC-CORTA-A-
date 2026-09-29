import { addDoc, deleteDoc, doc, getDoc, getDocs, Timestamp, updateDoc } from "firebase/firestore";
import { normalizeText } from "@/lib/utils";
import type { Category, CategoryInput, TransactionType } from "@/types";
import { notifyDataChanged, run, ServiceError } from "./api";
import { currentUid, toISO, userCollection, type Data } from "./db";

function toCategory(id: string, d: Data, uid: string): Category {
  return { id, userId: uid, name: d.nome, type: d.tipo, color: d.cor, createdAt: toISO(d.criadoEm) };
}

async function loadAll(uid: string) {
  const snapshot = await getDocs(userCollection("categorias", uid));
  return snapshot.docs.map((d) => toCategory(d.id, d.data(), uid));
}

/** Quantas movimentações usam cada categoria. */
async function countUsage(uid: string) {
  const snapshot = await getDocs(userCollection("movimentacoes", uid));
  const usage: Record<string, number> = {};
  for (const d of snapshot.docs) {
    const id = d.data().categoriaId as string;
    usage[id] = (usage[id] ?? 0) + 1;
  }
  return usage;
}

function assertUniqueName(all: Category[], input: CategoryInput, ignoreId?: string) {
  const name = normalizeText(input.name);
  if (all.some((c) => c.type === input.type && c.id !== ignoreId && normalizeText(c.name) === name)) {
    throw new ServiceError("Já existe uma categoria com este nome.", "duplicated", { name: "Já existe uma categoria com este nome." });
  }
}

/** Categorias = "origem" dos valores de entrada e saída. */
export const categoryService = {
  async list(type?: TransactionType): Promise<Category[]> {
    return run(async () => {
      const all = await loadAll(currentUid());
      return all.filter((c) => !type || c.type === type).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    }, "Não foi possível carregar as categorias.");
  },

  async usage(): Promise<Record<string, number>> {
    return run(() => countUsage(currentUid()), "Não foi possível carregar as categorias.");
  },

  async create(input: CategoryInput): Promise<Category> {
    return run(async () => {
      const uid = currentUid();
      assertUniqueName(await loadAll(uid), input);
      const data = { nome: input.name.trim(), tipo: input.type, cor: input.color, criadoEm: Timestamp.now() };
      const ref = await addDoc(userCollection("categorias", uid), data);
      notifyDataChanged();
      return toCategory(ref.id, data, uid);
    }, "Não foi possível salvar a categoria.");
  },

  async update(id: string, input: CategoryInput): Promise<Category> {
    return run(async () => {
      const uid = currentUid();
      const ref = doc(userCollection("categorias", uid), id);
      const current = await getDoc(ref);
      if (!current.exists()) throw new ServiceError("Categoria não encontrada.");
      if (current.data().tipo !== input.type && ((await countUsage(uid))[id] ?? 0) > 0) {
        throw new ServiceError("Não é possível mudar o tipo de uma categoria que já possui movimentações.");
      }
      assertUniqueName(await loadAll(uid), input, id);
      const data = { nome: input.name.trim(), tipo: input.type, cor: input.color };
      await updateDoc(ref, data);
      notifyDataChanged();
      return toCategory(id, { ...current.data(), ...data }, uid);
    }, "Não foi possível salvar a categoria.");
  },

  async remove(id: string): Promise<void> {
    return run(async () => {
      const uid = currentUid();
      const inUse = (await countUsage(uid))[id] ?? 0;
      if (inUse > 0) {
        throw new ServiceError(`Esta categoria possui ${inUse} movimentaç${inUse === 1 ? "ão" : "ões"} e não pode ser excluída.`);
      }
      await deleteDoc(doc(userCollection("categorias", uid), id));
      notifyDataChanged();
    }, "Não foi possível excluir a categoria.");
  },
};
