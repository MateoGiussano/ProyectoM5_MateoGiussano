import { createContext } from "react";
import type { Product, ProductInput } from "../types/product";

export interface AdminProductsContextValue {
  products: Product[];
  loading: boolean;
  error: string;
  reloadProducts: () => Promise<void>;
  getProductById: (id: string) => Product | null;
  createProduct: (product: ProductInput) => Promise<string>;
  updateProduct: (id: string, changes: Partial<ProductInput>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const AdminProductsContext = createContext<AdminProductsContextValue | null>(null);
