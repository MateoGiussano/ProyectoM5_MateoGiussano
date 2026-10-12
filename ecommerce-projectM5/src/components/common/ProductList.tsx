import type { Product } from "../../types/product";

export function ProductList() {
  // Productos de prueba: más adelante van a venir de Firestore
  const products: Product[] = [
    {
      id: "1",
      name: "iPhone 15",
      image: "/products/iphone-15.png",
      description:
        "iPhone con Dynamic Island, cámara de 48 MP y puerto USB-C.",
      price: 799.99,
      stock: 10,
      category: "Estándar",
    },
    {
      id: "2",
      name: "iPhone 16",
      image: "/products/iphone-16.png",
      description:
        "iPhone con botón de Acción, Control de Cámara y gran autonomía.",
      price: 899.99,
      stock: 8,
      category: "Estándar",
    },
    {
      id: "3",
      name: "iPhone 16 Pro",
      image: "/products/iphone-16-pro.png",
      description:
        "iPhone Pro con diseño de titanio, triple cámara y pantalla ProMotion.",
      price: 1199.99,
      stock: 5,
      category: "Pro",
    },
    {
      id: "4",
      name: "iPhone 17",
      image: "/products/iphone-17.png",
      description:
        "iPhone de última generación con mejor rendimiento y cámara mejorada.",
      price: 999.99,
      stock: 6,
      category: "Estándar",
    },
    {
      id: "5",
      name: "iPhone 17 Pro",
      image: "/products/iphone-17-pro.png",
      description:
        "El iPhone más potente, con cámara profesional y máxima autonomía.",
      price: 1299.99,
      stock: 3,
      category: "Pro",
    },
  ];

    return (
    <section>
      <h2 className="mb-4 text-xl font-semibold tracking-tight">Productos</h2>

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
    </section>
  );
}