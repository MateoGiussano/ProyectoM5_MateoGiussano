import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import type { Product } from "../types/product";

export async function getProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, "products"));

  return snapshot.docs.map((productDoc) => ({
    id: productDoc.id,
    ...(productDoc.data() as Omit<Product, "id">),
  }));
}

export async function getProductById(id: string): Promise<Product | null> {
  const productDoc = await getDoc(doc(db, "products", id));

  if (!productDoc.exists()) {
    return null;
  }

  return {
    id: productDoc.id,
    ...(productDoc.data() as Omit<Product, "id">),
  };
}
