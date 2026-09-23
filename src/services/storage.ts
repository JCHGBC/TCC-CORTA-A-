import type { Category, Goal, StoredUser, Transaction } from "@/types";

/**
 * "Banco de dados" local do front-end.
 *
 * Enquanto a API/back-end não estiver pronta, os dados ficam salvos no
 * localStorage do navegador, com a mesma estrutura das tabelas do banco
 * (users, categories, transactions, goals). Os services são a ÚNICA parte
 * do sistema que conversa com este módulo — para trocar por uma API real,
 * basta alterar os services, sem mexer nas telas.
 */

export interface Database {
  version: number;
  seeded: boolean;
  users: StoredUser[];
  categories: Category[];
  transactions: Transaction[];
  goals: Goal[];
}

const DB_KEY = "corta-ai:db";
const SESSION_KEY = "corta-ai:session";
const DB_VERSION = 1;

/** Evento disparado sempre que algum dado muda (RNF-06: atualização imediata). */
export const DATA_CHANGED_EVENT = "corta-ai:data-changed";

function emptyDatabase(): Database {
  return { version: DB_VERSION, seeded: false, users: [], categories: [], transactions: [], goals: [] };
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function readDatabase(): Database {
  if (!isBrowser()) return emptyDatabase();
  const raw = window.localStorage.getItem(DB_KEY);
  if (!raw) return emptyDatabase();
  try {
    const parsed = JSON.parse(raw) as Partial<Database>;
    return { ...emptyDatabase(), ...parsed };
  } catch {
    throw new Error("Não foi possível ler seus dados salvos. Tente limpar o armazenamento do navegador.");
  }
}

export function writeDatabase(db: Database) {
  if (!isBrowser()) return;
  window.localStorage.setItem(DB_KEY, JSON.stringify(db));
  window.dispatchEvent(new Event(DATA_CHANGED_EVENT));
}

/** Lê o banco, aplica uma alteração e salva — como uma "transação" simples. */
export function updateDatabase<T>(mutator: (db: Database) => T): T {
  const db = readDatabase();
  const result = mutator(db);
  writeDatabase(db);
  return result;
}

// ---------------------------------------------------------------- Sessão

interface Session {
  userId: string;
  createdAt: string;
}

export function getSession(): Session | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(SESSION_KEY) ?? window.sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

/** remember = true mantém o login mesmo após fechar o navegador. */
export function saveSession(userId: string, remember: boolean) {
  clearSession();
  const session: Session = { userId, createdAt: new Date().toISOString() };
  const storage = remember ? window.localStorage : window.sessionStorage;
  storage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
}
