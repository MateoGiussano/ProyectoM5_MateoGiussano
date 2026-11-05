import type { OrderStatus } from "../../types/order";

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pendiente",
  processing: "En preparación",
  completed: "Completada",
  cancelled: "Cancelada",
};

const statusClasses: Record<OrderStatus, string> = {
  pending: "bg-warning/15 text-warning",
  processing: "bg-info/15 text-info",
  completed: "bg-success/15 text-success",
  cancelled: "bg-danger/15 text-danger",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClasses[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
