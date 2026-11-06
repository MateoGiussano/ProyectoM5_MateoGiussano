import { useAdminProducts } from "../../hooks/useAdminProducts";

export function AdminProductsPage() {
  const { products, loading, error } = useAdminProducts();

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  return <h2 className="text-xl font-semibold tracking-tight">Productos ({products.length})</h2>;
}
