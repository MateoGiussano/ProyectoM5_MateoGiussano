import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductList } from "../components/common/ProductList";
import { CategoryFilter } from "../components/common/CategoryFilter";
import { Loading } from "../components/ui/Loading";
import { useProducts } from "../hooks/useProducts";
import { useDebounce } from "../hooks/useDebounce";
import type { ProductCategory } from "../types/product";

export function HomePage() {
  const { products, loading, error } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const searchTerm = searchParams.get("search") ?? "";

  const debouncedSearch = useDebounce(searchTerm, 400);
  const normalizedSearch = debouncedSearch.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === null || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });

  function handleClearFilters() {
    setSearchParams({}, { replace: true });
    setSelectedCategory(null);
  }

  return (
    <>
      <h2 className="mb-4 text-xl font-semibold tracking-tight">Productos</h2>

      {loading ? (
        <Loading />
      ) : error ? (
        <p className="py-10 text-center text-danger">{error}</p>
      ) : (
        <>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {filteredProducts.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted">No encontramos productos que coincidan con tu búsqueda.</p>
              <button
                onClick={handleClearFilters}
                className="mt-3 rounded-full border border-border px-4 py-1.5 text-sm hover:bg-surface"
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <ProductList products={filteredProducts} />
          )}
        </>
      )}
    </>
  );
}
