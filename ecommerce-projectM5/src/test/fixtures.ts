import type { User as FirebaseUser } from "firebase/auth";
import type { CartItem } from "../types/cartItem";
import type { Product } from "../types/product";

export const productFixture: Product = {
  id: "p_1",
  name: "iPhone 17",
  description: "Producto de prueba",
  price: 1000,
  stock: 5,
  category: "iPhone",
  image: "https://example.com/iphone-17.webp",
};

export const cartItemFixture: CartItem = { product: productFixture, quantity: 2 };

export const customerUserFixture = { uid: "u_customer", email: "cliente@test.com" } as FirebaseUser;

export const adminUserFixture = { uid: "u_admin", email: "admin@test.com" } as FirebaseUser;
