import type { ChangeEvent } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { formatCurrency } from "./formatters";

/**
 * Máscaras de entrada.
 * Todas recebem o texto digitado e devolvem o texto formatado.
 */

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

/** Moeda: "123456" -> "R$ 1.234,56" (digitação da direita para a esquerda, como em caixas eletrônicos). */
export function maskCurrency(value: string) {
  const digits = onlyDigits(value).replace(/^0+/, "").slice(0, 12);
  if (!digits) return "";
  return formatCurrency(Number(digits));
}

/** Converte o texto mascarado de volta para centavos. "R$ 1.234,56" -> 123456 */
export function parseCurrency(masked: string) {
  const digits = onlyDigits(masked);
  return digits ? Number(digits) : 0;
}

/** Centavos -> texto mascarado para preencher formulários de edição. */
export function centsToMasked(cents: number) {
  return cents > 0 ? formatCurrency(cents) : "";
}

/** Telefone: "47999998888" -> "(47) 99999-8888" (aceita fixo com 8 dígitos). */
export function maskPhone(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Data: "23092026" -> "23/09/2026" */
export function maskDate(value: string) {
  const d = onlyDigits(value).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/**
 * Aplica uma máscara a um campo registrado pelo react-hook-form.
 * Uso: <Input {...withMask(register("valor"), maskCurrency)} />
 */
export function withMask<T extends UseFormRegisterReturn>(field: T, mask: (value: string) => string): T {
  return {
    ...field,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      event.target.value = mask(event.target.value);
      return field.onChange(event);
    },
  };
}
