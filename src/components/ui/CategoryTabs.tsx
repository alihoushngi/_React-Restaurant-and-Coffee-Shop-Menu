import { useEffect, useMemo, useRef } from "react";
import type { MenuCategory } from "../../types/menu";
import { sortCategories } from "../../lib/menu/utils";

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
    return sortCategories(
      categories.filter((category) => category.ParentId === null),
    );
  }, [categories]);

  useEffect(() => {
    const activeBtn = containerRef.current?.querySelector(
      `[data-id="${activeCategoryId}"]`,
    ) as HTMLElement | null;

    if (activeBtn && containerRef.current) {
      const container = containerRef.current;

      const offsetLeft =
        activeBtn.offsetLeft -
        container.offsetWidth / 2 +
        activeBtn.offsetWidth / 2;

      container.scrollTo({
        left: offsetLeft,
        behavior: "smooth",
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
            className={`
                flex
                shrink-0
                items-center
                gap-1
                rounded-xl
                p-2
                text-sm
                font-semibold
                transition

                ${
                  isActive
                    ? "bg-[#496a65] text-white shadow"
                    : "bg-white text-zinc-800 shadow-sm hover:bg-zinc-50"
                }
              `}
          >
            <img
              src={category.ImageUrl}
              alt={category.Title}
              loading="lazy"
              className="h-9 w-9 shrink-0 rounded-lg object-contain"
              onError={(e) => {
                e.currentTarget.src = "../../assets/placeholder.jpg";
              }}
            />

            <span>{category.Title}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;
