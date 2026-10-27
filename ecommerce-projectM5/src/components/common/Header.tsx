import { useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { logout } from "../../services/authService";
import { SearchBar } from "./SearchBar";
import logoClaro from "../../assets/logo_claro.jfif";
import logoDark from "../../assets/logo_dark.jfif";

function getNavLinkClass({ isActive }: { isActive: boolean }): string {
  return isActive
    ? "rounded-md bg-surface px-3 py-1.5 text-sm font-medium"
    : "rounded-md px-3 py-1.5 text-sm text-muted hover:bg-surface hover:text-foreground";
}

export function Header() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();              
  const [searchParams] = useSearchParams();    

  
  const searchTerm = searchParams.get("search") ?? "";

  function handleSearchChange(value: string) {
    const url = value ? `/?search=${encodeURIComponent(value)}` : "/";
    navigate(url, { replace: location.pathname === "/" });
  }

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
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="order-1 flex items-center gap-2">
            <img src={logoClaro} alt="iPhonix" className="h-9 w-auto rounded-md dark:hidden" />
            <img src={logoDark} alt="iPhonix" className="hidden h-9 w-auto rounded-md dark:block" />
            <span className="text-lg font-semibold tracking-tight">iPhonix</span>
          </Link>

          <div className="order-3 w-full md:order-2 md:w-auto md:max-w-md md:flex-1">
            <SearchBar value={searchTerm} onChange={handleSearchChange} />
          </div>

          <div className="order-2 flex items-center gap-1 md:order-3">
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

        <nav className="mt-2 flex flex-wrap items-center justify-between gap-1">
          <div className="flex flex-wrap gap-1">
            <NavLink to="/" end className={getNavLinkClass}>
              Inicio
            </NavLink>

            {!loading && user && (
              <NavLink to="/orders" className={getNavLinkClass}>
                Mis órdenes
              </NavLink>
            )}

            {!loading && role === "admin" && (
              <NavLink to="/admin" className={getNavLinkClass}>
                Admin
              </NavLink>
            )}
          </div>

          {!loading && (
            <div className="flex flex-wrap gap-1">
              {user ? (
                <button onClick={handleLogout} className={getNavLinkClass({ isActive: false })}>
                  Salir
                </button>
              ) : (
                <>
                  <NavLink to="/login" className={getNavLinkClass}>
                    Ingresar
                  </NavLink>
                  <NavLink to="/register" className={getNavLinkClass}>
                    Registrarse
                  </NavLink>
                </>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}