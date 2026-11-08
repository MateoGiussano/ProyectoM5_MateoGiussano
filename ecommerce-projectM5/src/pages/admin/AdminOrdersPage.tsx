import { useState } from "react";
import { Link } from "react-router-dom";
import { Loading } from "../../components/ui/Loading";
import { OrderStatusBadge } from "../../components/ui/OrderStatusBadge";
import { useAdminOrders } from "../../hooks/useAdminOrders";
import type { OrderStatusFilter } from "../../hooks/useAdminOrders";
import { formatOrderDate } from "../../utils/formatDate";
import { formatPrice } from "../../utils/formatPrice";
import { orderStatusLabels } from "../../utils/orderStatus";

const filterOptions: { value: OrderStatusFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  ...(["pending", "processing", "completed", "cancelled"] as const).map((status) => ({
    value: status,
    label: orderStatusLabels[status],
  })),
];

export function AdminOrdersPage() {
  const [filter, setFilter] = useState<OrderStatusFilter>("all");
  const { orders, loading, error } = useAdminOrders(filter);

  return (
    <>
      <div className="mb-4">
        <h2 className="text-xl font-semibold tracking-tight">Órdenes</h2>
        {!loading && !error && <p className="text-sm text-muted">{orders.length} encontradas</p>}
      </div>

      <div role="group" aria-label="Filtrar por estado" className="mb-4 flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            aria-pressed={filter === option.value}
            className={`rounded-full border px-3 py-1 text-sm ${
              filter === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-surface"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <p className="py-10 text-center text-danger">{error}</p>
      ) : orders.length === 0 ? (
        <p className="rounded-lg border border-border bg-card p-6 text-center text-muted">
          {filter === "all" ? "Todavía no hay órdenes." : "No hay órdenes con este estado."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium">Orden #{order.id.slice(0, 8)}</span>
                <span className="text-sm text-muted">{order.userEmail}</span>
                <span className="text-xs text-muted">{formatOrderDate(order.createdAt)}</span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <span className="font-semibold">{formatPrice(order.total)}</span>
                <OrderStatusBadge status={order.status} />
                <Link to={`/orders/${order.id}`} className="text-sm text-primary hover:underline">
                  Ver detalle
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
