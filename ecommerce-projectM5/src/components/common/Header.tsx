import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { logout } from "../../services/authService";
import logoClaro from "../../assets/logo_claro.jfif";
import logoDark from "../../assets/logo_dark.jfif";

export function Header() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

async function handleLogout() {
  await logout();
  navigate("/login");
}

  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function handleToggleTheme() {
    document.documentElement.classList.toggle("dark");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <img src={logoClaro} alt="iPhonix" className="h-9 w-auto rounded-md dark:hidden" />
          <img src={logoDark} alt="iPhonix" className="hidden h-9 w-auto rounded-md dark:block" />
          <span className="text-lg font-semibold tracking-tight">iPhonix</span>
        </div>

        <div className="flex items-center gap-1">
          {!loading && (
            user ? (
              <button
                onClick={handleLogout}
                className="rounded-full px-3 py-1 text-sm hover:bg-surface"
              >
                Salir
              </button>
            ) : (
              <Link to="/login" className="rounded-full px-3 py-1 text-sm hover:bg-surface">
                Ingresar
              </Link>
            )
          )}

          <button
            aria-label="Ver carrito"
            className="relative rounded-full p-2 hover:bg-surface"
          >
            🛒
            <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground">
              0
            </span>
          </button>

          <button
            onClick={handleToggleTheme}
            aria-label="Cambiar tema"
            className="h-8 w-14 rounded-full bg-surface p-1 ring-1 ring-border"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-card text-xs shadow-sm transition-transform duration-300 dark:translate-x-6">
              <span className="dark:hidden">☀️</span>
              <span className="hidden dark:inline">🌙</span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}