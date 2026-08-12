/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef, useState } from "react";
import { useFavorites } from "../hooks/useFavorites";
import { useDineInCategory } from "../hooks/menu/useDineInCategory";
import { useDineInItems } from "../hooks/menu/useDineInItems";
import type { Food, MenuCategory, MenuItem } from "../types/menu";
import { buildMenuTree } from "../lib/menu/utils";
import { SHOW_SUBCATEGORY_TABS } from "../constants/menu";
import PageShell from "../components/layout/PageShell";
import MenuStickyHeader from "../components/ui/MenuStickyHeader";
import CategoryMenuSection from "../components/features/CategoryMenuSection";
import FoodModal from "../components/features/FoodModal";

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

  // Used only when SHOW_SUBCATEGORY_TABS is true
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
      <MenuStickyHeader
        categories={categories}
        activeCategoryId={currentActiveCategoryId}
        onSelect={handleTabClick}
      />
      <section className="mt-0 flex flex-col gap-6">
        {menuTree.map(({ category, foods, subcategories }, index) => {
          const activeSubId =
            activeSubcategories[category.Id] ?? subcategories[0]?.category.Id;

          return (
            <CategoryMenuSection
              key={category.Id}
              category={category}
              foods={foods}
              subcategories={subcategories}
              index={index}
              sectionRef={(element) => {
                sectionRefs.current[String(category.Id)] = element;
              }}
              activeSubId={SHOW_SUBCATEGORY_TABS ? activeSubId : undefined}
              onSubSelect={
                SHOW_SUBCATEGORY_TABS
                  ? (subcategoryId) =>
                      setActiveSubcategories((prev) => ({
                        ...prev,
                        [category.Id]: subcategoryId,
                      }))
                  : undefined
              }
              getQuantity={getQuantity}
              onAddToOrder={addToFavorites}
              onRemoveFromOrder={removeFromFavorites}
              onOpen={setSelectedFood}
            />
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
