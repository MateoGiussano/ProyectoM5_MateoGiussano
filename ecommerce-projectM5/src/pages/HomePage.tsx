import { ProductList } from "../components/common/ProductList";
import { CartList } from "../components/common/CartList";
import { Loading } from "../components/ui/Loading";
import { useProducts } from "../hooks/useProducts";

export function HomePage() {
  const { products, loading, error } = useProducts();

  return (
    <>
      {loading ? (
        <Loading />
      ) : error ? (
        <p className="py-10 text-center text-danger">{error}</p>
      ) : (
        <ProductList products={products} />
      )}
      <CartList />
    </>
  );
}