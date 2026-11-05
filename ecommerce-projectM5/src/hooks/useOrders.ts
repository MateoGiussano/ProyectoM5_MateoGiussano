import { useEffect, useState } from "react";
import { getOrdersByUser } from "../services/orderService";
import type { Order } from "../types/order";

export function useOrders(userId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getOrdersByUser(userId);
        setOrders(data);
      } catch (err) {
        console.error("Error al cargar las órdenes:", err);
        setError("No pudimos cargar tus órdenes. Intentá de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [userId]);

  return { orders, loading, error };
}