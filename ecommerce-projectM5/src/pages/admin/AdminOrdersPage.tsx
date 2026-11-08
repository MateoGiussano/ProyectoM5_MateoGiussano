import { useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Loading } from "../../components/ui/Loading";
import { OrderStatusBadge } from "../../components/ui/OrderStatusBadge";
import { useAdminOrders } from "../../hooks/useAdminOrders";
import type { OrderStatusFilter } from "../../hooks/useAdminOrders";
import type { Order, OrderStatus } from "../../types/order";
import { formatOrderDate } from "../../utils/formatDate";
import { formatPrice } from "../../utils/formatPrice";
import { getFirestoreErrorMessage } from "../../utils/getFirestoreErrorMessage";
import { nextOrderStatuses, orderStatusLabels } from "../../utils/orderStatus";

interface ActionMessage {
  type: "success" | "error";
  text: string;
}

interface PendingChange {
  order: Order;
  status: OrderStatus;
}

const filterOptions: { value: OrderStatusFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  ...(["pending", "processing", "completed", "cancelled"] as const).map((status) => ({
    value: status,
    label: orderStatusLabels[status],
  })),
];

export function AdminOrdersPage() {
  const [filter, setFilter] = useState<OrderStatusFilter>("all");
  const { orders, loading, error, changeStatus } = useAdminOrders(filter);
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null);

  async function applyChange(order: Order, status: OrderStatus) {
    setUpdatingId(order.id);
    setActionMessage(null);
    try {
      await changeStatus(order.id, status);
      setActionMessage({
        type: "success",
        text: `La orden #${order.id.slice(0, 8)} pasó a "${orderStatusLabels[status]}".`,
      });
    } catch (err) {
      console.error("Error al cambiar el estado:", err);
      setActionMessage({
        type: "error",
        text: getFirestoreErrorMessage(err, "No se pudo cambiar el estado. Intentá de nuevo."),
      });
    } finally {
      setUpdatingId(null);
    }
  }

  function handleSelectStatus(order: Order, status: OrderStatus) {
    if (nextOrderStatuses[status].length === 0) {
      setPendingChange({ order, status });
    } else {
      applyChange(order, status);
    }
  }

  function handleConfirmChange() {
    if (!pendingChange) {
      return;
    }
    const { order, status } = pendingChange;
    setPendingChange(null);
    applyChange(order, status);
  }

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

      {actionMessage && (
        <p
          role="status"
          className={`mb-3 rounded-md p-3 text-sm ${
            actionMessage.type === "success"
              ? "bg-success/15 text-success"
              : "bg-danger/15 text-danger"
          }`}
        >
          {actionMessage.text}
        </p>
      )}

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
                {nextOrderStatuses[order.status].length > 0 && (
                  <select
                    aria-label={`Cambiar estado de la orden ${order.id.slice(0, 8)}`}
                    value=""
                    disabled={updatingId === order.id}
                    onChange={(event) =>
                      handleSelectStatus(order, event.target.value as OrderStatus)
                    }
                    className="text-sm"
                  >
                    <option value="" disabled>
                      {updatingId === order.id ? "Guardando…" : "Cambiar estado…"}
                    </option>
                    {nextOrderStatuses[order.status].map((status) => (
                      <option key={status} value={status}>
                        {orderStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                )}
                <Link to={`/orders/${order.id}`} className="text-sm text-primary hover:underline">
                  Ver detalle
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        isOpen={pendingChange !== null}
        title="Cambiar estado"
        message={`¿Pasar la orden #${pendingChange?.order.id.slice(0, 8)} a "${
          pendingChange ? orderStatusLabels[pendingChange.status] : ""
        }"? Después no se puede volver a cambiar.`}
        onConfirm={handleConfirmChange}
        onCancel={() => setPendingChange(null)}
      />
    </>
  );
}
