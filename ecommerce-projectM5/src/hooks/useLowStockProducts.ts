import { useEffect, useState } from "react";
import { getLowStockProducts } from "../services/productService";
import type { Product } from "../types/product";

export function useLowStockProducts(maxStock: number, count: number) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    getLowStockProducts(maxStock, count)
      .then((data) => {
        if (!ignore) setProducts(data);
      })
      .catch((err: unknown) => {
        console.error("Error al cargar el stock bajo:", err);
        if (!ignore) setError("No pudimos cargar los productos con stock bajo.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [maxStock, count]);

  return { products, loading, error };
}
