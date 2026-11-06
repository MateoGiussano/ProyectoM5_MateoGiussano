import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ProductsTable } from "../../components/admin/ProductsTable";
import { ProductsTableSkeleton } from "../../components/admin/ProductsTableSkeleton";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { useAdminProducts } from "../../hooks/useAdminProducts";
import { getFirestoreErrorMessage } from "../../utils/getFirestoreErrorMessage";
import type { Product } from "../../types/product";

interface ActionMessage {
  type: "success" | "error";
  text: string;
}

export function AdminProductsPage() {
  const { products, loading, error, reloadProducts, deleteProduct } = useAdminProducts();
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const location = useLocation();
  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(() => {
    const message = (location.state as { message?: string } | null)?.message;
    return message ? { type: "success", text: message } : null;
  });

  async function handleConfirmDelete() {
    if (!productToDelete) {
      return;
    }

    const product = productToDelete;
    setProductToDelete(null);
    setDeletingId(product.id);
    setActionMessage(null);

    try {
      await deleteProduct(product.id);
      setActionMessage({ type: "success", text: `Se eliminó "${product.name}".` });
    } catch (err) {
      console.error("Error al eliminar el producto:", err);
      setActionMessage({
        type: "error",
        text: getFirestoreErrorMessage(
          err,
          `No se pudo eliminar "${product.name}". Intentá de nuevo.`,
        ),
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Productos</h2>
          {!loading && !error && (
            <p className="text-sm text-muted">{products.length} en el catálogo</p>
          )}
        </div>
        <Link
          to="/admin/products/new"
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          + Nuevo producto
        </Link>
      </div>

      {actionMessage && (
        <p
          role="status"
          className={`mb-3 rounded-md p-3 text-sm ${
            actionMessage.type === "success"
              ? "bg-success/15 text-success"
              : "bg-danger/15 text-danger"
          }`}
        >
          {actionMessage.text}
        </p>
      )}

      {loading ? (
        <ProductsTableSkeleton />
      ) : error ? (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-danger">{error}</p>
          <button
            onClick={reloadProducts}
            className="mt-3 rounded-full border border-border px-4 py-1.5 text-sm hover:bg-surface"
          >
            Reintentar
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-muted">No hay productos en el catálogo.</p>
          <Link to="/admin/products/new" className="mt-3 inline-block text-primary hover:underline">
            Crear el primero
          </Link>
        </div>
      ) : (
        <ProductsTable products={products} deletingId={deletingId} onDelete={setProductToDelete} />
      )}

      <ConfirmDialog
        isOpen={productToDelete !== null}
        title="Eliminar producto"
        message={`¿Seguro que querés eliminar "${productToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setProductToDelete(null)}
      />
    </>
  );
}
