import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="py-16 text-center">
      <p className="text-5xl font-semibold">404</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight">Esta página no existe</h2>
      <p className="mt-2 text-muted">
        Puede que el link esté mal escrito o que la página se haya movido.
      </p>
      <Link
        to="/"
        className="mt-4 inline-block rounded-full bg-primary px-5 py-2 font-medium text-primary-foreground hover:bg-primary-hover"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
