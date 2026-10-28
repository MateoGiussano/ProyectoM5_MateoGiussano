export type ProductCategory = "iPhone" | "iPad" | "Mac" | "Apple Watch" | "AirPods" | "Accesorios";

export interface Product {
  id: string;
  name: string;
  image: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
}
