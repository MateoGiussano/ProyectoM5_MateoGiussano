import { FirebaseError } from "firebase/app";

export function getFirestoreErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof FirebaseError) {
    if (error.code === "permission-denied") {
      return "No tenés permisos para esta acción. Cerrá sesión y volvé a ingresar con una cuenta de administrador.";
    }
    if (error.code === "unavailable") {
      return "No hay conexión con el servidor. Revisá tu internet y probá de nuevo.";
    }
  }
  return fallback;
}
