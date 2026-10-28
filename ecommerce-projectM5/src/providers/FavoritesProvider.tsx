import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { FavoritesContext } from "../contexts/FavoritesContext";

const FAVORITES_STORAGE_KEY = "iphonix-favorites";

// Lee los favoritos guardados. Si no hay nada o el dato está dañado, arranca vacío.
function loadFavoritesFromStorage(): string[] {
  try {
    const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(loadFavoritesFromStorage);

  // Cada vez que cambian los favoritos, los guardamos en el navegador.
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch {
      // Si el navegador no deja guardar, los favoritos siguen funcionando en memoria.
    }
  }, [favoriteIds]);

  const value = useMemo(
    () => ({
      favoriteIds,
      isFavorite: (productId: string) => favoriteIds.includes(productId),
      toggleFavorite: (productId: string) =>
        setFavoriteIds((currentIds) =>
          currentIds.includes(productId)
            ? currentIds.filter((id) => id !== productId)
            : [...currentIds, productId]
        ),
    }),
    [favoriteIds]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}