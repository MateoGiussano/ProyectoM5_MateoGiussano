import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Product, ProductInput } from "../types/product";

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

export async function createProduct(product: ProductInput): Promise<string> {
  const productRef = await addDoc(collection(db, "products"), {
    ...product,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return productRef.id;
}

export async function updateProduct(id: string, changes: Partial<ProductInput>): Promise<void> {
  await updateDoc(doc(db, "products", id), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, "products", id));
}
