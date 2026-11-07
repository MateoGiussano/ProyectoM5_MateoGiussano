import type { ProductCategory } from "./product";

export interface ProductFormFields {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: ProductCategory | "";
  image: string;
}

export interface ProductFormErrors {
  name?: string;
  price?: string;
  stock?: string;
  category?: string;
}

export type ProductFormStatus = "editing" | "uploading" | "submitting" | "error";
