import type { Timestamp } from "firebase/firestore";

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Timestamp;
}
