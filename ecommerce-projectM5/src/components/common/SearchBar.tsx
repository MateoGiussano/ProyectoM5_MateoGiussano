interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Buscar productos..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-full border border-border bg-card py-2 pr-20 pl-4 text-sm"
      />

      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Borrar búsqueda"
          className="absolute top-1/2 right-11 -translate-y-1/2 rounded-full px-1.5 text-foreground hover:opacity-80"
        >
          ✕
        </button>
      )}

      <div className="pointer-events-none absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2 text-muted">
        <span className="h-5 w-px bg-border" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
      </div>
    </div>
  );
}
