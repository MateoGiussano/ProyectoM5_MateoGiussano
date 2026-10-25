import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { registerWithEmail, getAuthErrorMessage } from "../services/authService";

export function RegisterPage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!displayName || !email || !password) {
      setError("Completá todos los campos.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);
    try {
      await registerWithEmail(displayName, email, password);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto mt-6 max-w-sm rounded-lg border border-border bg-card p-6">
      <h2 className="text-xl font-semibold tracking-tight">Crear cuenta</h2>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <input
          type="text"
          placeholder="Nombre"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2"
        />
        <input
          type="password"
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2"
        />
        <input
          type="password"
          placeholder="Repetir contraseña"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2"
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-primary py-2 font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {submitting ? "Creando cuenta..." : "Registrarme"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        ¿Ya tenés cuenta?{" "}
        <Link to="/login" className="text-primary hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </section>
  );
}