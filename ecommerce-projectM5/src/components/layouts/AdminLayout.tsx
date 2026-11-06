import { Link, NavLink, Outlet } from "react-router-dom";
import { ThemeToggle } from "../common/ThemeToggle";

function getAdminLinkClass({ isActive }: { isActive: boolean }): string {
  return isActive
    ? "rounded-md bg-surface px-3 py-2 text-sm font-medium"
    : "rounded-md px-3 py-2 text-sm text-muted hover:bg-surface hover:text-foreground";
}

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold tracking-tight">iPhonix · Admin</span>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted hover:text-foreground">
              ← Volver a la tienda
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row">
        <nav className="flex flex-wrap gap-1 md:w-48 md:shrink-0 md:flex-col">
          <NavLink to="/admin" end className={getAdminLinkClass}>
            Inicio
          </NavLink>
          <NavLink to="/admin/products" className={getAdminLinkClass}>
            Productos
          </NavLink>
          <NavLink to="/admin/orders" className={getAdminLinkClass}>
            Órdenes
          </NavLink>
        </nav>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
