import type { Product, ProductCategory, ProductInput } from "../types/product";
import type { ProductFormErrors, ProductFormFields } from "../types/productForm";

export const emptyProductForm: ProductFormFields = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  image: "",
};

export function productToFormFields(product: Product): ProductFormFields {
  return {
    name: product.name,
    description: product.description,
    price: String(product.price),
    stock: String(product.stock),
    category: product.category,
    image: product.image,
  };
}

export function validateProductForm(fields: ProductFormFields): ProductFormErrors {
  const errors: ProductFormErrors = {};

  if (fields.name.trim() === "") {
    errors.name = "El nombre es obligatorio.";
  }

  const price = Number(fields.price);
  if (fields.price.trim() === "" || Number.isNaN(price) || price <= 0) {
    errors.price = "El precio debe ser mayor a 0.";
  }

  const stock = Number(fields.stock);
  if (fields.stock.trim() === "" || Number.isNaN(stock)) {
    errors.stock = "Ingresá el stock.";
  } else if (stock < 0) {
    errors.stock = "El stock no puede ser negativo.";
  } else if (!Number.isInteger(stock)) {
    errors.stock = "El stock tiene que ser un número entero.";
  }

  if (fields.category === "") {
    errors.category = "Seleccioná una categoría.";
  }

  return errors;
}

export function toProductInput(fields: ProductFormFields): ProductInput {
  return {
    name: fields.name.trim(),
    description: fields.description.trim(),
    price: Number(fields.price),
    stock: Number(fields.stock),
    category: fields.category as ProductCategory,
    image: fields.image.trim(),
  };
}

export function getChangedFields(
  original: ProductInput,
  updated: ProductInput,
): Partial<ProductInput> {
  const changes: Partial<ProductInput> = {};

  if (updated.name !== original.name) changes.name = updated.name;
  if (updated.description !== original.description) changes.description = updated.description;
  if (updated.price !== original.price) changes.price = updated.price;
  if (updated.stock !== original.stock) changes.stock = updated.stock;
  if (updated.category !== original.category) changes.category = updated.category;
  if (updated.image !== original.image) changes.image = updated.image;

  return changes;
}
