import type { Product } from "../../types/product";
import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { FavoriteButton } from "./FavoriteButton";

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  const { items, addItem } = useCart();

  function getQuantityInCart(productId: string): number {
    return items.find((item) => item.product.id === productId)?.quantity ?? 0;
  }

  return (
    <section>
      {products.length === 0 ? (
        <p className="py-10 text-center text-muted">No hay productos para mostrar.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.id}
              className="flex flex-col rounded-lg border border-border bg-card p-3 transition hover:shadow-md"
            >
              <div className="relative rounded-md bg-surface p-4">
                <Link to={`/products/${product.id}`}>
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="h-32 w-full object-contain md:h-40"
                    />
                  )}
                </Link>

                <FavoriteButton
                  productId={product.id}
                  productName={product.name}
                  className="absolute top-2 right-2"
                />
              </div>

              <div className="mt-3 flex flex-1 flex-col gap-1">
                <Link to={`/products/${product.id}`} className="hover:underline">
                  <h3 className="text-sm font-medium">{product.name}</h3>
                </Link>
                <p className="text-lg font-semibold">${product.price}</p>
                <p className="text-xs text-muted">
                  Stock: {product.stock - getQuantityInCart(product.id)}
                </p>
              </div>

              <button
                onClick={() => addItem(product)}
                disabled={getQuantityInCart(product.id) >= product.stock}
                className="mt-3 w-full rounded-full bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
              >
                {product.stock === 0
                  ? "Sin stock"
                  : getQuantityInCart(product.id) >= product.stock
                    ? "Máximo en carrito"
                    : "Agregar al carrito"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
