export function ProductList() {
  // Productos de prueba: más adelante van a venir de Firestore
  const products = [
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
    <div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
        {products.map((product) => (
          <article
            key={product.id}
            className="flex flex-col gap-3 overflow-hidden rounded-md bg-card p-2 text-foreground shadow-sm"
          >
            {}
            <button onClick={() => window.confirm("¿Agregar a favoritos?")}>
              🤍
            </button>

            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="h-45 w-full rounded-md object-contain"
              />
            )}

            <h3 className="pl-4 font-semibold">{product.name}</h3>
            <p className="pl-4">${product.price}</p>
            <p className="pl-4 text-muted">Stock: {product.stock}</p>

            {}
            <button
              onClick={() => window.confirm("¿Agregar al carrito?")}
              className="bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              Agregar al carrito
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}