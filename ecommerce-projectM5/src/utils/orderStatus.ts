import type { OrderStatus } from "../types/order";

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Pendiente",
  processing: "En preparación",
  completed: "Completada",
  cancelled: "Cancelada",
};
