import { Link } from "react-router-dom";

export function AdminDashboardPage() {
  return (
    <>
      <h2 className="text-xl font-semibold tracking-tight">Panel de administración</h2>
      <p className="mt-1 text-sm text-muted">Elegí qué querés gestionar.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Link
          to="/admin/products"
          className="rounded-lg border border-border bg-card p-4 transition hover:shadow-md"
        >
          <span className="text-2xl">📦</span>
          <h3 className="mt-2 font-semibold">Productos</h3>
          <p className="text-sm text-muted">Crear, editar y eliminar productos del catálogo.</p>
        </Link>
        <Link
          to="/admin/orders"
          className="rounded-lg border border-border bg-card p-4 transition hover:shadow-md"
        >
          <span className="text-2xl">🧾</span>
          <h3 className="mt-2 font-semibold">Órdenes</h3>
          <p className="text-sm text-muted">Ver todas las órdenes y actualizar su estado.</p>
        </Link>
      </div>
    </>
  );
}
