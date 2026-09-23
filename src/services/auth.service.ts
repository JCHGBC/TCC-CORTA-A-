import { generateId } from "@/lib/utils";
import type { ProfileInput, RegisterInput, StoredUser, User } from "@/types";
import { ServiceError, simulateRequest } from "./api";
import { hashPassword, verifyPassword } from "./password";
import { createDefaultCategories, ensureDemoData } from "./seed";
import { clearSession, getSession, readDatabase, saveSession, updateDatabase } from "./storage";

/** Remove o hash da senha antes de devolver o usuário para as telas. */
function toPublicUser(user: StoredUser): User {
  const { passwordHash: _passwordHash, ...rest } = user;
  void _passwordHash;
  return rest;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const authService = {
  /** RF-01 — Cadastrar cliente */
  async register(input: RegisterInput): Promise<User> {
    await ensureDemoData();
    const passwordHash = await hashPassword(input.password);
    return simulateRequest(() => {
      const email = normalizeEmail(input.email);
      const user = updateDatabase((db) => {
        if (db.users.some((u) => u.email === email)) {
          throw new ServiceError("Já existe uma conta cadastrada com este e-mail.");
        }
        const newUser: StoredUser = {
          id: generateId(),
          name: input.name.trim(),
          email,
          phone: input.phone,
          passwordHash,
          createdAt: new Date().toISOString(),
        };
        db.users.push(newUser);
        db.categories.push(...createDefaultCategories(newUser.id));
        return newUser;
      });
      saveSession(user.id, true);
      return toPublicUser(user);
    }, 700);
  },

  /** RF-02 — Login do cliente */
  async login(email: string, password: string, remember: boolean): Promise<User> {
    await ensureDemoData();
    const user = await simulateRequest(() => readDatabase().users.find((u) => u.email === normalizeEmail(email)), 600);
    // Mensagem genérica: não revela se o e-mail existe (boa prática de segurança)
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new ServiceError("E-mail ou senha incorretos.");
    }
    saveSession(user.id, remember);
    return toPublicUser(user);
  },

  async logout() {
    clearSession();
  },

  /** Recupera o usuário logado a partir da sessão salva. */
  async getCurrentUser(): Promise<User | null> {
    await ensureDemoData();
    const session = getSession();
    if (!session) return null;
    const user = readDatabase().users.find((u) => u.id === session.userId);
    if (!user) {
      clearSession();
      return null;
    }
    return toPublicUser(user);
  },

  /** Simulação: no back-end real, enviaria um e-mail com link de redefinição. */
  async requestPasswordReset(email: string) {
    return simulateRequest(() => {
      void email;
      return true;
    }, 900);
  },

  async updateProfile(userId: string, input: ProfileInput): Promise<User> {
    return simulateRequest(() => {
      const email = normalizeEmail(input.email);
      const updated = updateDatabase((db) => {
        const user = db.users.find((u) => u.id === userId);
        if (!user) throw new ServiceError("Usuário não encontrado.");
        if (db.users.some((u) => u.email === email && u.id !== userId)) {
          throw new ServiceError("Este e-mail já está sendo usado por outra conta.");
        }
        user.name = input.name.trim();
        user.email = email;
        user.phone = input.phone;
        return { ...user };
      });
      return toPublicUser(updated);
    }, 500);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = readDatabase().users.find((u) => u.id === userId);
    if (!user) throw new ServiceError("Usuário não encontrado.");
    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
      await simulateRequest(() => null, 400);
      throw new ServiceError("A senha atual está incorreta.");
    }
    const passwordHash = await hashPassword(newPassword);
    return simulateRequest(() => {
      updateDatabase((db) => {
        const target = db.users.find((u) => u.id === userId);
        if (target) target.passwordHash = passwordHash;
      });
    }, 500);
  },

  /** Exclui a conta e TODOS os dados do usuário. */
  async deleteAccount(userId: string) {
    return simulateRequest(() => {
      updateDatabase((db) => {
        db.users = db.users.filter((u) => u.id !== userId);
        db.categories = db.categories.filter((c) => c.userId !== userId);
        db.transactions = db.transactions.filter((t) => t.userId !== userId);
        db.goals = db.goals.filter((g) => g.userId !== userId);
      });
      clearSession();
    }, 600);
  },
};
