import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { loginWithEmail, loginWithGoogle, getAuthErrorMessage } from "../services/authService";

export function LoginPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Completá email y contraseña.");
      return;
    }

    setSubmitting(true);
    try {
      await loginWithEmail(email, password);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto mt-6 max-w-sm rounded-lg border border-border bg-card p-6">
      <h2 className="text-xl font-semibold tracking-tight">Iniciar sesión</h2>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2"
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-primary py-2 font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {submitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <button
        onClick={handleGoogle}
        disabled={submitting}
        className="mt-3 w-full rounded-full border border-border py-2 font-medium hover:bg-surface disabled:opacity-50"
      >
        Continuar con Google
      </button>

      <p className="mt-4 text-center text-sm text-muted">
        ¿No tenés cuenta?{" "}
        <Link to="/register" className="text-primary hover:underline">
          Registrate
        </Link>
      </p>
    </section>
  );
}