import { DEFAULT_CATEGORIES, DEMO_ACCOUNT } from "@/config/constants";
import { shiftMonth, toISODate, todayISO } from "@/lib/formatters";
import { generateId } from "@/lib/utils";
import type { Category, Goal, PaymentMethod, Transaction } from "@/types";
import { hashPassword } from "./password";
import { readDatabase, writeDatabase } from "./storage";

export function createDefaultCategories(userId: string): Category[] {
  const now = new Date().toISOString();
  return DEFAULT_CATEGORIES.map((category) => ({
    id: generateId(),
    userId,
    createdAt: now,
    ...category,
  }));
}

/** Gerador pseudoaleatório com semente fixa: os dados de exemplo são sempre parecidos. */
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Cria a conta de demonstração (demo@cortaai.com / Demo@123) com
 * 6 meses de movimentações e algumas metas, para facilitar a apresentação.
 */
export async function ensureDemoData() {
  if (readDatabase().seeded) return;
  const passwordHash = await hashPassword(DEMO_ACCOUNT.password);
  // relê após o await para evitar criar os dados duas vezes
  const db = readDatabase();
  if (db.seeded) return;

  const userId = generateId();
  const now = new Date().toISOString();
  const categories = createDefaultCategories(userId);
  const byName = (name: string) => categories.find((c) => c.name === name)!.id;
  const random = seededRandom(42);
  const today = todayISO();
  const currentMonth = today.slice(0, 7);

  const transactions: Transaction[] = [];
  const add = (
    monthKey: string,
    day: number,
    type: Transaction["type"],
    description: string,
    category: string,
    amount: number,
    paymentMethod: PaymentMethod,
  ) => {
    const [y, m] = monthKey.split("-").map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    const date = toISODate(new Date(y, m - 1, Math.min(day, lastDay)));
    if (date > today) return; // não cria lançamentos no futuro
    transactions.push({
      id: generateId(),
      userId,
      type,
      description,
      amount: Math.round(amount),
      categoryId: byName(category),
      date,
      paymentMethod,
      createdAt: now,
    });
  };

  for (let offset = -5; offset <= 0; offset++) {
    const month = shiftMonth(currentMonth, offset);
    const r = () => random();

    add(month, 5, "entrada", "Salário", "Salário", 3_500_00, "transferencia");
    if (r() > 0.4) add(month, 18, "entrada", "Projeto de site", "Freelance", 400_00 + r() * 900_00, "pix");
    if (r() > 0.7) add(month, 25, "entrada", "Rendimento poupança", "Investimentos", 25_00 + r() * 40_00, "transferencia");

    add(month, 10, "saida", "Aluguel", "Moradia", 1_100_00, "boleto");
    add(month, 12, "saida", "Conta de luz", "Contas", 140_00 + r() * 80_00, "boleto");
    add(month, 12, "saida", "Internet", "Contas", 99_90, "debito");
    add(month, 3, "saida", "Mercado do mês", "Alimentação", 480_00 + r() * 220_00, "debito");
    add(month, 17, "saida", "Mercado", "Alimentação", 120_00 + r() * 150_00, "pix");
    add(month, 8, "saida", "Combustível", "Transporte", 180_00 + r() * 90_00, "credito");
    add(month, 21, "saida", "Uber", "Transporte", 25_00 + r() * 40_00, "credito");
    add(month, 14, "saida", "Lanche com amigos", "Lazer", 45_00 + r() * 80_00, "pix");
    if (r() > 0.5) add(month, 22, "saida", "Cinema", "Lazer", 60_00, "credito");
    if (r() > 0.5) add(month, 15, "saida", "Farmácia", "Saúde", 35_00 + r() * 90_00, "debito");
    add(month, 7, "saida", "Curso online", "Educação", 59_90, "credito");
    if (r() > 0.6) add(month, 27, "saida", "Roupa nova", "Compras", 90_00 + r() * 200_00, "credito");
  }

  const future = (months: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return toISODate(date);
  };

  const goals: Goal[] = [
    {
      id: generateId(),
      userId,
      name: "Reserva de emergência",
      description: "Guardar 6 meses de custos fixos.",
      targetAmount: 10_000_00,
      currentAmount: 3_450_00,
      deadline: future(10),
      color: "#10b981",
      createdAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Viagem para Florianópolis",
      description: "Férias de verão com a família.",
      targetAmount: 2_500_00,
      currentAmount: 1_820_00,
      deadline: future(3),
      color: "#0ea5e9",
      createdAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Notebook novo",
      description: "Para os estudos e o TCC.",
      targetAmount: 4_000_00,
      currentAmount: 4_000_00,
      deadline: future(1),
      color: "#a855f7",
      createdAt: now,
    },
  ];

  db.users.push({
    id: userId,
    name: "Usuário Demonstração",
    email: DEMO_ACCOUNT.email,
    phone: "(47) 99999-0000",
    createdAt: now,
    passwordHash,
  });
  db.categories.push(...categories);
  db.transactions.push(...transactions);
  db.goals.push(...goals);
  db.seeded = true;
  writeDatabase(db);
}
