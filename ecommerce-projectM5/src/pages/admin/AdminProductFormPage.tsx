import { useParams } from "react-router-dom";

export function AdminProductFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);

  return (
    <h2 className="text-xl font-semibold tracking-tight">
      {isEditing ? "Editar producto" : "Nuevo producto"}
    </h2>
  );
}
