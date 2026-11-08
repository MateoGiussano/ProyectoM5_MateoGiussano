import { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus } from "../services/orderService";
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
    let ignore = false;

    getAllOrders(filter === "all" ? undefined : filter)
      .then((orders) => {
        if (!ignore) setResult({ filter, orders, error: "" });
      })
      .catch((err: unknown) => {
        console.error("Error al cargar las órdenes:", err);
        if (!ignore) {
          setResult({
            filter,
            orders: [],
            error: getFirestoreErrorMessage(
              err,
              "No pudimos cargar las órdenes. Intentá de nuevo.",
            ),
          });
        }
      });

    return () => {
      ignore = true;
    };
  }, [filter]);

  async function changeStatus(orderId: string, status: OrderStatus) {
    await updateOrderStatus(orderId, status);
    setResult(
      (current) =>
        current && {
          ...current,
          orders: current.orders
            .map((order) => (order.id === orderId ? { ...order, status } : order))
            .filter((order) => current.filter === "all" || order.status === current.filter),
        },
    );
  }

  const loading = result?.filter !== filter;
  return { orders: result?.orders ?? [], error: result?.error ?? "", loading, changeStatus };
}
