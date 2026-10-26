import { useState } from "react";
import { ProductList } from "../components/common/ProductList";
import { CartList } from "../components/common/CartList";
import { CategoryFilter } from "../components/common/CategoryFilter";
import { Loading } from "../components/ui/Loading";
import { useProducts } from "../hooks/useProducts";
import type { ProductCategory } from "../types/product";

export function HomePage() {
  const { products, loading, error } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

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
          <ProductList products={filteredProducts} />
        </>
      )}

      <CartList />
    </>
  );
}