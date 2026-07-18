/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef, useState } from "react";
import { useFavorites } from "../hooks/useFavorites";
import { useDineInCategory } from "../hooks/menu/useDineInCategory";
import { useDineInItems } from "../hooks/menu/useDineInItems";
import type { Food, MenuCategory, MenuItem } from "../types/menu";
import { buildMenuTree } from "../lib/menu/utils";
import PageShell from "../components/layout/PageShell";
import CategoryTabs from "../components/ui/CategoryTabs";
import FoodCard from "../components/features/FoodCard";
import FoodModal from "../components/features/FoodModal";

const categoryBg = [
  "bg-amber-50",
  "bg-emerald-50",
  "bg-blue-50",
  "bg-purple-50",
  "bg-pink-50",
  "bg-orange-50",
  "bg-slate-50",
];

export default function TableMenu() {
  const { addToFavorites, removeFromFavorites, getQuantity } = useFavorites();

  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useDineInCategory();

  const {
    data: itemsResponse,
    isLoading: itemsLoading,
    isError: itemsError,
  } = useDineInItems();

  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  const [activeSubcategories, setActiveSubcategories] = useState<
    Record<number, number>
  >({});

  const [activeCategoryId, setActiveCategoryId] = useState("");

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const categories = useMemo<MenuCategory[]>(() => {
    if (!categoriesResponse) return [];

    if (Array.isArray(categoriesResponse)) {
      return categoriesResponse;
    }

    return (categoriesResponse as any)?.data ?? [];
  }, [categoriesResponse]);

  const items = useMemo<MenuItem[]>(() => {
    if (!itemsResponse) return [];

    if (Array.isArray(itemsResponse)) {
      return itemsResponse;
    }

    return (itemsResponse as any)?.data ?? [];
  }, [itemsResponse]);

  const menuTree = useMemo(() => {
    if (!categories.length || !items.length) {
      return [];
    }

    return buildMenuTree(categories, items);
  }, [categories, items]);

  const currentActiveCategoryId =
    activeCategoryId || String(menuTree[0]?.category.Id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let bestEntry: IntersectionObserverEntry | null = null;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          if (
            !bestEntry ||
            entry.intersectionRatio > bestEntry.intersectionRatio
          ) {
            bestEntry = entry;
          }
        }

        if (bestEntry) {
          const id = bestEntry.target.getAttribute("data-category");

          if (id) {
            setActiveCategoryId(id);
          }
        }
      },
      {
        threshold: [0.2, 0.4, 0.6, 0.8],
      },
    );

    Object.values(sectionRefs.current).forEach((element) => {
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [menuTree]);

  const handleTabClick = (id: string) => {
    setActiveCategoryId(id);

    const element = sectionRefs.current[id];

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  if (categoriesLoading || itemsLoading) {
    return (
      <PageShell>
        <div className="py-20 text-center">در حال بارگذاری منو...</div>
      </PageShell>
    );
  }

  if (categoriesError || itemsError) {
    return (
      <PageShell>
        <div className="py-20 text-center text-red-500">
          خطا در دریافت اطلاعات منو. لطفاً دوباره تلاش کنید.
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <CategoryTabs
        categories={categories}
        activeCategoryId={currentActiveCategoryId}
        onSelect={handleTabClick}
      />
      <section className="flex flex-col gap-6 mt-0">
        {menuTree.map(({ category, foods, subcategories }, index) => {
          const activeSubId =
            activeSubcategories[category.Id] ?? subcategories[0]?.category.Id;

          const visibleFoods =
            subcategories.length > 0
              ? (subcategories.find((sub) => sub.category.Id === activeSubId)
                  ?.foods ?? [])
              : foods;

          const totalFoods =
            subcategories.length > 0
              ? subcategories.reduce((sum, item) => sum + item.foods.length, 0)
              : foods.length;

          return (
            <div
              key={category.Id}
              data-category={category.Id}
              ref={(element) => {
                sectionRefs.current[String(category.Id)] = element;
              }}
              className={`
                  rounded-[28px]
                  p-4
                  shadow-sm
                  ${categoryBg[index % categoryBg.length]}
                `}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-zinc-500 flex flex-col items-start gap-1">
                  <span className="text-lg font-bold text-zinc-900">
                    {category.Title}
                  </span>

                  <span>{totalFoods} آیتم</span>
                </div>

                <img
                  src={category.ImageUrl}
                  alt={category.Title}
                  width={56}
                  height={56}
                  loading="lazy"
                  className="h-14 w-14 shrink-0 rounded-2xl object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "../../assets/placeholder.jpg";
                  }}
                />
              </div>

              {subcategories.length > 0 && (
                <div className="mb-4 flex gap-2 overflow-x-auto">
                  {subcategories.map((sub) => {
                    const isActive = activeSubId === sub.category.Id;

                    return (
                      <button
                        key={sub.category.Id}
                        onClick={() =>
                          setActiveSubcategories((prev) => ({
                            ...prev,
                            [category.Id]: sub.category.Id,
                          }))
                        }
                        className={`
                              shrink-0
                              rounded-full
                              px-3
                              py-1
                              text-xs
                              transition
                              ${
                                isActive
                                  ? "bg-zinc-900 text-white"
                                  : "bg-white text-zinc-600"
                              }
                            `}
                      >
                        {sub.category.Title}
                      </button>
                    );
                  })}
                </div>
              )}

              {visibleFoods.length === 0 ? (
                <p
                  className="
                    py-12
                    text-center
                    text-sm
                    text-zinc-500
                  "
                >
                  در حال حاضر آیتمی در این بخش موجود نیست
                </p>
              ) : (
                <div
                  className="
                    grid
                    gap-4
                    md:grid-cols-2
                  "
                >
                  {visibleFoods.map((food) => (
                    <FoodCard
                      key={food.id}
                      food={food}
                      quantity={getQuantity(String(food.id))}
                      onAddToOrder={() => addToFavorites(String(food.id))}
                      onRemoveFromOrder={() =>
                        removeFromFavorites(String(food.id))
                      }
                      onOpen={() => setSelectedFood(food)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>

      <FoodModal
        food={selectedFood}
        quantity={selectedFood ? getQuantity(String(selectedFood.id)) : 0}
        onClose={() => setSelectedFood(null)}
        onAddToOrder={() =>
          selectedFood && addToFavorites(String(selectedFood.id))
        }
        onRemoveFromOrder={() =>
          selectedFood && removeFromFavorites(String(selectedFood.id))
        }
      />
    </PageShell>
  );
}
