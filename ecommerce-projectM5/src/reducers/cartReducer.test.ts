import { describe, it, expect } from "vitest";
import { cartReducer, initialCartState, getCartTotal, getCartCount } from "./cartReducer";
import type { CartState } from "./cartReducer";
import type { Product } from "../types/product";

function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    name: "iPhone 16",
    image: "/products/iphone-16.png",
    description: "Producto de prueba",
    price: 800,
    stock: 3,
    category: "iPhone",
    ...overrides,
  };
}

describe("cartReducer", () => {
  describe("ADD_ITEM", () => {
    it("agrega un producto nuevo con cantidad 1", () => {
      const product = createProduct();

      const newState = cartReducer(initialCartState, { type: "ADD_ITEM", product });

      expect(newState.items).toHaveLength(1);
      expect(newState.items[0].product.id).toBe("p1");
      expect(newState.items[0].quantity).toBe(1);
    });

    it("suma 1 a la cantidad si el producto ya está en el carrito", () => {
      const product = createProduct();
      const state: CartState = { items: [{ product, quantity: 1 }] };

      const newState = cartReducer(state, { type: "ADD_ITEM", product });

      expect(newState.items).toHaveLength(1);
      expect(newState.items[0].quantity).toBe(2);
    });

    it("no supera el stock disponible", () => {
      const product = createProduct({ stock: 2 });
      const state: CartState = { items: [{ product, quantity: 2 }] };

      const newState = cartReducer(state, { type: "ADD_ITEM", product });

      expect(newState.items[0].quantity).toBe(2);
      expect(newState).toBe(state);
    });

    it("no agrega un producto sin stock", () => {
      const product = createProduct({ stock: 0 });

      const newState = cartReducer(initialCartState, { type: "ADD_ITEM", product });

      expect(newState.items).toHaveLength(0);
    });

    it("no modifica el estado original", () => {
      const product = createProduct();
      const state: CartState = { items: [{ product, quantity: 1 }] };

      cartReducer(state, { type: "ADD_ITEM", product });

      expect(state.items[0].quantity).toBe(1);
    });
  });

  describe("REMOVE_ITEM", () => {
    it("elimina solo el producto indicado", () => {
      const iphone = createProduct({ id: "p1" });
      const ipad = createProduct({ id: "p2", name: "iPad" });
      const state: CartState = {
        items: [
          { product: iphone, quantity: 1 },
          { product: ipad, quantity: 2 },
        ],
      };

      const newState = cartReducer(state, { type: "REMOVE_ITEM", productId: "p1" });

      expect(newState.items).toHaveLength(1);
      expect(newState.items[0].product.id).toBe("p2");
    });
  });

  describe("UPDATE_QUANTITY", () => {
    it("cambia la cantidad de un producto", () => {
      const product = createProduct({ stock: 5 });
      const state: CartState = { items: [{ product, quantity: 1 }] };

      const newState = cartReducer(state, {
        type: "UPDATE_QUANTITY",
        productId: "p1",
        quantity: 4,
      });

      expect(newState.items[0].quantity).toBe(4);
    });

    it("limita la cantidad al stock disponible", () => {
      const product = createProduct({ stock: 3 });
      const state: CartState = { items: [{ product, quantity: 1 }] };

      const newState = cartReducer(state, {
        type: "UPDATE_QUANTITY",
        productId: "p1",
        quantity: 10,
      });

      expect(newState.items[0].quantity).toBe(3);
    });

    it("elimina el producto si la cantidad es 0", () => {
      const product = createProduct();
      const state: CartState = { items: [{ product, quantity: 2 }] };

      const newState = cartReducer(state, {
        type: "UPDATE_QUANTITY",
        productId: "p1",
        quantity: 0,
      });

      expect(newState.items).toHaveLength(0);
    });
  });

  describe("CLEAR_CART", () => {
    it("vacía el carrito", () => {
      const product = createProduct();
      const state: CartState = { items: [{ product, quantity: 2 }] };

      const newState = cartReducer(state, { type: "CLEAR_CART" });

      expect(newState.items).toHaveLength(0);
    });
  });
});

describe("cálculos del carrito", () => {
  it("calcula el total sumando precio por cantidad", () => {
    const items = [
      { product: createProduct({ id: "p1", price: 800 }), quantity: 2 },
      { product: createProduct({ id: "p2", price: 100 }), quantity: 3 },
    ];

    expect(getCartTotal(items)).toBe(1900); // 800×2 + 100×3
  });

  it("cuenta la cantidad total de unidades", () => {
    const items = [
      { product: createProduct({ id: "p1" }), quantity: 2 },
      { product: createProduct({ id: "p2" }), quantity: 3 },
    ];

    expect(getCartCount(items)).toBe(5);
  });

  it("devuelve 0 con el carrito vacío", () => {
    expect(getCartTotal([])).toBe(0);
    expect(getCartCount([])).toBe(0);
  });
});
