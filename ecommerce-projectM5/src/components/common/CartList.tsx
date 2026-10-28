import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../utils/formatPrice";
import { ConfirmDialog } from "../ui/ConfirmDialog";

export function CartList() {
  const { items, totalPrice, totalItems, updateQuantity, removeItem, clearCart } = useCart();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-muted">Tu carrito está vacío.</p>
        <Link to="/" className="mt-3 inline-block text-primary hover:underline">
          Ver productos
        </Link>
      </div>
    );
  }

  function handleConfirmClear() {
    clearCart();
    setIsConfirmOpen(false);
  }

  return (
    <section className="rounded-lg border border-border bg-card p-4 md:p-6">
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.product.id} className="flex flex-wrap items-center gap-4 py-4">
            <img
              src={item.product.image}
              alt={item.product.name}
              className="h-16 w-16 rounded-md bg-surface object-contain p-1"
            />

            <div className="flex min-w-0 flex-1 flex-col">
              <Link to={`/products/${item.product.id}`} className="font-medium hover:underline">
                {item.product.name}
              </Link>
              <span className="text-sm text-muted">{formatPrice(item.product.price)} c/u</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                aria-label={`Quitar una unidad de ${item.product.name}`}
                className="h-8 w-8 rounded-full border border-border hover:bg-surface"
              >
                −
              </button>
              <span className="w-6 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                disabled={item.quantity >= item.product.stock}
                aria-label={`Agregar una unidad de ${item.product.name}`}
                className="h-8 w-8 rounded-full border border-border hover:bg-surface disabled:opacity-50"
              >
                +
              </button>
            </div>

            <span className="w-24 text-right font-semibold">
              {formatPrice(item.product.price * item.quantity)}
            </span>

            <button
              onClick={() => removeItem(item.product.id)}
              className="text-sm text-muted hover:text-danger"
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 md:flex-row md:items-end md:justify-between">
        <button onClick={() => setIsConfirmOpen(true)} className="w-fit text-sm text-danger hover:underline">
          Vaciar carrito
        </button>

        <div className="flex flex-col items-end gap-2">
          <span className="text-sm text-muted">
            {totalItems} {totalItems === 1 ? "producto" : "productos"}
          </span>
          <span className="text-xl font-semibold">Total: {formatPrice(totalPrice)}</span>
          <Link
            to="/checkout"
            className="rounded-full bg-primary px-6 py-2 font-medium text-primary-foreground hover:bg-primary-hover"
          >
            Finalizar compra
          </Link>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="¿Vaciar el carrito?"
        message="Se van a quitar todos los productos. Esta acción no se puede deshacer."
        confirmLabel="Vaciar"
        onConfirm={handleConfirmClear}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </section>
  );
}