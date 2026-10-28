import { CartList } from "../components/common/CartList";

export function CartPage() {
  return (
    <>
      <h2 className="mb-4 text-xl font-semibold tracking-tight">Mi carrito</h2>
      <CartList />
    </>
  );
}