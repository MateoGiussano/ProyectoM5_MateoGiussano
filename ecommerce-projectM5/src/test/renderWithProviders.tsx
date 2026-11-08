import { render } from "@testing-library/react";
import type { User as FirebaseUser } from "firebase/auth";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { AuthProvider } from "../providers/AuthProvider";
import { CartProvider } from "../providers/CartProvider";
import { FavoritesProvider } from "../providers/FavoritesProvider";
import { getUserRole, subscribeToAuthChanges } from "../services/authService";
import type { CartItem } from "../types/cartItem";
import type { UserRole } from "../types/user";

export interface ProvidersOptions {
  route?: string;
  cartItems?: CartItem[];
  user?: FirebaseUser | null;
  role?: UserRole;
}

export function createWrapper({
  route = "/",
  cartItems,
  user = null,
  role = "customer",
}: ProvidersOptions = {}) {
  if (cartItems) {
    localStorage.setItem("iphonix-cart", JSON.stringify({ items: cartItems }));
  }

  vi.mocked(subscribeToAuthChanges).mockImplementation((callback) => {
    callback(user);
    return () => {};
  });
  vi.mocked(getUserRole).mockResolvedValue(role);

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>{children}</FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };
}

export function renderWithProviders(ui: ReactElement, options?: ProvidersOptions) {
  return render(ui, { wrapper: createWrapper(options) });
}
