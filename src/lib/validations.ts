import { z } from "zod";
import { onlyDigits, parseCurrency } from "./masks";

/**
 * Regras de validação dos formulários (usadas com react-hook-form + zod).
 * Os campos são mantidos como texto no formulário e convertidos no envio.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const emailField = z
  .string()
  .trim()
  .min(1, "Informe seu e-mail.")
  .regex(EMAIL_REGEX, "Digite um e-mail válido. Ex.: nome@email.com");

const nameField = z
  .string()
  .trim()
  .min(3, "O nome deve ter pelo menos 3 caracteres.")
  .max(80, "O nome deve ter no máximo 80 caracteres.")
  .regex(/^[A-Za-zÀ-ÿ\s'.-]+$/, "O nome deve conter apenas letras.");

const phoneField = z
  .string()
  .trim()
  .refine((value) => {
    const digits = onlyDigits(value).length;
    return digits === 10 || digits === 11;
  }, "Informe um telefone válido com DDD. Ex.: (47) 99999-8888");

export const passwordRules = [
  { id: "length", label: "Pelo menos 8 caracteres", test: (v: string) => v.length >= 8 },
  { id: "letter", label: "Uma letra", test: (v: string) => /[A-Za-z]/.test(v) },
  { id: "number", label: "Um número", test: (v: string) => /\d/.test(v) },
  { id: "special", label: "Um caractere especial (recomendado)", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

const passwordField = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .max(64, "A senha deve ter no máximo 64 caracteres.")
  .regex(/[A-Za-z]/, "A senha deve conter pelo menos uma letra.")
  .regex(/\d/, "A senha deve conter pelo menos um número.");

const moneyField = (label: string) =>
  z
    .string()
    .min(1, `Informe ${label}.`)
    .refine((value) => parseCurrency(value) > 0, `${label.charAt(0).toUpperCase()}${label.slice(1)} deve ser maior que zero.`)
    .refine((value) => parseCurrency(value) <= 99_999_999_99, "Valor muito alto.");

const dateField = z.string().min(1, "Informe a data.").regex(ISO_DATE_REGEX, "Data inválida.");

// ---------------------------------------------------------------- Autenticação

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Informe sua senha."),
  remember: z.boolean(),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: nameField,
    email: emailField,
    phone: phoneField,
    password: passwordField,
    confirmPassword: z.string().min(1, "Confirme sua senha."),
    acceptTerms: z.boolean().refine((value) => value, "Você precisa aceitar os termos de uso."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não conferem.",
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const recoverPasswordSchema = z.object({
  email: emailField,
});
export type RecoverPasswordFormValues = z.infer<typeof recoverPasswordSchema>;

// ---------------------------------------------------------------- Perfil

export const profileSchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
});
export type ProfileFormValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe sua senha atual."),
    newPassword: passwordField,
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não conferem.",
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    path: ["newPassword"],
    message: "A nova senha deve ser diferente da atual.",
  });
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

// ---------------------------------------------------------------- Movimentações

export const transactionSchema = z.object({
  description: z
    .string()
    .trim()
    .min(2, "A descrição deve ter pelo menos 2 caracteres.")
    .max(60, "A descrição deve ter no máximo 60 caracteres."),
  amount: moneyField("o valor"),
  categoryId: z.string().min(1, "Selecione a origem/categoria."),
  date: dateField,
  paymentMethod: z.string().min(1, "Selecione a forma de pagamento."),
  notes: z.string().max(200, "A observação deve ter no máximo 200 caracteres."),
});
export type TransactionFormValues = z.infer<typeof transactionSchema>;

// ---------------------------------------------------------------- Metas

export const goalSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "O nome da meta deve ter pelo menos 2 caracteres.")
      .max(40, "O nome da meta deve ter no máximo 40 caracteres."),
    description: z.string().max(120, "A descrição deve ter no máximo 120 caracteres."),
    targetAmount: moneyField("o valor da meta"),
    currentAmount: z.string(),
    deadline: dateField,
    color: z.string().min(1, "Escolha uma cor."),
  })
  .refine((data) => parseCurrency(data.currentAmount) <= parseCurrency(data.targetAmount), {
    path: ["currentAmount"],
    message: "O valor guardado não pode ser maior que o valor da meta.",
  });
export type GoalFormValues = z.infer<typeof goalSchema>;

export const goalMovementSchema = z.object({
  operation: z.enum(["deposit", "withdraw"]),
  amount: moneyField("o valor"),
});
export type GoalMovementFormValues = z.infer<typeof goalMovementSchema>;

// ---------------------------------------------------------------- Categorias

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(30, "O nome deve ter no máximo 30 caracteres."),
  type: z.enum(["entrada", "saida"]),
  color: z.string().min(1, "Escolha uma cor."),
});
export type CategoryFormValues = z.infer<typeof categorySchema>;
