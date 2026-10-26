import type { ProductCategory } from "../../types/product";

const categories: ProductCategory[] = ["iPhone", "iPad", "Mac", "Apple Watch", "AirPods", "Accesorios"];

interface CategoryFilterProps {
  selectedCategory: ProductCategory | null;
  onSelectCategory: (category: ProductCategory | null) => void;
}

function getButtonClass(isSelected: boolean): string {
  return isSelected
    ? "rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
    : "rounded-full border border-border bg-card px-4 py-1.5 text-sm hover:bg-surface";
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <button
        onClick={() => onSelectCategory(null)}
        className={getButtonClass(selectedCategory === null)}
      >
        Todas
      </button>

      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={getButtonClass(selectedCategory === category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}