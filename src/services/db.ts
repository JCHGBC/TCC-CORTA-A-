import { collection, doc, Timestamp, type DocumentData } from "firebase/firestore";
import { firebaseAuth, firestore } from "@/lib/firebase";
import { ServiceError, UNAUTHORIZED_EVENT } from "./api";

/**
 * Estrutura do banco no Firestore:
 *
 *   usuarios/{uid}                         dados do usuário
 *   usuarios/{uid}/categorias/{id}         origem das entradas / destino das saídas
 *   usuarios/{uid}/movimentacoes/{id}      entradas e saídas
 *   usuarios/{uid}/metas/{id}              metas financeiras
 *
 * Cada usuário só acessa o próprio documento e as subcoleções dele (firestore.rules).
 */

export type Subcollection = "categorias" | "movimentacoes" | "metas";

/** uid do usuário logado (ou erro, se a sessão acabou). */
export function currentUid(): string {
  const uid = firebaseAuth().currentUser?.uid;
  if (!uid) {
    if (typeof window !== "undefined") window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    throw new ServiceError("Sessão expirada. Faça login novamente.", "unauthenticated");
  }
  return uid;
}

export function userDoc(uid = currentUid()) {
  return doc(firestore(), "usuarios", uid);
}

export function userCollection(name: Subcollection, uid = currentUid()) {
  return collection(firestore(), "usuarios", uid, name);
}

/** Timestamp do Firestore → texto ISO usado nas telas. */
export function toISO(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  return typeof value === "string" ? value : new Date().toISOString();
}

export type Data = DocumentData;
