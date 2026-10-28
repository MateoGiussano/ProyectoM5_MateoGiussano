import { Link } from "react-router-dom";
import { ProductList } from "../components/common/ProductList";
import { Loading } from "../components/ui/Loading";
import { useProducts } from "../hooks/useProducts";
import { useFavorites } from "../hooks/useFavorites";

export function FavoritesPage() {
  const { products, loading, error } = useProducts();
  const { favoriteIds } = useFavorites();

  const favoriteProducts = products.filter((product) => favoriteIds.includes(product.id));

  return (
    <>
      <h2 className="mb-4 text-xl font-semibold tracking-tight">Mis favoritos</h2>

      {loading ? (
        <Loading />
      ) : error ? (
        <p className="py-10 text-center text-danger">{error}</p>
      ) : favoriteProducts.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-muted">Todavía no tenés productos favoritos.</p>
          <p className="mt-1 text-sm text-muted">Tocá el 🤍 de un producto para guardarlo acá.</p>
          <Link to="/" className="mt-3 inline-block text-primary hover:underline">
            Ver productos
          </Link>
        </div>
      ) : (
        <ProductList products={favoriteProducts} />
      )}
    </>
  );
}
