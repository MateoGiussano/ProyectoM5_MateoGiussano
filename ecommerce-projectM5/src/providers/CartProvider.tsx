import { useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import { CartContext } from "../contexts/CartContext";
import { cartReducer, initialCartState, getCartTotal, getCartCount } from "../reducers/cartReducer";
import type { CartState } from "../reducers/cartReducer";
import type { Product } from "../types/product";

const CART_STORAGE_KEY = "iphonix-cart";

function loadCartFromStorage(fallback: CartState): CartState {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as CartState) : fallback;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState, loadCartFromStorage);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const value = useMemo(
    () => ({
      items: state.items,
      totalPrice: getCartTotal(state.items),
      totalItems: getCartCount(state.items),
      addItem: (product: Product) => dispatch({ type: "ADD_ITEM", product }),
      removeItem: (productId: string) => dispatch({ type: "REMOVE_ITEM", productId }),
      updateQuantity: (productId: string, quantity: number) =>
        dispatch({ type: "UPDATE_QUANTITY", productId, quantity }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
    }),
    [state.items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
