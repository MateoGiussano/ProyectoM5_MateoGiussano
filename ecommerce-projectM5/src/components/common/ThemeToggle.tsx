export function ThemeToggle() {
  function handleToggleTheme() {
    document.documentElement.classList.toggle("dark");
  }

  return (
    <button
      onClick={handleToggleTheme}
      aria-label="Cambiar tema"
      className="h-8 w-14 rounded-full bg-surface p-1 ring-1 ring-border"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-card text-xs shadow-sm transition-transform duration-300 dark:translate-x-6">
        <span className="dark:hidden">☀️</span>
        <span className="hidden dark:inline">🌙</span>
      </span>
    </button>
  );
}
