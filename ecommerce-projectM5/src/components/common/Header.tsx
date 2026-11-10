import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { logout } from "../../services/authService";
import { SearchBar } from "./SearchBar";
import { NavDrawer } from "./NavDrawer";
import logoClaro from "../../assets/logo_claro.webp";
import logoDark from "../../assets/logo_dark.webp";
import { useCart } from "../../hooks/useCart";
import { useFavorites } from "../../hooks/useFavorites";
import { ThemeToggle } from "./ThemeToggle";

function getNavLinkClass({ isActive }: { isActive: boolean }): string {
  return isActive
    ? "rounded-md bg-surface px-3 py-1.5 text-sm font-medium"
    : "rounded-md px-3 py-1.5 text-sm text-muted hover:bg-surface hover:text-foreground";
}

export function Header() {
  const { user, role, loading } = useAuth();
  const { totalItems } = useCart();
  const { favoriteIds } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const searchTerm = searchParams.get("search") ?? "";

  function handleSearchChange(value: string) {
    const url = value ? `/?search=${encodeURIComponent(value)}` : "/";
    navigate(url, { replace: location.pathname === "/" });
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }
  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="order-1 flex items-center gap-2">
              <button
                onClick={() => setIsMenuOpen(true)}
                aria-label="Abrir menú"
                aria-expanded={isMenuOpen}
                className="rounded-full p-2 text-foreground hover:bg-surface md:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              </button>

              <Link to="/" className="flex items-center gap-2">
                <img src={logoClaro} alt="iPhonix" className="h-9 w-auto rounded-md dark:hidden" />
                <img
                  src={logoDark}
                  alt="iPhonix"
                  className="hidden h-9 w-auto rounded-md dark:block"
                />
                <span className="text-lg font-semibold tracking-tight">iPhonix</span>
              </Link>
            </div>

            <div className="order-3 w-full md:order-2 md:w-auto md:max-w-md md:flex-1">
              <SearchBar value={searchTerm} onChange={handleSearchChange} />
            </div>

            <div className="order-2 flex items-center gap-1 md:order-3">
              <Link
                to="/favorites"
                aria-label="Ver favoritos"
                className="relative rounded-full p-2 hover:bg-surface"
              >
                ❤️
                <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground">
                  {favoriteIds.length}
                </span>
              </Link>
              <Link
                to="/cart"
                aria-label="Ver carrito"
                className="relative rounded-full p-2 hover:bg-surface"
              >
                🛒
                <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground">
                  {totalItems}
                </span>
              </Link>

              <ThemeToggle />
            </div>
          </div>

          <nav className="mt-2 hidden flex-wrap items-center justify-between gap-1 md:flex">
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

      <NavDrawer isOpen={isMenuOpen} onClose={closeMenu} onLogout={handleLogout} />
    </>
  );
}
