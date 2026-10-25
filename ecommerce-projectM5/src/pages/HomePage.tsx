import { ProductList } from "../components/common/ProductList";
import { CartList } from "../components/common/CartList";

export function HomePage() {
  return (
    <>
      <ProductList />
      <CartList />
    </>
  );
}