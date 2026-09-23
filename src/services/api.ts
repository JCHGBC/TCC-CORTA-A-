import { delay } from "@/lib/utils";

/** Erro de regra de negócio exibido diretamente para o usuário. */
export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceError";
  }
}

/**
 * Simula uma chamada à API (latência de rede) para que os estados de
 * "carregando" apareçam na interface exatamente como apareceriam com o back-end real.
 */
export async function simulateRequest<T>(handler: () => T | Promise<T>, latency = 350): Promise<T> {
  await delay(latency);
  return handler();
}
