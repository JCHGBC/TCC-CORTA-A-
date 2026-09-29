import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";

/**
 * Configuração do projeto no Firebase (console.firebase.google.com → Configurações do projeto).
 * Essas chaves são públicas: elas vão para o navegador de qualquer forma.
 * Quem protege os dados são as regras de segurança do Firestore (arquivo firestore.rules).
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyAnlxFXTokvUoO0EUtz38kzhxVMfXLV9Hk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "corta-ai-bd1c1.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "corta-ai-bd1c1",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "corta-ai-bd1c1.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "717575725479",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:717575725479:web:33d7e0a005faac77745682",
};

/** true = usa o emulador local do Firebase (testes), em vez do projeto real. */
const useEmulator = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === "true";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

function firebaseApp() {
  app ??= getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

/** Firebase Authentication (cadastro, login, senha). */
export function firebaseAuth() {
  if (!auth) {
    auth = getAuth(firebaseApp());
    if (useEmulator) connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  }
  return auth;
}

/** Cloud Firestore (banco de dados). */
export function firestore() {
  if (!db) {
    db = getFirestore(firebaseApp());
    if (useEmulator) connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }
  return db;
}
