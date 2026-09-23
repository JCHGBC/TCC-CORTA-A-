import { ServiceError } from "./api";

/**
 * Comunicação com a API em PHP.
 *
 * As chamadas vão para "/api/..." no próprio Next.js, que repassa para o
 * servidor PHP (ver "rewrites" em next.config.ts). Assim o navegador não
 * precisa lidar com CORS.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const TOKEN_KEY = "corta-ai:token";

/** Disparado depois de qualquer alteração (RNF-06: telas se atualizam na hora). */
export const DATA_CHANGED_EVENT = "corta-ai:data-changed";
/** Disparado quando o token de login expira ou é inválido. */
export const UNAUTHORIZED_EVENT = "corta-ai:unauthorized";

const OFFLINE_MESSAGE = "Não foi possível conectar ao servidor. Verifique se a API (PHP) e o MySQL estão ligados.";

/** Onde o token de login fica guardado no navegador. */
export const tokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY) ?? window.sessionStorage.getItem(TOKEN_KEY);
  },
  /** remember = true mantém o login mesmo depois de fechar o navegador. */
  save(token: string, remember: boolean) {
    this.clear();
    (remember ? window.localStorage : window.sessionStorage).setItem(TOKEN_KEY, token);
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(TOKEN_KEY);
  },
};

type Method = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  query?: Record<string, string | undefined>;
  body?: unknown;
}

export async function request<T>(method: Method, path: string, { query, body }: RequestOptions = {}): Promise<T> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") params.set(key, value);
  }
  const url = `${API_BASE}${path}${params.toString() ? `?${params}` : ""}`;

  const token = tokenStorage.get();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ServiceError(OFFLINE_MESSAGE);
  }

  const isJson = response.headers.get("content-type")?.includes("application/json") ?? false;
  const data: unknown = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    if (response.status === 401 && token) {
      tokenStorage.clear();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    const error = data as { error?: string; fields?: Record<string, string> } | null;
    throw new ServiceError(
      error?.error ?? (isJson ? "Ocorreu um erro inesperado." : OFFLINE_MESSAGE),
      response.status,
      error?.fields,
    );
  }

  if (response.status !== 204 && !isJson) {
    throw new ServiceError(OFFLINE_MESSAGE, response.status);
  }

  if (method !== "GET") {
    window.dispatchEvent(new Event(DATA_CHANGED_EVENT));
  }
  return data as T;
}
