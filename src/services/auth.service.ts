import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type User as FirebaseUser,
} from "firebase/auth";
import { getDoc, getDocs, setDoc, Timestamp, updateDoc, writeBatch } from "firebase/firestore";
import { DEMO_ACCOUNT } from "@/config/constants";
import { firebaseAuth, firestore } from "@/lib/firebase";
import type { ProfileInput, RegisterInput, User } from "@/types";
import { run, ServiceError } from "./api";
import { toISO, userCollection, userDoc, type Data } from "./db";
import { addDefaultCategories, seedDemoAccount } from "./demo-seed";

function toUser(uid: string, d: Data): User {
  return { id: uid, name: d.nome, email: d.email, phone: d.telefone ?? "", createdAt: toISO(d.criadoEm) };
}

/** Lê os dados do usuário em usuarios/{uid}. */
async function loadProfile(firebaseUser: FirebaseUser): Promise<User> {
  const snap = await getDoc(userDoc(firebaseUser.uid));
  if (snap.exists()) return toUser(firebaseUser.uid, snap.data());
  // Documento ainda não existe (ex.: cadastro interrompido): usa o que o Auth sabe
  const created = firebaseUser.metadata.creationTime;
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName ?? firebaseUser.email ?? "Usuário",
    email: firebaseUser.email ?? "",
    phone: "",
    createdAt: (created ? new Date(created) : new Date()).toISOString(),
  };
}

function signedUser() {
  const user = firebaseAuth().currentUser;
  if (!user?.email) throw new ServiceError("Sessão expirada. Faça login novamente.", "unauthenticated");
  return user;
}

/** Confirma a senha atual (o Firebase exige isso antes de trocar a senha ou excluir a conta). */
async function reauthenticate(password: string) {
  const user = signedUser();
  try {
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email!, password));
  } catch (error) {
    const code = (error as { code?: string }).code ?? "";
    if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
      throw new ServiceError("Senha atual incorreta.", code, { currentPassword: "Senha atual incorreta." });
    }
    throw error;
  }
  return user;
}

/** Primeiro acesso à conta de demonstração: cria o usuário e os dados de exemplo. */
async function createDemoAccount() {
  try {
    const { user } = await createUserWithEmailAndPassword(firebaseAuth(), DEMO_ACCOUNT.email, DEMO_ACCOUNT.password);
    await seedDemoAccount(user.uid);
    return user;
  } catch {
    return null;
  }
}

export const authService = {
  /** RF-01 — Cadastrar cliente */
  async register(input: RegisterInput): Promise<User> {
    return run(async () => {
      const auth = firebaseAuth();
      await setPersistence(auth, browserLocalPersistence);
      const { user } = await createUserWithEmailAndPassword(auth, input.email.trim(), input.password);
      const profile = { nome: input.name.trim(), email: user.email!, telefone: input.phone, criadoEm: Timestamp.now() };
      const batch = writeBatch(firestore());
      batch.set(userDoc(user.uid), profile);
      addDefaultCategories(batch, user.uid);
      await batch.commit();
      return toUser(user.uid, profile);
    }, "Não foi possível criar sua conta.");
  },

  /** RF-02 — Login do cliente */
  async login(email: string, password: string, remember: boolean): Promise<User> {
    return run(async () => {
      const auth = firebaseAuth();
      // "Lembrar de mim": mantém a sessão depois de fechar o navegador
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      try {
        const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
        return await loadProfile(user);
      } catch (error) {
        const isDemo = email.trim().toLowerCase() === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password;
        const demoUser = isDemo ? await createDemoAccount() : null;
        if (!demoUser) throw error;
        return loadProfile(demoUser);
      }
    }, "Não foi possível entrar.");
  },

  async logout() {
    await signOut(firebaseAuth()).catch(() => undefined);
  },

  /** Usuário da sessão salva (ou null se não estiver logado). */
  async getCurrentUser(): Promise<User | null> {
    return run(async () => {
      const auth = firebaseAuth();
      await auth.authStateReady();
      return auth.currentUser ? loadProfile(auth.currentUser) : null;
    }, "Não foi possível carregar sua sessão.");
  },

  /** Envia o e-mail de redefinição de senha do Firebase. */
  async requestPasswordReset(email: string) {
    return run(async () => {
      try {
        await sendPasswordResetEmail(firebaseAuth(), email.trim());
      } catch (error) {
        // Não revela se o e-mail está ou não cadastrado
        if ((error as { code?: string }).code !== "auth/user-not-found") throw error;
      }
    }, "Não foi possível enviar o e-mail de recuperação.");
  },

  /** Atualiza nome e telefone (o e-mail é o login no Firebase e não muda por aqui). */
  async updateProfile(input: ProfileInput): Promise<User> {
    return run(async () => {
      const user = signedUser();
      const ref = userDoc(user.uid);
      const data = { nome: input.name.trim(), telefone: input.phone };
      const current = await getDoc(ref);
      if (current.exists()) await updateDoc(ref, data);
      else await setDoc(ref, { ...data, email: user.email, criadoEm: Timestamp.now() });
      return loadProfile(user);
    }, "Não foi possível salvar seus dados.");
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return run(async () => {
      const user = await reauthenticate(currentPassword);
      await updatePassword(user, newPassword);
    }, "Não foi possível alterar a senha.");
  },

  /** Exclui a conta e TODOS os dados do usuário (pede a senha para confirmar). */
  async deleteAccount(password: string) {
    return run(async () => {
      const user = await reauthenticate(password);
      const refs = [];
      for (const name of ["movimentacoes", "metas", "categorias"] as const) {
        const snapshot = await getDocs(userCollection(name, user.uid));
        refs.push(...snapshot.docs.map((d) => d.ref));
      }
      refs.push(userDoc(user.uid));
      // Um lote do Firestore aceita até 500 operações
      for (let i = 0; i < refs.length; i += 450) {
        const batch = writeBatch(firestore());
        refs.slice(i, i + 450).forEach((ref) => batch.delete(ref));
        await batch.commit();
      }
      await deleteUser(user);
    }, "Não foi possível excluir a conta.");
  },
};
