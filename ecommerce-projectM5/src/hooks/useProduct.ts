import { useEffect, useState } from "react";
import { getProductById } from "../services/productService";
import type { Product } from "../types/product";

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch {
        setError("No pudimos cargar el producto. Intentá de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  return { product, loading, error };
}