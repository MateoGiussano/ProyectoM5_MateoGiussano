import { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";
import type { Order, OrderItem, OrderStatus } from "../types/order";
import { computeDashboardStats } from "./dashboardStats";

function createOrder(status: OrderStatus, items: OrderItem[]): Order {
  return {
    id: `o_${Math.random()}`,
    userId: "u_1",
    userEmail: "cliente@test.com",
    items,
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    status,
    createdAt: Timestamp.now(),
  };
}

const iphone: OrderItem = {
  productId: "p_iphone",
  name: "iPhone 17",
  price: 1000,
  image: "",
  quantity: 1,
};
const airpods: OrderItem = {
  productId: "p_airpods",
  name: "AirPods",
  price: 200,
  image: "",
  quantity: 2,
};

describe("computeDashboardStats", () => {
  it("las órdenes canceladas no suman ingresos ni ventas, pero se cuentan por estado", () => {
    const stats = computeDashboardStats([
      createOrder("completed", [iphone]),
      createOrder("cancelled", [{ ...iphone, quantity: 5 }]),
    ]);

    expect(stats.revenue).toBe(1000);
    expect(stats.validOrders).toBe(1);
    expect(stats.countsByStatus.cancelled).toBe(1);
    expect(stats.topProducts).toEqual([{ productId: "p_iphone", name: "iPhone 17", units: 1 }]);
  });

  it("suma las unidades de un mismo producto entre órdenes y ordena de más a menos vendido", () => {
    const stats = computeDashboardStats([
      createOrder("pending", [iphone, airpods]),
      createOrder("processing", [airpods]),
    ]);

    expect(stats.topProducts.map((product) => [product.name, product.units])).toEqual([
      ["AirPods", 4],
      ["iPhone 17", 1],
    ]);
    expect(stats.averageTicket).toBe(900);
  });

  it("sin órdenes devuelve todo en cero sin dividir por cero", () => {
    const stats = computeDashboardStats([]);

    expect(stats.revenue).toBe(0);
    expect(stats.averageTicket).toBe(0);
    expect(stats.topProducts).toHaveLength(0);
  });
});
