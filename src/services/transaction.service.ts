import { addDoc, deleteDoc, doc, getDoc, getDocs, Timestamp, updateDoc } from "firebase/firestore";
import { normalizeText } from "@/lib/utils";
import type { PaymentMethod, Transaction, TransactionFilters, TransactionInput, TransactionType } from "@/types";
import { notifyDataChanged, run, ServiceError } from "./api";
import { currentUid, toISO, userCollection, type Data } from "./db";

/** Documento do Firestore (campos em português) → objeto usado nas telas. */
function toTransaction(id: string, d: Data, uid: string): Transaction {
  return {
    id,
    userId: uid,
    type: d.tipo as TransactionType,
    description: d.descricao,
    amount: d.valorCentavos,
    categoryId: d.categoriaId,
    date: d.data,
    paymentMethod: d.formaPagamento as PaymentMethod,
    notes: d.observacao || undefined,
    createdAt: toISO(d.criadoEm),
  };
}

function toDocument(input: TransactionInput) {
  return {
    tipo: input.type,
    descricao: input.description.trim(),
    valorCentavos: Math.round(input.amount),
    categoriaId: input.categoryId,
    data: input.date, // "AAAA-MM-DD"
    formaPagamento: input.paymentMethod,
    observacao: input.notes?.trim() || null,
  };
}

/** A categoria precisa existir e ser do mesmo tipo (entrada/saída). */
async function assertCategory(input: TransactionInput) {
  const category = await getDoc(doc(userCollection("categorias"), input.categoryId));
  if (!category.exists() || category.data().tipo !== input.type) {
    throw new ServiceError("Categoria inválida.", "invalid-category", { categoryId: "Categoria inválida." });
  }
}

/** RF-03 (entradas) e RF-04 (saídas). */
export const transactionService = {
  async list(filters: TransactionFilters = {}): Promise<Transaction[]> {
    return run(async () => {
      const uid = currentUid();
      const snapshot = await getDocs(userCollection("movimentacoes", uid));
      const search = filters.search ? normalizeText(filters.search) : "";
      return snapshot.docs
        .map((d) => toTransaction(d.id, d.data(), uid))
        .filter((t) => !filters.type || t.type === filters.type)
        .filter((t) => !filters.month || t.date.startsWith(filters.month))
        .filter((t) => !filters.categoryId || t.categoryId === filters.categoryId)
        .filter((t) => !search || normalizeText(`${t.description} ${t.notes ?? ""}`).includes(search))
        .sort((a, b) => (a.date !== b.date ? (a.date < b.date ? 1 : -1) : a.createdAt < b.createdAt ? 1 : -1));
    }, "Não foi possível carregar as movimentações.");
  },

  async create(input: TransactionInput): Promise<Transaction> {
    return run(async () => {
      await assertCategory(input);
      const data = { ...toDocument(input), criadoEm: Timestamp.now() };
      const ref = await addDoc(userCollection("movimentacoes"), data);
      notifyDataChanged();
      return toTransaction(ref.id, data, currentUid());
    }, "Não foi possível salvar a movimentação.");
  },

  async update(id: string, input: TransactionInput): Promise<Transaction> {
    return run(async () => {
      const ref = doc(userCollection("movimentacoes"), id);
      const current = await getDoc(ref);
      if (!current.exists()) throw new ServiceError("Movimentação não encontrada.");
      await assertCategory(input);
      await updateDoc(ref, toDocument(input));
      notifyDataChanged();
      return toTransaction(id, { ...current.data(), ...toDocument(input) }, currentUid());
    }, "Não foi possível salvar a movimentação.");
  },

  async remove(id: string): Promise<void> {
    return run(async () => {
      await deleteDoc(doc(userCollection("movimentacoes"), id));
      notifyDataChanged();
    }, "Não foi possível excluir a movimentação.");
  },
};
