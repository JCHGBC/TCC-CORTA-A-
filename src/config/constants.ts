import type { PaymentMethod, TransactionType } from "@/types";

export const APP_NAME = "Corta Aí";
export const APP_DESCRIPTION =
  "Controle financeiro pessoal simples e visual: registre entradas e saídas, acompanhe seu saldo e alcance suas metas.";

export const DEMO_ACCOUNT = {
  email: "demo@cortaai.com",
  password: "Demo@123",
};

export const TEAM = [
  "Julio Cesar Heinzen",
  "Gabriel Balin Cabral",
  "Enzo Guilherme Janz Frainer",
  "Vinicius dos Reis",
];

export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  entrada: "Entrada",
  saida: "Saída",
};

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "pix", label: "Pix" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "debito", label: "Cartão de débito" },
  { value: "credito", label: "Cartão de crédito" },
  { value: "boleto", label: "Boleto" },
  { value: "transferencia", label: "Transferência" },
];

export const PAYMENT_METHOD_LABEL = Object.fromEntries(
  PAYMENT_METHODS.map((method) => [method.value, method.label]),
) as Record<PaymentMethod, string>;

/** Paleta usada em categorias e metas (mesmo padrão visual em todo o sistema). */
export const COLOR_OPTIONS = [
  "#10b981",
  "#0ea5e9",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#14b8a6",
  "#64748b",
  "#78716c",
];

export const DEFAULT_CATEGORIES: { name: string; type: TransactionType; color: string }[] = [
  { name: "Salário", type: "entrada", color: "#10b981" },
  { name: "Freelance", type: "entrada", color: "#0ea5e9" },
  { name: "Investimentos", type: "entrada", color: "#6366f1" },
  { name: "Presentes", type: "entrada", color: "#ec4899" },
  { name: "Outras entradas", type: "entrada", color: "#64748b" },
  { name: "Alimentação", type: "saida", color: "#f97316" },
  { name: "Moradia", type: "saida", color: "#6366f1" },
  { name: "Transporte", type: "saida", color: "#0ea5e9" },
  { name: "Contas", type: "saida", color: "#eab308" },
  { name: "Saúde", type: "saida", color: "#14b8a6" },
  { name: "Educação", type: "saida", color: "#a855f7" },
  { name: "Lazer", type: "saida", color: "#ec4899" },
  { name: "Compras", type: "saida", color: "#f43f5e" },
  { name: "Outras saídas", type: "saida", color: "#78716c" },
];

/**
 * Cores dos gráficos — validadas para daltonismo (ΔE ≥ 10 entre si)
 * e contraste mínimo de 3:1 contra o fundo branco.
 */
export const CHART_COLORS = {
  income: "#0d9488",
  expense: "#f43f5e",
  balance: "#334155",
  grid: "#e2e8f0",
  axis: "#64748b",
};
