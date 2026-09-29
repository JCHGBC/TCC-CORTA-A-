import { FirebaseError } from "firebase/app";

/** Disparado depois de qualquer alteração (RNF-06: telas se atualizam na hora). */
export const DATA_CHANGED_EVENT = "corta-ai:data-changed";
/** Disparado quando a sessão do usuário não é mais válida. */
export const UNAUTHORIZED_EVENT = "corta-ai:unauthorized";

/** Erro com mensagem pronta para mostrar ao usuário. */
export class ServiceError extends Error {
  constructor(
    message: string,
    /** Código do erro (ex.: "auth/email-already-in-use") */
    public readonly code = "",
    /** Erros por campo do formulário, ex.: { email: "E-mail já cadastrado" } */
    public readonly fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

const OFFLINE = "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";

/** Traduz os erros do Firebase para mensagens em português. */
const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/invalid-email": "Digite um e-mail válido.",
  "auth/email-already-in-use": "Já existe uma conta cadastrada com este e-mail.",
  "auth/weak-password": "A senha é muito fraca.",
  "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  "auth/requires-recent-login": "Por segurança, saia e entre novamente antes de fazer isso.",
  "auth/network-request-failed": OFFLINE,
  "auth/operation-not-allowed": "O login por e-mail e senha não está ativado no Firebase.",
  "permission-denied": "Você não tem permissão para acessar estes dados. Entre novamente.",
  unavailable: OFFLINE,
  unauthenticated: "Sessão expirada. Faça login novamente.",
};

export function toServiceError(error: unknown, fallback = "Ocorreu um erro inesperado."): ServiceError {
  if (error instanceof ServiceError) return error;
  if (error instanceof FirebaseError) {
    const message = MESSAGES[error.code] ?? fallback;
    const fields: Record<string, string> = error.code === "auth/email-already-in-use" ? { email: message } : {};
    return new ServiceError(message, error.code, fields);
  }
  return new ServiceError(fallback);
}

/** Executa uma operação do Firebase convertendo os erros para ServiceError. */
export async function run<T>(operation: () => Promise<T>, fallback?: string): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw toServiceError(error, fallback);
  }
}

/** Avisa as telas abertas que os dados mudaram. */
export function notifyDataChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(DATA_CHANGED_EVENT));
}
