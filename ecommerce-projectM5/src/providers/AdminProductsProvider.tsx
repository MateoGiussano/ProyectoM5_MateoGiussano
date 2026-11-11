import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AdminProductsContext } from "../contexts/AdminProductsContext";
import * as productService from "../services/productService";
import { getFirestoreErrorMessage } from "../utils/getFirestoreErrorMessage";
import type { Product, ProductInput } from "../types/product";

function sortByNewest(products: Product[]): Product[] {
  return [...products].sort(
    (a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0),
  );
}

export function AdminProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      const data = await productService.getProducts();
      setProducts(sortByNewest(data));
      setError("");
    } catch (err) {
      console.error("Error al cargar los productos:", err);
      setError(getFirestoreErrorMessage(err, "No pudimos cargar los productos."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function loadInitialProducts() {
      await fetchProducts();
    }

    loadInitialProducts();
  }, [fetchProducts]);

  const reloadProducts = useCallback(async () => {
    setLoading(true);
    await fetchProducts();
  }, [fetchProducts]);

  const createProduct = useCallback(
    async (product: ProductInput) => {
      const id = await productService.createProduct(product);
      await fetchProducts();
      return id;
    },
    [fetchProducts],
  );

  const updateProduct = useCallback(
    async (id: string, changes: Partial<ProductInput>) => {
      await productService.updateProduct(id, changes);
      await fetchProducts();
    },
    [fetchProducts],
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      await productService.deleteProduct(id);
      await fetchProducts();
    },
    [fetchProducts],
  );

  const value = useMemo(
    () => ({
      products,
      loading,
      error,
      reloadProducts,
      getProductById: (id: string) => products.find((product) => product.id === id) ?? null,
      createProduct,
      updateProduct,
      deleteProduct,
    }),
    [products, loading, error, reloadProducts, createProduct, updateProduct, deleteProduct],
  );

  return <AdminProductsContext.Provider value={value}>{children}</AdminProductsContext.Provider>;
}
