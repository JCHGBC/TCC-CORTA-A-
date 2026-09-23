import type { ProfileInput, RegisterInput, User } from "@/types";
import { ServiceError } from "./api";
import { request, tokenStorage } from "./http";

interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  /** RF-01 — Cadastrar cliente */
  async register(input: RegisterInput): Promise<User> {
    const { token, user } = await request<AuthResponse>("POST", "/auth/register", { body: input });
    tokenStorage.save(token, true);
    return user;
  },

  /** RF-02 — Login do cliente */
  async login(email: string, password: string, remember: boolean): Promise<User> {
    const { token, user } = await request<AuthResponse>("POST", "/auth/login", {
      body: { email, password, remember },
    });
    tokenStorage.save(token, remember);
    return user;
  },

  async logout() {
    try {
      await request("POST", "/auth/logout");
    } catch {
      // Mesmo se a API estiver fora do ar, o usuário sai no navegador
    } finally {
      tokenStorage.clear();
    }
  },

  /** Usuário do token salvo (ou null se não estiver logado / sessão expirada). */
  async getCurrentUser(): Promise<User | null> {
    if (!tokenStorage.get()) return null;
    try {
      return await request<User>("GET", "/auth/me");
    } catch (error) {
      if (error instanceof ServiceError && error.status === 401) return null;
      throw error;
    }
  },

  /** Simulado na API: num sistema em produção enviaria um e-mail de redefinição. */
  async requestPasswordReset(email: string) {
    await request("POST", "/auth/forgot-password", { body: { email } });
  },

  async updateProfile(input: ProfileInput): Promise<User> {
    return request<User>("PUT", "/profile", { body: input });
  },

  async changePassword(currentPassword: string, newPassword: string) {
    await request("PUT", "/profile/password", { body: { currentPassword, newPassword } });
  },

  /** Exclui a conta e TODOS os dados do usuário. */
  async deleteAccount() {
    await request("DELETE", "/profile");
    tokenStorage.clear();
  },
};
