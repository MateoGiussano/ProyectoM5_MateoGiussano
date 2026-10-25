import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { User, UserRole } from "../types/user";

async function createUserProfile(uid: string, email: string, displayName: string): Promise<void> {
  const newUser: User = { uid, email, displayName, role: "customer" };
  await setDoc(doc(db, "users", uid), newUser);
}

export async function registerWithEmail(displayName: string, email: string, password: string): Promise<void> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await createUserProfile(credential.user.uid, email, displayName);
}

export async function loginWithEmail(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle(): Promise<void> {
  const credential = await signInWithPopup(auth, new GoogleAuthProvider());
  const { uid, email, displayName } = credential.user;
  const profile = await getDoc(doc(db, "users", uid));
  if (!profile.exists()) {
    await createUserProfile(uid, email ?? "", displayName ?? "");
  }
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function getUserRole(uid: string): Promise<UserRole> {
  const profile = await getDoc(doc(db, "users", uid));
  if (!profile.exists()) {
    return "customer";
  }
  return profile.data().role as UserRole;
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
        return "Email o contraseña incorrectos.";
      case "auth/email-already-in-use":
        return "Ya existe una cuenta con ese email.";
      case "auth/weak-password":
        return "La contraseña debe tener al menos 6 caracteres.";
      case "auth/invalid-email":
        return "El email no es válido.";
      case "auth/popup-closed-by-user":
        return "Cerraste la ventana de Google antes de terminar.";
      case "auth/too-many-requests":
        return "Demasiados intentos. Probá de nuevo en unos minutos.";
    }
  }
  return "Ocurrió un error. Intentá de nuevo.";
}