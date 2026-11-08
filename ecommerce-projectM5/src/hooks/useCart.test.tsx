import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { cartItemFixture, productFixture } from "../test/fixtures";
import { createWrapper } from "../test/renderWithProviders";
import { useCart } from "./useCart";

describe("useCart", () => {
  it("sumar el mismo producto dos veces acumula cantidad y total", () => {
    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() });

    act(() => {
      result.current.addItem(productFixture);
      result.current.addItem(productFixture);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(2000);
  });

  it("bajar la cantidad a 0 elimina el producto y resetea los totales", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper({ cartItems: [cartItemFixture] }),
    });

    act(() => result.current.updateQuantity(productFixture.id, 0));

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it("eliminar un producto que no está en el carrito no cambia nada", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper({ cartItems: [cartItemFixture] }),
    });

    act(() => result.current.removeItem("no-existe"));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(2);
  });

  it("vaciar el carrito resetea los totales", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: createWrapper({ cartItems: [cartItemFixture] }),
    });

    act(() => result.current.clearCart());

    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it("el carrito sobrevive a recargar la página", () => {
    const first = renderHook(() => useCart(), { wrapper: createWrapper() });
    act(() => first.result.current.addItem(productFixture));
    first.unmount();

    const second = renderHook(() => useCart(), { wrapper: createWrapper() });
    expect(second.result.current.totalItems).toBe(1);
  });

  it("avisa con un error claro si se usa fuera del CartProvider", () => {
    expect(() => renderHook(() => useCart())).toThrow(
      "useCart debe usarse dentro de un CartProvider",
    );
  });
});
