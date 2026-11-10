import { useEffect, useState } from "react";
import { subscribeToUserOrders } from "../services/orderService";
import type { Order } from "../types/order";

export function useOrders(userId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      return;
    }

    const unsubscribe = subscribeToUserOrders(
      userId,
      (data) => {
        setOrders(data);
        setError("");
        setLoading(false);
      },
      (err) => {
        console.error("Error al escuchar las órdenes:", err);
        setError("No pudimos cargar tus órdenes. Intentá de nuevo más tarde.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [userId]);

  return { orders, loading: userId ? loading : false, error };
}
