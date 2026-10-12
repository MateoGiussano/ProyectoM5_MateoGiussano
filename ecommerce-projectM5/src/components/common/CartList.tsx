export function CartList() {
  return (
    <section className="mt-10 rounded-lg border border-border bg-card p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Mi carrito</h2>
        <button
          onClick={() => window.confirm("¿Vaciar carrito?")}
          className="text-sm text-danger hover:underline"
        >
          Vaciar carrito
        </button>
      </div>

      <ul className="mt-4 divide-y divide-border">
        <li className="flex items-center justify-between gap-4 py-3">
          <div className="flex flex-col">
            <span className="font-medium">Nombre del producto</span>
            <span className="text-sm text-muted">Cantidad: --</span>
          </div>
          <button
            onClick={() => window.confirm("¿Quitar del carrito?")}
            aria-label="Quitar del carrito"
            className="rounded-full px-3 py-1 text-sm text-muted hover:bg-surface hover:text-danger"
          >
            Quitar
          </button>
        </li>
      </ul>

      <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-muted">Productos: --</span>
        <span className="text-lg font-semibold">Total: $--</span>
      </div>
    </section>
  );
}