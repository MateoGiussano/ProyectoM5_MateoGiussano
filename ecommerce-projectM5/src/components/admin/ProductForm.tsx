import { useRef, useState } from "react";
import type { FormEvent } from "react";
import type { ProductCategory, ProductInput } from "../../types/product";
import type {
  ProductFormErrors,
  ProductFormFields,
  ProductFormStatus,
} from "../../types/productForm";
import { toProductInput, validateProductForm } from "../../utils/productForm";
import { getFirestoreErrorMessage } from "../../utils/getFirestoreErrorMessage";

const categories: ProductCategory[] = [
  "iPhone",
  "iPad",
  "Mac",
  "Apple Watch",
  "AirPods",
  "Accesorios",
];

type ValidatedField = keyof ProductFormErrors;

interface ProductFormProps {
  initialValues: ProductFormFields;
  submitLabel: string;
  onSubmit: (product: ProductInput) => Promise<void>;
  onCancel: () => void;
}

function getInputClass(hasError: boolean): string {
  return `w-full ${hasError ? "border-danger" : ""}`;
}

export function ProductForm({ initialValues, submitLabel, onSubmit, onCancel }: ProductFormProps) {
  const [fields, setFields] = useState<ProductFormFields>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<ValidatedField, boolean>>>({});
  const [status, setStatus] = useState<ProductFormStatus>("editing");
  const [globalError, setGlobalError] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  const errors = validateProductForm(fields);
  const isSubmitting = status === "submitting";

  function handleChange(field: keyof ProductFormFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
  }

  function handleBlur(field: ValidatedField) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function getVisibleError(field: ValidatedField): string | undefined {
    return touched[field] ? errors[field] : undefined;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmittingRef.current) {
      return;
    }

    setTouched({ name: true, price: true, stock: true, category: true });
    if (Object.keys(errors).length > 0) {
      return;
    }

    isSubmittingRef.current = true;
    setStatus("submitting");
    setGlobalError(null);

    try {
      await onSubmit(toProductInput(fields));
    } catch (err) {
      console.error("Error al guardar el producto:", err);
      setGlobalError(
        getFirestoreErrorMessage(err, "No se pudo guardar el producto. Intentá de nuevo."),
      );
      setStatus("error");
    } finally {
      isSubmittingRef.current = false;
    }
  }

  const nameError = getVisibleError("name");
  const priceError = getVisibleError("price");
  const stockError = getVisibleError("stock");
  const categoryError = getVisibleError("category");

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-lg border border-border bg-card p-4 md:p-6"
    >
      <fieldset disabled={isSubmitting} className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Nombre *
          </label>
          <input
            id="name"
            type="text"
            value={fields.name}
            onChange={(event) => handleChange("name", event.target.value)}
            onBlur={() => handleBlur("name")}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? "name-error" : undefined}
            className={getInputClass(Boolean(nameError))}
          />
          {nameError && (
            <p id="name-error" className="mt-1 text-sm text-danger">
              {nameError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="price" className="mb-1 block text-sm font-medium">
            Precio (USD) *
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={fields.price}
            onChange={(event) => handleChange("price", event.target.value)}
            onBlur={() => handleBlur("price")}
            aria-invalid={Boolean(priceError)}
            aria-describedby={priceError ? "price-error" : undefined}
            className={getInputClass(Boolean(priceError))}
          />
          {priceError && (
            <p id="price-error" className="mt-1 text-sm text-danger">
              {priceError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="stock" className="mb-1 block text-sm font-medium">
            Stock *
          </label>
          <input
            id="stock"
            type="number"
            step="1"
            min="0"
            value={fields.stock}
            onChange={(event) => handleChange("stock", event.target.value)}
            onBlur={() => handleBlur("stock")}
            aria-invalid={Boolean(stockError)}
            aria-describedby={stockError ? "stock-error" : undefined}
            className={getInputClass(Boolean(stockError))}
          />
          {stockError && (
            <p id="stock-error" className="mt-1 text-sm text-danger">
              {stockError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium">
            Categoría *
          </label>
          <select
            id="category"
            value={fields.category}
            onChange={(event) => handleChange("category", event.target.value)}
            onBlur={() => handleBlur("category")}
            aria-invalid={Boolean(categoryError)}
            aria-describedby={categoryError ? "category-error" : undefined}
            className={getInputClass(Boolean(categoryError))}
          >
            <option value="">Elegí una categoría</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {categoryError && (
            <p id="category-error" className="mt-1 text-sm text-danger">
              {categoryError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="image" className="mb-1 block text-sm font-medium">
            Imagen (ruta o URL)
          </label>
          <input
            id="image"
            type="text"
            placeholder="/products/iphone-15.png"
            value={fields.image}
            onChange={(event) => handleChange("image", event.target.value)}
            className="w-full"
          />
        </div>

        {fields.image && (
          <div className="md:col-span-2">
            <span className="mb-1 block text-sm text-muted">Vista previa</span>
            <img
              src={fields.image}
              alt="Vista previa del producto"
              className="h-32 w-32 rounded-md bg-surface object-contain p-2"
            />
          </div>
        )}

        <div className="md:col-span-2">
          <label htmlFor="description" className="mb-1 block text-sm font-medium">
            Descripción
          </label>
          <textarea
            id="description"
            rows={3}
            value={fields.description}
            onChange={(event) => handleChange("description", event.target.value)}
            className="w-full"
          />
        </div>
      </fieldset>

      {globalError && (
        <p role="alert" className="mt-4 rounded-md bg-danger/15 p-3 text-sm text-danger">
          {globalError}
        </p>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-full border border-border px-4 py-2 text-sm hover:bg-surface disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {isSubmitting ? "Guardando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
