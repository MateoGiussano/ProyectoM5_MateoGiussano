import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { createOrder } from "../services/orderService";
import { formatPrice } from "../utils/formatPrice";

export function CheckoutPage() {
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const isSubmittingRef = useRef(false);

  async function handleConfirmOrder() {
    if (!user || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      const orderId = await createOrder(user.uid, user.email ?? "", items);
      clearCart();
      setCreatedOrderId(orderId);
    } catch (err) {
      console.error("Error al crear la orden:", err);
      setError(
        "No pudimos confirmar tu compra. Tu carrito sigue intacto: probá de nuevo en unos segundos.",
      );
    } finally {
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  }

  if (createdOrderId) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-4xl">✅</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">¡Compra confirmada!</h2>
        <p className="mt-2 text-sm text-muted">Número de orden:</p>
        <p className="font-mono text-sm">{createdOrderId}</p>
        <div className="mt-4 flex flex-col gap-2">
          <Link
            to={`/orders/${createdOrderId}`}
            className="rounded-full bg-primary py-2 font-medium text-primary-foreground hover:bg-primary-hover"
          >
            Ver detalle de la orden
          </Link>
          <Link to="/" className="text-sm text-primary hover:underline">
            Seguir comprando
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-muted">No hay productos para comprar.</p>
        <Link to="/" className="mt-3 inline-block text-primary hover:underline">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="mb-4 text-xl font-semibold tracking-tight">Finalizar compra</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-lg border border-border bg-card p-4 md:col-span-2 md:p-6">
          <h3 className="font-semibold">Resumen</h3>
          <ul className="mt-3 divide-y divide-border">
            {items.map((item) => (
              <li key={item.product.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 flex-col">
                  <span className="font-medium">{item.product.name}</span>
                  <span className="text-sm text-muted">
                    {item.quantity} × {formatPrice(item.product.price)}
                  </span>
                </div>
                <span className="font-semibold">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <Link to="/cart" className="mt-3 inline-block text-sm text-primary hover:underline">
            ← Modificar carrito
          </Link>
        </section>
        <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 md:p-6">
          <h3 className="font-semibold">Pago</h3>
          <p className="rounded-md bg-surface p-3 text-sm text-muted">
            💳 Pago simulado: no se realiza ningún cobro real.
          </p>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-muted">Total</span>
            <span className="text-xl font-semibold">{formatPrice(totalPrice)}</span>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            onClick={handleConfirmOrder}
            disabled={submitting}
            className="rounded-full bg-primary py-3 font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
          >
            {submitting ? "Procesando..." : "Confirmar compra"}
          </button>
        </section>
      </div>
    </>
  );
}
