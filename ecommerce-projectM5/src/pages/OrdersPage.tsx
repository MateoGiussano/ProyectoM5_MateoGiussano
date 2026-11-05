import { Link } from "react-router-dom";
import { Loading } from "../components/ui/Loading";
import { OrderStatusBadge } from "../components/ui/OrderStatusBadge";
import { useAuth } from "../hooks/useAuth";
import { useOrders } from "../hooks/useOrders";
import { formatOrderDate } from "../utils/formatDate";
import { formatPrice } from "../utils/formatPrice";

export function OrdersPage() {
  const { user } = useAuth();
  const { orders, loading, error } = useOrders(user?.uid);

  return (
    <>
      <h2 className="mb-4 text-xl font-semibold tracking-tight">Mis órdenes</h2>

      {loading ? (
        <Loading />
      ) : error ? (
        <p className="py-10 text-center text-danger">{error}</p>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-muted">Todavía no hiciste ninguna compra.</p>
          <Link to="/" className="mt-3 inline-block text-primary hover:underline">
            Ver productos
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to={`/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 transition hover:shadow-md"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">Orden #{order.id.slice(0, 8)}</span>
                  <span className="text-sm text-muted">{formatOrderDate(order.createdAt)}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted">
                    {order.items.length} {order.items.length === 1 ? "producto" : "productos"}
                  </span>
                  <span className="font-semibold">{formatPrice(order.total)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
