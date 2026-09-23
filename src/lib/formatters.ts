const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formata centavos como moeda brasileira. Ex.: 123456 -> "R$ 1.234,56" */
export function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

/** Formata com sinal. Ex.: entrada -> "+ R$ 10,00", saída -> "- R$ 10,00" */
export function formatSignedCurrency(cents: number, type: "entrada" | "saida") {
  return `${type === "entrada" ? "+" : "-"} ${formatCurrency(Math.abs(cents))}`;
}

export function formatPercent(value: number, digits = 0) {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Converte um Date para "AAAA-MM-DD" usando o fuso horário local. */
export function toISODate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO() {
  return toISODate(new Date());
}

/** "AAAA-MM-DD" -> Date local (sem problemas de fuso). */
export function parseISODate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** "2026-09-23" -> "23/09/2026" */
export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** "2026-09-23" -> "23 de setembro de 2026" */
export function formatDateLong(iso: string) {
  const date = parseISODate(iso);
  return `${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
}

/** "2026-09-23" -> "Hoje", "Ontem" ou "23 de set." */
export function formatRelativeDay(iso: string) {
  const today = todayISO();
  if (iso === today) return "Hoje";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (iso === toISODate(yesterday)) return "Ontem";
  const date = parseISODate(iso);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return `${date.getDate()} de ${MONTHS_SHORT[date.getMonth()]}.${sameYear ? "" : ` de ${date.getFullYear()}`}`;
}

/** Chave de mês "AAAA-MM" a partir de uma data ISO. */
export function toMonthKey(iso: string) {
  return iso.slice(0, 7);
}

export function currentMonthKey() {
  return toMonthKey(todayISO());
}

/** Soma (ou subtrai) meses de uma chave "AAAA-MM". */
export function shiftMonth(monthKey: string, delta: number) {
  const [y, m] = monthKey.split("-").map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

/** "2026-09" -> "Setembro de 2026" */
export function formatMonthYear(monthKey: string) {
  const [y, m] = monthKey.split("-").map(Number);
  const name = MONTHS[m - 1];
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} de ${y}`;
}

/** "2026-09" -> "set/26" */
export function formatMonthShort(monthKey: string) {
  const [y, m] = monthKey.split("-").map(Number);
  return `${MONTHS_SHORT[m - 1]}/${String(y).slice(2)}`;
}

/** Quantidade de dias entre hoje e a data informada (negativo se já passou). */
export function daysUntil(iso: string) {
  const target = parseISODate(iso).getTime();
  const today = parseISODate(todayISO()).getTime();
  return Math.round((target - today) / 86_400_000);
}
