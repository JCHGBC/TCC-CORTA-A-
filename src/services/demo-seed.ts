import { doc, Timestamp, writeBatch } from "firebase/firestore";
import { DEFAULT_CATEGORIES, DEMO_ACCOUNT } from "@/config/constants";
import { firestore } from "@/lib/firebase";
import { shiftMonth, toISODate, todayISO } from "@/lib/formatters";
import type { PaymentMethod, TransactionType } from "@/types";
import { userCollection, userDoc } from "./db";

/** Gerador pseudoaleatório com semente fixa: os dados de exemplo são sempre parecidos. */
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** Cria as categorias padrão de um usuário novo (dentro de um lote de gravação). */
export function addDefaultCategories(batch: ReturnType<typeof writeBatch>, uid: string) {
  const now = Timestamp.now();
  const ids: Record<string, string> = {};
  for (const category of DEFAULT_CATEGORIES) {
    const ref = doc(userCollection("categorias", uid));
    ids[category.name] = ref.id;
    batch.set(ref, { nome: category.name, tipo: category.type, cor: category.color, criadoEm: now });
  }
  return ids;
}

/**
 * Preenche a conta de demonstração (demo@cortaai.com / Demo@123) com
 * 6 meses de movimentações e algumas metas, para facilitar a apresentação.
 */
export async function seedDemoAccount(uid: string) {
  const batch = writeBatch(firestore());
  const now = Timestamp.now();
  const category = addDefaultCategories(batch, uid);
  const random = seededRandom(42);
  const today = todayISO();
  const currentMonth = today.slice(0, 7);

  batch.set(userDoc(uid), {
    nome: "Usuário Demonstração",
    email: DEMO_ACCOUNT.email,
    telefone: "(47) 99999-0000",
    criadoEm: now,
  });

  const add = (
    monthKey: string,
    day: number,
    tipo: TransactionType,
    descricao: string,
    categoria: string,
    valor: number,
    formaPagamento: PaymentMethod,
  ) => {
    const [y, m] = monthKey.split("-").map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    const data = toISODate(new Date(y, m - 1, Math.min(day, lastDay)));
    if (data > today) return; // não cria lançamentos no futuro
    batch.set(doc(userCollection("movimentacoes", uid)), {
      tipo,
      descricao,
      valorCentavos: Math.round(valor),
      categoriaId: category[categoria],
      data,
      formaPagamento,
      observacao: null,
      criadoEm: now,
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

  const goals = [
    { nome: "Reserva de emergência", descricao: "Guardar 6 meses de custos fixos.", valorAlvoCentavos: 10_000_00, valorAtualCentavos: 3_450_00, prazo: future(10), cor: "#10b981" },
    { nome: "Viagem para Florianópolis", descricao: "Férias de verão com a família.", valorAlvoCentavos: 2_500_00, valorAtualCentavos: 1_820_00, prazo: future(3), cor: "#0ea5e9" },
    { nome: "Notebook novo", descricao: "Para os estudos e o TCC.", valorAlvoCentavos: 4_000_00, valorAtualCentavos: 4_000_00, prazo: future(1), cor: "#a855f7" },
  ];
  for (const goal of goals) batch.set(doc(userCollection("metas", uid)), { ...goal, criadoEm: now });

  await batch.commit();
}
