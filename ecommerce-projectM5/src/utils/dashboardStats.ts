import type { Order, OrderStatus } from "../types/order";

export interface TopProduct {
  productId: string;
  name: string;
  units: number;
}

export interface DashboardStats {
  revenue: number;
  validOrders: number;
  averageTicket: number;
  countsByStatus: Record<OrderStatus, number>;
  topProducts: TopProduct[];
}

export function computeDashboardStats(orders: Order[], topCount = 5): DashboardStats {
  const countsByStatus: Record<OrderStatus, number> = {
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
  };
  const unitsByProduct = new Map<string, TopProduct>();
  let revenue = 0;
  let validOrders = 0;

  for (const order of orders) {
    countsByStatus[order.status] += 1;
    if (order.status === "cancelled") continue;

    revenue += order.total;
    validOrders += 1;
    for (const item of order.items) {
      const current = unitsByProduct.get(item.productId) ?? {
        productId: item.productId,
        name: item.name,
        units: 0,
      };
      current.units += item.quantity;
      unitsByProduct.set(item.productId, current);
    }
  }

  const topProducts = [...unitsByProduct.values()]
    .sort((a, b) => b.units - a.units)
    .slice(0, topCount);

  return {
    revenue,
    validOrders,
    averageTicket: validOrders > 0 ? revenue / validOrders : 0,
    countsByStatus,
    topProducts,
  };
}
