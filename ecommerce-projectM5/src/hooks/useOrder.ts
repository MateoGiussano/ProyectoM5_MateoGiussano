import { useEffect, useState } from "react";
import { getOrderById } from "../services/orderService";
import type { Order } from "../types/order";

export function useOrder(orderId: string | undefined) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error("Error al cargar la orden:", err);
        setError("No pudimos cargar la orden. Intentá de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  return { order, loading, error };
}
