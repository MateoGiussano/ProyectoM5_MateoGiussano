import { Link, useParams } from "react-router-dom";
import { Loading } from "../components/ui/Loading";
import { useProduct } from "../hooks/useProduct";
import { useCart } from "../hooks/useCart";
import { FavoriteButton } from "../components/common/FavoriteButton";

export function ProductDetailPage() {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);
  const { items, addItem } = useCart();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <p className="py-10 text-center text-danger">{error}</p>;
  }

  if (!product) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted">No encontramos este producto.</p>
        <Link to="/" className="mt-3 inline-block text-primary hover:underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const quantityInCart = items.find((item) => item.product.id === product.id)?.quantity ?? 0;
  const hasStock = product.stock > 0;
  const canAdd = quantityInCart < product.stock;

  return (
    <section>
      <Link to="/" className="text-sm text-muted hover:text-foreground">
        ← Volver al catálogo
      </Link>

      <div className="mt-4 grid gap-6 rounded-lg border border-border bg-card p-4 md:grid-cols-2 md:p-6">
        <div className="flex items-center justify-center rounded-md bg-surface p-6">
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="h-64 w-full object-contain md:h-80"
            />
          )}
        </div>

        <div className="flex flex-col gap-3">
          <span className="w-fit rounded-full bg-surface px-3 py-1 text-xs text-muted">
            {product.category}
          </span>

          <div className="flex items-start justify-between gap-3">
  <h2 className="text-2xl font-semibold tracking-tight">{product.name}</h2>
  <FavoriteButton productId={product.id} productName={product.name} className="text-xl" />
</div>
          <p className="text-3xl font-semibold">${product.price}</p>
          <p className="text-muted">{product.description}</p>

          <p className={hasStock ? "text-sm text-muted" : "text-sm text-danger"}>
            {hasStock ? `Stock disponible: ${product.stock}` : "Sin stock"}
          </p>

            <button
            disabled={!canAdd}
            onClick={() => addItem(product)}
            className="mt-2 rounded-full bg-primary py-3 font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 md:w-64"
            >
            {!hasStock ? "Sin stock" : canAdd ? "Agregar al carrito" : "Máximo en carrito"}
            </button>

{quantityInCart > 0 && (
  <p className="text-sm text-muted">
    Tenés {quantityInCart} en el carrito.{" "}
    <Link to="/cart" className="text-primary hover:underline">
      Ver carrito
    </Link>
  </p>
)}
        </div>
      </div>
    </section>
  );
}