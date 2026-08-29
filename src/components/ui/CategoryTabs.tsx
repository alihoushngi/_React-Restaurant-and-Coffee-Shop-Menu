import { useEffect, useMemo, useRef } from "react";
import type { MenuCategory } from "../../types/menu";

interface CategoryTabsProps {
  categories: MenuCategory[];
  activeCategoryId: string;
  onSelect: (id: string) => void;
}

const CategoryTabs = ({
  categories,
  activeCategoryId,
  onSelect,
}: CategoryTabsProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const parentCategories = useMemo(() => {
    return categories.filter((category) => category.ParentId === null);
  }, [categories]);

  useEffect(() => {
    const activeBtn = containerRef.current?.querySelector(
      `[data-id="${activeCategoryId}"]`,
    ) as HTMLElement | null;

    if (activeBtn && containerRef.current) {
      activeBtn.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeCategoryId]);

  return (
    <div
      ref={containerRef}
      className="flex gap-1 overflow-x-auto rounded-2xl bg-[#7a394a]/90 p-2 backdrop-blur-md"
    >
      {parentCategories.map((category) => {
        const isActive = String(category.Id) === activeCategoryId;

        return (
          <button
            key={category.Id}
            type="button"
            data-id={category.Id}
            onClick={() => onSelect(String(category.Id))}
            aria-current={isActive ? "true" : undefined}
            className={`
                flex
                shrink-0
                items-center
                rounded-xl
                px-3
                py-2
                text-sm
                font-semibold
                transition

                ${
                  isActive
                    ? "category-item-selected shadow"
                    : "category-item category-surface text-zinc-800 shadow-sm"
                }
              `}
          >
            <span>{category.Title}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;
