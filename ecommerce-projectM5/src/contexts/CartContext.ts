import { createContext } from "react";
import type { CartItem } from "../types/cartItem";
import type { Product } from "../types/product";

export interface CartContextValue {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);
