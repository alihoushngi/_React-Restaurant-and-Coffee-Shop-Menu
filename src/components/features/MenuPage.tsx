import { AnimatePresence } from "framer-motion";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { useFavorites } from "../../hooks/useFavorites";
import type {
  Food,
  FoodVariantQuantity,
  MenuCategory,
  MenuItem,
  MenuMode,
  OrderSelectionQuantity,
} from "../../types/menu";
import {
  buildMenuTree,
  createCategoryLookup,
  filterMenuTreeBySearch,
  getOrderSelection,
  isSearchQueryActive,
  normalizePersianText,
  saveLastMenuMode,
} from "../../lib/menu/utils";
import PageShell from "../layout/PageShell";
import MenuStickyHeader from "../ui/MenuStickyHeader";
import CategoryMenuSection from "./CategoryMenuSection";
import FoodModal from "./FoodModal";
import VariantSelectionSheet from "./VariantSelectionSheet";

interface MenuPageProps {
  menuMode: MenuMode;
  categories: MenuCategory[];
  items: MenuItem[];
}

const MenuPage = ({ menuMode, categories, items }: MenuPageProps) => {
  const location = useLocation();
  const {
    addToFavorites,
    addManyToFavorites,
    removeFromFavorites,
    getQuantity,
  } = useFavorites();
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [variantFood, setVariantFood] = useState<Food | null>(null);
  const [activeSubcategories, setActiveSubcategories] = useState<
    Record<number, number>
  >({});
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(
    () => new URLSearchParams(location.search).get("search") === "1",
  );
  const [stickyHeaderHeight, setStickyHeaderHeight] = useState(160);
  const stickyHeaderRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef(new Map<number, HTMLDivElement>());

  const categoriesById = useMemo(
    () => createCategoryLookup(categories),
    [categories],
  );
  const fullMenuTree = useMemo(
    () => buildMenuTree(categories, items, menuMode, categoriesById),
    [categories, categoriesById, items, menuMode],
  );
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const filterSearchQuery = searchQuery === "" ? "" : deferredSearchQuery;
  const normalizedQuery = useMemo(
    () => normalizePersianText(filterSearchQuery),
    [filterSearchQuery],
  );
  const normalizedInputQuery = useMemo(
    () => normalizePersianText(searchQuery),
    [searchQuery],
  );
  const searchActive = isSearchQueryActive(filterSearchQuery);
  const menuTree = useMemo(
    () =>
      searchActive
        ? filterMenuTreeBySearch(fullMenuTree, normalizedQuery)
        : fullMenuTree,
    [fullMenuTree, normalizedQuery, searchActive],
  );
  const visibleCategories = useMemo(
    () => menuTree.map((node) => node.category),
    [menuTree],
  );
  const visibleCategoryIds = useMemo(
    () => visibleCategories.map((category) => category.Id),
    [visibleCategories],
  );
  const currentActiveCategoryId = visibleCategoryIds.includes(
    Number(activeCategoryId),
  )
    ? activeCategoryId
    : String(visibleCategoryIds[0] ?? "");
  const searchCharacterCount = Array.from(normalizedInputQuery).length;
  const searchHint =
    searchCharacterCount > 0 && searchCharacterCount < 3
      ? "برای شروع جستجو حداقل ۳ کاراکتر وارد کنید."
      : undefined;

  useEffect(() => {
    saveLastMenuMode(menuMode);
  }, [menuMode]);

  useEffect(() => {
    const header = stickyHeaderRef.current;
    if (!header) return;

    const updateHeight = () => {
      setStickyHeaderHeight(Math.ceil(header.getBoundingClientRect().height));
    };
    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(header);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    let animationFrame = 0;

    const updateActiveCategory = () => {
      animationFrame = 0;
      if (visibleCategoryIds.length === 0) {
        setActiveCategoryId("");
        return;
      }

      const anchor = stickyHeaderHeight + 12;
      let nextActiveId = visibleCategoryIds[0];

      for (const categoryId of visibleCategoryIds) {
        const section = sectionRefs.current.get(categoryId);
        if (!section) continue;
        if (section.getBoundingClientRect().top <= anchor) {
          nextActiveId = categoryId;
        } else {
          break;
        }
      }

      setActiveCategoryId((current) =>
        current === String(nextActiveId) ? current : String(nextActiveId),
      );
    };

    const requestUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateActiveCategory);
    };

    updateActiveCategory();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [stickyHeaderHeight, visibleCategoryIds]);

  const handleTabClick = useCallback(
    (id: string) => {
      const categoryId = Number(id);
      const section = sectionRefs.current.get(categoryId);
      if (!section) return;

      setActiveCategoryId(id);
      const headerOffset =
        (stickyHeaderRef.current?.getBoundingClientRect().height ??
          stickyHeaderHeight) + 12;
      const targetTop =
        window.scrollY + section.getBoundingClientRect().top - headerOffset;

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "smooth",
      });
    },
    [stickyHeaderHeight],
  );

  const getFoodQuantity = useCallback(
    (food: Food) =>
      food.variants
        ? food.variants.reduce(
            (total, variant) => total + getQuantity(variant.orderKey),
            0,
          )
        : getQuantity(food.orderKey),
    [getQuantity],
  );

  const handleAddToOrder = useCallback(
    (food: Food) => {
      if (!food.enabled) return;
      if (food.variants?.length) {
        setVariantFood(food);
        return;
      }

      const selection = getOrderSelection(food);
      if (selection) addToFavorites(selection);
    },
    [addToFavorites],
  );

  const handleRemoveFromOrder = useCallback(
    (food: Food) => {
      if (food.variants?.length) return;
      removeFromFavorites(food.orderKey);
    },
    [removeFromFavorites],
  );

  const handleVariantConfirm = useCallback(
    (selections: FoodVariantQuantity[]) => {
      const orderSelections: OrderSelectionQuantity[] = selections.map(
        ({ variant, quantity }) => ({
        foodId: String(variant.itemId),
        orderKey: variant.orderKey,
        menuMode,
        quantity,
      }),
      );
      addManyToFavorites(orderSelections);
      setVariantFood(null);
    },
    [addManyToFavorites, menuMode],
  );

  const clearAndCloseSearch = useCallback(() => {
    setSearchQuery("");
    setActiveCategoryId("");
    setIsSearchOpen(false);
  }, []);

  const handleSearchToggle = useCallback(() => {
    if (isSearchOpen) {
      clearAndCloseSearch();
      return;
    }
    setIsSearchOpen(true);
  }, [clearAndCloseSearch, isSearchOpen]);

  const searchControls = useMemo(
    () => ({
      isOpen: isSearchOpen,
      isActive: searchActive,
      value: searchQuery,
      hint: searchHint,
      onChange: setSearchQuery,
      onClear: clearAndCloseSearch,
      onToggle: handleSearchToggle,
    }),
    [
      clearAndCloseSearch,
      handleSearchToggle,
      isSearchOpen,
      searchActive,
      searchHint,
      searchQuery,
    ],
  );

  return (
    <PageShell menuMode={menuMode} searchControls={searchControls}>
      <MenuStickyHeader
        categories={visibleCategories}
        activeCategoryId={currentActiveCategoryId}
        onSelect={handleTabClick}
        stickyRef={stickyHeaderRef}
      />

      {searchActive && menuTree.length === 0 ? (
        <section className="rounded-[28px] bg-white px-4 py-14 text-center text-sm text-zinc-500 shadow-sm">
          محصولی با این نام پیدا نشد.
        </section>
      ) : (
        <section className="mt-0 flex flex-col gap-6">
          {menuTree.map(({ category, foods, subcategories }, index) => {
            const storedSubcategoryId = activeSubcategories[category.Id];
            const activeSubId = subcategories.some(
              (subcategory) =>
                subcategory.category.Id === storedSubcategoryId,
            )
              ? storedSubcategoryId
              : subcategories[0]?.category.Id;

            return (
              <CategoryMenuSection
                key={category.Id}
                category={category}
                foods={foods}
                subcategories={subcategories}
                index={index}
                sectionRef={(element) => {
                  if (element) sectionRefs.current.set(category.Id, element);
                  else sectionRefs.current.delete(category.Id);
                }}
                scrollMarginTop={stickyHeaderHeight + 12}
                showAllSubcategories={searchActive}
                activeSubId={activeSubId}
                onSubSelect={(subcategoryId) =>
                  setActiveSubcategories((current) => ({
                    ...current,
                    [category.Id]: subcategoryId,
                  }))
                }
                getQuantity={getFoodQuantity}
                onAddToOrder={handleAddToOrder}
                onRemoveFromOrder={handleRemoveFromOrder}
                onOpen={setSelectedFood}
              />
            );
          })}
        </section>
      )}

      <FoodModal
        food={selectedFood}
        quantity={selectedFood ? getFoodQuantity(selectedFood) : 0}
        onClose={() => setSelectedFood(null)}
        onAddToOrder={() => {
          if (!selectedFood) return;
          if (selectedFood.variants?.length) setSelectedFood(null);
          handleAddToOrder(selectedFood);
        }}
        onRemoveFromOrder={() =>
          selectedFood && handleRemoveFromOrder(selectedFood)
        }
      />

      <AnimatePresence>
        {variantFood ? (
          <VariantSelectionSheet
            key={variantFood.orderKey}
            food={variantFood}
            onClose={() => setVariantFood(null)}
            onConfirm={handleVariantConfirm}
          />
        ) : null}
      </AnimatePresence>
    </PageShell>
  );
};

export default MenuPage;
