import type { JSX } from "react";
import { Header } from "./components/common/Header";
import { ProductList } from "./components/common/ProductList";
import { CartList } from "./components/common/CartList";
import { useAuth } from "./hooks/useAuth";
import { loginWithGoogle, loginWithEmail, logout } from "./services/authService";

function App(): JSX.Element {
  const { user, role, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <p>{loading ? "Cargando..." : user ? `${user.email} — ${role}` : "Sin sesión"}</p>
        <button onClick={() => loginWithGoogle()}>Google</button>{" "}
        <button onClick={() => loginWithEmail("prueba@test.com", "123456")}>Prueba</button>{" "}
        <button onClick={() => logout()}>Salir</button>
        <ProductList />
        <CartList />
      </main>
    </div>
  );
}

export default App;
