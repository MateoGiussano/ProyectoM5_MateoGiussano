import type { Product } from "../../types/product";

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold tracking-tight">Productos</h2>

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
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-32 w-full object-contain md:h-40"
                  />
                )}
                <button
                  onClick={() => window.confirm("¿Agregar a favoritos?")}
                  aria-label="Agregar a favoritos"
                  className="absolute top-2 right-2 rounded-full bg-card p-1.5 text-sm shadow-sm hover:scale-110"
                >
                  🤍
                </button>
              </div>

              <div className="mt-3 flex flex-1 flex-col gap-1">
                <h3 className="text-sm font-medium">{product.name}</h3>
                <p className="text-lg font-semibold">${product.price}</p>
                <p className="text-xs text-muted">Stock: {product.stock}</p>
              </div>

              <button
                onClick={() => window.confirm("¿Agregar al carrito?")}
                className="mt-3 w-full rounded-full bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
              >
                Agregar al carrito
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}