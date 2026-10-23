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