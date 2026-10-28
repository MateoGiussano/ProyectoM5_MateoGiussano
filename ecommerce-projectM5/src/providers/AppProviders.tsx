import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./AuthProvider";
import { CartProvider } from "./CartProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}