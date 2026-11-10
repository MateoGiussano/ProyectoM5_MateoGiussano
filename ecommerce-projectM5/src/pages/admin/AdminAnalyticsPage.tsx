import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Loading } from "../../components/ui/Loading";
import { OrderStatusBadge } from "../../components/ui/OrderStatusBadge";
import { useAdminOrders } from "../../hooks/useAdminOrders";
import { useLowStockProducts } from "../../hooks/useLowStockProducts";
import type { OrderStatus } from "../../types/order";
import { computeDashboardStats } from "../../utils/dashboardStats";
import { formatPrice } from "../../utils/formatPrice";

const LOW_STOCK_MAX = 3;
const LOW_STOCK_COUNT = 5;
const STATUSES: OrderStatus[] = ["pending", "processing", "completed", "cancelled"];

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function AdminAnalyticsPage() {
  const { orders, loading, error } = useAdminOrders("all");
  const lowStock = useLowStockProducts(LOW_STOCK_MAX, LOW_STOCK_COUNT);
  const stats = useMemo(() => computeDashboardStats(orders), [orders]);
  const maxUnits = stats.topProducts[0]?.units ?? 0;

  return (
    <>
      <h2 className="text-xl font-semibold tracking-tight">Analytics</h2>
      <p className="mt-1 text-sm text-muted">Resumen de ventas y del catálogo.</p>

      {loading ? (
        <Loading />
      ) : error ? (
        <p className="py-10 text-center text-danger">{error}</p>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Ingresos"
              value={formatPrice(stats.revenue)}
              hint="Sin contar órdenes canceladas"
            />
            <StatTile label="Órdenes" value={String(stats.validOrders)} hint="Sin canceladas" />
            <StatTile label="Ticket promedio" value={formatPrice(stats.averageTicket)} />
            <Link
              to="/admin/orders"
              className="rounded-lg border border-border bg-card p-4 transition hover:shadow-md"
            >
              <p className="text-sm text-muted">Pendientes</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                {stats.countsByStatus.pending}
              </p>
              <p className="mt-1 text-xs text-primary">Ver órdenes →</p>
            </Link>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <section className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold">Órdenes por estado</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {STATUSES.map((status) => (
                  <li key={status} className="flex items-center justify-between">
                    <OrderStatusBadge status={status} />
                    <span className="font-semibold">{stats.countsByStatus[status]}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold">Más vendidos</h3>
              {stats.topProducts.length === 0 ? (
                <p className="mt-3 text-sm text-muted">Todavía no hay ventas.</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-3">
                  {stats.topProducts.map((product) => (
                    <li
                      key={product.productId}
                      title={`${product.name}: ${product.units} ${product.units === 1 ? "unidad" : "unidades"}`}
                    >
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="truncate">{product.name}</span>
                        <span className="font-semibold">{product.units}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-surface">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${(product.units / maxUnits) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="mt-4 rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold">Stock bajo</h3>
            <p className="text-xs text-muted">
              Los {LOW_STOCK_COUNT} productos con {LOW_STOCK_MAX} unidades o menos
            </p>
            {lowStock.loading ? (
              <Loading />
            ) : lowStock.error ? (
              <p className="mt-3 text-sm text-danger">{lowStock.error}</p>
            ) : lowStock.products.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Ningún producto tiene stock bajo.</p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {lowStock.products.map((product) => (
                  <li key={product.id} className="flex items-center justify-between gap-3 py-2">
                    <span className="truncate text-sm">{product.name}</span>
                    <span className="flex items-center gap-4 text-sm">
                      <span className={product.stock === 0 ? "text-danger" : "text-muted"}>
                        Stock: {product.stock}
                      </span>
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="text-primary hover:underline"
                      >
                        Editar
                      </Link>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}
