import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

function getDrawerLinkClass({ isActive }: { isActive: boolean }): string {
  return isActive
    ? "rounded-md bg-surface px-4 py-3 font-medium"
    : "rounded-md px-4 py-3 text-muted hover:bg-surface hover:text-foreground";
}

export function NavDrawer({ isOpen, onClose, onLogout }: NavDrawerProps) {
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  function handleLogoutClick() {
    onClose();
    onLogout();
  }

  return (
    <div className="md:hidden">
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-20 bg-black/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        inert={!isOpen}
        className={`fixed top-0 left-0 z-30 flex h-full w-72 max-w-[80%] flex-col bg-card p-4 shadow-lg transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold tracking-tight">Menú</span>
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="rounded-full px-2 py-1 text-foreground hover:bg-surface"
          >
            ✕
          </button>
        </div>

        <nav className="mt-4 flex flex-col gap-1">
          <NavLink to="/" end onClick={onClose} className={getDrawerLinkClass}>
            Inicio
          </NavLink>

          {!loading && user && (
            <NavLink to="/orders" onClick={onClose} className={getDrawerLinkClass}>
              Mis órdenes
            </NavLink>
          )}

          {!loading && role === "admin" && (
            <NavLink to="/admin" onClick={onClose} className={getDrawerLinkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        {!loading && (
          <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
            {user ? (
              <button onClick={handleLogoutClick} className={getDrawerLinkClass({ isActive: false })}>
                Salir
              </button>
            ) : (
              <>
                <NavLink to="/login" onClick={onClose} className={getDrawerLinkClass}>
                  Ingresar
                </NavLink>
                <NavLink to="/register" onClick={onClose} className={getDrawerLinkClass}>
                  Registrarse
                </NavLink>
              </>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}  