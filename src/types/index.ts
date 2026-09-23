/**
 * Tipos centrais do domínio do Corta Aí.
 * Valores monetários são sempre armazenados em CENTAVOS (inteiros)
 * para evitar erros de arredondamento com números decimais.
 */

export type TransactionType = "entrada" | "saida";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}



export interface Category {
  id: string;
  userId: string;
  name: string;
  type: TransactionType;
  color: string;
  createdAt: string;
}

export type PaymentMethod =
  | "dinheiro"
  | "pix"
  | "debito"
  | "credito"
  | "boleto"
  | "transferencia";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  description: string;
  /** Valor em centavos (sempre positivo). */
  amount: number;
  categoryId: string;
  /** Data no formato ISO curto: AAAA-MM-DD */
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  /** Valor alvo em centavos. */
  targetAmount: number;
  /** Valor já guardado em centavos. */
  currentAmount: number;
  /** Prazo no formato AAAA-MM-DD */
  deadline: string;
  color: string;
  createdAt: string;
}

export interface TransactionInput {
  type: TransactionType;
  description: string;
  amount: number;
  categoryId: string;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  /** Mês no formato AAAA-MM */
  month?: string;
  categoryId?: string;
  search?: string;
}

export interface GoalInput {
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color: string;
}

export interface CategoryInput {
  name: string;
  type: TransactionType;
  color: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface ProfileInput {
  name: string;
  email: string;
  phone: string;
}

/** Estados visuais possíveis de uma tela/consulta. */
export type AsyncStatus = "loading" | "error" | "success";
