import { useEffect } from "react";
import logoClaro from "../../assets/logo_claro.jfif";
import logoDark from "../../assets/logo_dark.jfif";

export function Header() {
  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  }, []);


  function handleToggleTheme() {
    document.documentElement.classList.toggle("dark");
  }

   return (
    <header className="mb-6 rounded-md bg-card p-4 text-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Se ve en modo claro, se oculta en oscuro */}
          <img src={logoClaro} alt="iPhonix" className="h-10 w-auto md:h-16 dark:hidden" />
          {/* Oculto en modo claro, se ve en oscuro */}
          <img src={logoDark} alt="iPhonix" className="hidden h-10 w-auto md:h-16 dark:block" />
          {/* En celular se oculta: el logo ya muestra el nombre */}
          <span className="text-lg font-bold md:text-xl">iPhonix</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="whitespace-nowrap">🛒 0</span>
          <button
            onClick={handleToggleTheme}
            aria-label="Cambiar tema"
            className="whitespace-nowrap"
          >
            ☀️ / 🌙
          </button>
        </div>
      </div>
    </header>
  );
}