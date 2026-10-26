import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import type { Product } from "../types/product";

export async function getProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, "products"));

  return snapshot.docs.map((productDoc) => ({
    id: productDoc.id,
    ...(productDoc.data() as Omit<Product, "id">),
  }));
}