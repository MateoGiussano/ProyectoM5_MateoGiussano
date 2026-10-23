import type { JSX } from "react";
import { Header } from "./components/common/Header";
import { ProductList } from "./components/common/ProductList";
import { CartList } from "./components/common/CartList";


function App(): JSX.Element {
  return (
     <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
      <ProductList />
      <CartList />
      </main>
    </div>
  );
}


export default App; 