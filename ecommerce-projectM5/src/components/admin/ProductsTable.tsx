import { Link } from "react-router-dom";
import type { Product } from "../../types/product";
import { formatPrice } from "../../utils/formatPrice";

interface ProductRowProps {
  product: Product;
  isDeleting: boolean;
  onDelete: (product: Product) => void;
}

function ProductRow({ product, isDeleting, onDelete }: ProductRowProps) {
  return (
    <tr className={isDeleting ? "opacity-50" : ""}>
      <td className="px-3 py-2">
        <img
          src={product.image}
          alt={product.name}
          className="h-12 w-12 rounded-md bg-surface object-contain p-1"
        />
      </td>
      <td className="px-3 py-2">
        <span className="font-medium">{product.name}</span>
        <span className="block text-xs text-muted">{product.category}</span>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">{formatPrice(product.price)}</td>
      <td className={`px-3 py-2 ${product.stock === 0 ? "font-medium text-danger" : ""}`}>
        {product.stock}
      </td>
      <td className="px-3 py-2">
        <div className="flex gap-2">
          <Link
            to={`/admin/products/${product.id}/edit`}
            aria-disabled={isDeleting}
            className={`rounded-full border border-border px-3 py-1 text-sm hover:bg-surface ${
              isDeleting ? "pointer-events-none" : ""
            }`}
          >
            Editar
          </Link>
          <button
            onClick={() => onDelete(product)}
            disabled={isDeleting}
            className="rounded-full px-3 py-1 text-sm text-danger hover:bg-surface disabled:opacity-50"
          >
            {isDeleting ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </td>
    </tr>
  );
}

interface ProductsTableProps {
  products: Product[];
  deletingId: string | null;
  onDelete: (product: Product) => void;
}

export function ProductsTable({ products, deletingId, onDelete }: ProductsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead className="border-b border-border text-xs text-muted uppercase">
          <tr>
            <th className="px-3 py-2">Imagen</th>
            <th className="px-3 py-2">Nombre</th>
            <th className="px-3 py-2">Precio</th>
            <th className="px-3 py-2">Stock</th>
            <th className="px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              isDeleting={deletingId === product.id}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
