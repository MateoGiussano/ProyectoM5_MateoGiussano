import { useFavorites } from "../../hooks/useFavorites";

interface FavoriteButtonProps {
  productId: string;
  productName: string;
  className?: string;
}

export function FavoriteButton({ productId, productName, className = "" }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isActive = isFavorite(productId);

  return (
    <button
      onClick={() => toggleFavorite(productId)}
      aria-label={
        isActive ? `Quitar ${productName} de favoritos` : `Agregar ${productName} a favoritos`
      }
      aria-pressed={isActive}
      className={`rounded-full bg-card p-1.5 text-sm shadow-sm hover:scale-110 ${className}`}
    >
      {isActive ? "❤️" : "🤍"}
    </button>
  );
}
