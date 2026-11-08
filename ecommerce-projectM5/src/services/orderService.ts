import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { db } from "./firebase";
import { getCartTotal } from "../reducers/cartReducer";
import type { CartItem } from "../types/cartItem";
import type { Order, OrderItem, OrderStatus } from "../types/order";

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

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const ordersQuery = query(
    collection(db, "orders"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(ordersQuery);

  return snapshot.docs.map((orderDoc) => ({
    id: orderDoc.id,
    ...(orderDoc.data() as Omit<Order, "id">),
  }));
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const orderDoc = await getDoc(doc(db, "orders", orderId));
    if (!orderDoc.exists()) {
      return null;
    }
    return { id: orderDoc.id, ...(orderDoc.data() as Omit<Order, "id">) };
  } catch (error) {
    if (error instanceof FirebaseError && error.code === "permission-denied") {
      return null;
    }
    throw error;
  }
}

export async function getAllOrders(status?: OrderStatus): Promise<Order[]> {
  const ordersCollection = collection(db, "orders");
  const ordersQuery = status
    ? query(ordersCollection, where("status", "==", status), orderBy("createdAt", "desc"))
    : query(ordersCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(ordersQuery);

  return snapshot.docs.map((orderDoc) => ({
    id: orderDoc.id,
    ...(orderDoc.data() as Omit<Order, "id">),
  }));
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(db, "orders", orderId), {
    status,
    updatedAt: serverTimestamp(),
  });
}
