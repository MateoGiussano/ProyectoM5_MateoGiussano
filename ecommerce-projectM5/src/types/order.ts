import type { CartItem } from "./cartItem";
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface Order {
    id: string;
    userId: string;
    items: CartItem[];
    total: number;
    status: OrderStatus;
    createdAt: string;
}