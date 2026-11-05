import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { getCartTotal } from "../reducers/cartReducer";
import type { CartItem } from "../types/cartItem";
import type { OrderItem } from "../types/order";

export async function createOrder(
  userId: string,
  userEmail: string,
  cartItems: CartItem[],
): Promise<string> {
  const items: OrderItem[] = cartItems.map((item) => ({
    productId: item.product.id,
    name: item.product.name,
    price: item.product.price,
    image: item.product.image,
    quantity: item.quantity,
  }));

  const orderRef = await addDoc(collection(db, "orders"), {
    userId,
    userEmail,
    items,
    total: getCartTotal(cartItems),
    status: "pending",
    createdAt: serverTimestamp(),
  });

  return orderRef.id;
}