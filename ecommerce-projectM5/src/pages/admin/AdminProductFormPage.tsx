import { Link, useNavigate, useParams } from "react-router-dom";
import { ProductForm } from "../../components/admin/ProductForm";
import { Loading } from "../../components/ui/Loading";
import { useAdminProducts } from "../../hooks/useAdminProducts";
import type { ProductInput } from "../../types/product";
import {
  emptyProductForm,
  getChangedFields,
  productToFormFields,
  toProductInput,
} from "../../utils/productForm";

export function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, getProductById, createProduct, updateProduct } = useAdminProducts();
  const isEditing = Boolean(id);

  if (isEditing && loading) {
    return <Loading />;
  }

  if (isEditing && error) {
    return <p className="py-10 text-center text-danger">{error}</p>;
  }

  const product = id ? getProductById(id) : null;

  if (isEditing && !product) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted">No encontramos este producto.</p>
        <Link to="/admin/products" className="mt-3 inline-block text-primary hover:underline">
          Volver a productos
        </Link>
      </div>
    );
  }

  async function handleCreate(input: ProductInput) {
    await createProduct(input);
    navigate("/admin/products", { state: { message: `Se creó "${input.name}".` } });
  }

  async function handleUpdate(input: ProductInput) {
    if (!product) {
      return;
    }

    const original = toProductInput(productToFormFields(product));
    const changes = getChangedFields(original, input);

    if (Object.keys(changes).length === 0) {
      navigate("/admin/products", { state: { message: "No había cambios para guardar." } });
      return;
    }

    await updateProduct(product.id, changes);
    navigate("/admin/products", {
      state: { message: `Se guardaron los cambios de "${input.name}".` },
    });
  }

  return (
    <>
      <Link to="/admin/products" className="text-sm text-muted hover:text-foreground">
        ← Volver a productos
      </Link>
      <h2 className="mt-2 mb-4 text-xl font-semibold tracking-tight">
        {isEditing ? "Editar producto" : "Nuevo producto"}
      </h2>

      <ProductForm
        key={id ?? "new"}
        initialValues={product ? productToFormFields(product) : emptyProductForm}
        submitLabel={isEditing ? "Guardar cambios" : "Crear producto"}
        onSubmit={isEditing ? handleUpdate : handleCreate}
        onCancel={() => navigate("/admin/products")}
      />
    </>
  );
}
