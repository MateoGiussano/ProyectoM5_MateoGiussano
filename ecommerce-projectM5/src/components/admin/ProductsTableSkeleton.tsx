export function ProductsTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando productos"
      className="rounded-lg border border-border bg-card p-3"
    >
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-4 py-3">
          <div className="h-12 w-12 rounded-md bg-surface" />
          <div className="h-4 flex-1 rounded bg-surface" />
          <div className="h-4 w-16 rounded bg-surface" />
          <div className="h-4 w-10 rounded bg-surface" />
          <div className="h-8 w-32 rounded-full bg-surface" />
        </div>
      ))}
    </div>
  );
}
