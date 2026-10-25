import { createContext } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import type { UserRole } from "../types/user";

export interface AuthContextValue {
  user: FirebaseUser | null;
  role: UserRole | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  loading: true,
});