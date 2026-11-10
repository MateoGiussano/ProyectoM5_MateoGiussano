import { useEffect, useState } from "react";
import { subscribeToAllOrders, updateOrderStatus } from "../services/orderService";
import { getFirestoreErrorMessage } from "../utils/getFirestoreErrorMessage";
import type { Order, OrderStatus } from "../types/order";

export type OrderStatusFilter = OrderStatus | "all";

interface LoadedOrders {
  filter: OrderStatusFilter;
  orders: Order[];
  error: string;
}

export function useAdminOrders(filter: OrderStatusFilter) {
  const [result, setResult] = useState<LoadedOrders | null>(null);

  useEffect(() => {
    return subscribeToAllOrders(
      filter === "all" ? undefined : filter,
      (orders) => setResult({ filter, orders, error: "" }),
      (err) => {
        console.error("Error al escuchar las órdenes:", err);
        setResult({
          filter,
          orders: [],
          error: getFirestoreErrorMessage(err, "No pudimos cargar las órdenes. Intentá de nuevo."),
        });
      },
    );
  }, [filter]);

  async function changeStatus(orderId: string, status: OrderStatus) {
    await updateOrderStatus(orderId, status);
  }

  const loading = result?.filter !== filter;
  return { orders: result?.orders ?? [], error: result?.error ?? "", loading, changeStatus };
}
