import { Link, useParams } from "react-router-dom";
import { Loading } from "../components/ui/Loading";
import { OrderStatusBadge } from "../components/ui/OrderStatusBadge";
import { useOrder } from "../hooks/useOrder";
import { formatOrderDate } from "../utils/formatDate";
import { formatPrice } from "../utils/formatPrice";

export function OrderDetailPage() {
  const { id } = useParams();
  const { order, loading, error } = useOrder(id);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <p className="py-10 text-center text-danger">{error}</p>;
  }

  if (!order) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted">No encontramos esta orden.</p>
        <Link to="/orders" className="mt-3 inline-block text-primary hover:underline">
          Volver a mis órdenes
        </Link>
      </div>
    );
  }

  return (
    <section>
      <Link to="/orders" className="text-sm text-muted hover:text-foreground">
        ← Volver a mis órdenes
      </Link>

      <div className="mt-4 rounded-lg border border-border bg-card p-4 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Orden #{order.id.slice(0, 8)}</h2>
            <p className="mt-1 text-sm text-muted">{formatOrderDate(order.createdAt)}</p>
            <p className="font-mono text-xs text-muted">{order.id}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <ul className="mt-4 divide-y divide-border border-t border-border">
          {order.items.map((item) => (
            <li key={item.productId} className="flex items-center gap-4 py-3">
              <img
                src={item.image}
                alt={item.name}
                className="h-14 w-14 rounded-md bg-surface object-contain p-1"
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="font-medium">{item.name}</span>
                <span className="text-sm text-muted">
                  {item.quantity} × {formatPrice(item.price)}
                </span>
              </div>
              <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-2 flex justify-end border-t border-border pt-4">
          <span className="text-xl font-semibold">Total: {formatPrice(order.total)}</span>
        </div>
      </div>
    </section>
  );
}
