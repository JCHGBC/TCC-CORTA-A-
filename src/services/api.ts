/** Erro vindo da API, com mensagem pronta para mostrar ao usuário. */
export class ServiceError extends Error {
  constructor(
    message: string,
    /** Código HTTP (0 = sem conexão com o servidor) */
    public readonly status = 0,
    /** Erros por campo do formulário, ex.: { email: "E-mail já cadastrado" } */
    public readonly fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
