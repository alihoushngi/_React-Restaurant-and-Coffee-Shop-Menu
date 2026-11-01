import { AnimatePresence } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { useFavorites } from "../../hooks/useFavorites";
import type {
  Food,
  DietaryFilter,
  FoodVariantQuantity,
  MenuCategory,
  MenuItem,
  MenuMode,
  OrderSelectionQuantity,
} from "../../types/menu";
import {
  buildMenuTree,
  collectUniqueFlaggedFoods,
  filterFoodsByDietary,
  createCategoryLookup,
  mapMenuItemToFood,
  resolveCategoryTitle,
  getOrderSelection,
  saveLastMenuMode,
} from "../../lib/menu/utils";
import PageShell from "../layout/PageShell";
import MenuStickyHeader from "../ui/MenuStickyHeader";
import CategoryMenuSection from "./CategoryMenuSection";
import FoodModal from "./FoodModal";
import DietaryFilterBar from "./DietaryFilterBar";
import FeaturedFoodRail from "./FeaturedFoodRail";
import SearchBottomSheet from "./SearchBottomSheet";
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
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(
    () => new URLSearchParams(location.search).get("search") === "1",
  );
  const [stickyHeaderHeight, setStickyHeaderHeight] = useState(160);
  const stickyHeaderRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef(new Map<number, HTMLElement>());

  const categoriesById = useMemo(
    () => createCategoryLookup(categories),
    [categories],
  );
  const menuTree = useMemo(
    () => buildMenuTree(categories, items, menuMode, categoriesById),
    [categories, categoriesById, items, menuMode],
  );
  const searchableFoods = useMemo(
    () => items.map((item) =>
      mapMenuItemToFood(item, {
        menuMode,
        categoryTitle: resolveCategoryTitle(categoriesById, item.CategoryId),
      }),
    ),
    [items, menuMode, categoriesById],
  );
  const filteredFoods = useMemo(
    () => filterFoodsByDietary(searchableFoods, dietaryFilter),
    [searchableFoods, dietaryFilter],
  );
  const popularFoods = useMemo(
    () => collectUniqueFlaggedFoods(filteredFoods, "isPopular"),
    [filteredFoods],
  );
  const recommendedDrinks = useMemo(
    () => collectUniqueFlaggedFoods(filteredFoods, "isRecommendedDrink"),
    [filteredFoods],
  );
  const hasFeatured = popularFoods.length > 0 || recommendedDrinks.length > 0;
  const featuredTitle = popularFoods.length > 0
    ? "پرفروش‌های هفته"
    : "کنار غذات چی مینوشی؟";
  const visibleCategories = useMemo(
    () => [
      ...(hasFeatured ? [{ Id: -1, Title: featuredTitle, ParentId: null }] : []),
      ...menuTree.map((node) => node.category),
    ],
    [menuTree, hasFeatured, featuredTitle],
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

      const anchor = stickyHeaderHeight + 5 + 12;
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
          stickyHeaderHeight) + 5 + 12;
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

  const closeSearch = useCallback(() => {
    setSearchQuery("");
    setIsSearchOpen(false);
  }, []);

  const handleSearchToggle = useCallback(() => {
    if (isSearchOpen) {
      closeSearch();
      return;
    }
    setIsSearchOpen(true);
  }, [closeSearch, isSearchOpen]);

  const handleSearchSelect = useCallback((food: Food) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSelectedFood(food);
  }, []);

  const searchControls = useMemo(
    () => ({
      isOpen: isSearchOpen,
      isActive: false,
      value: searchQuery,
      onChange: setSearchQuery,
      onClear: closeSearch,
      onToggle: handleSearchToggle,
    }),
    [closeSearch, handleSearchToggle, isSearchOpen, searchQuery],
  );

  return (
    <PageShell menuMode={menuMode} searchControls={searchControls}>
      <MenuStickyHeader
        categories={visibleCategories}
        activeCategoryId={currentActiveCategoryId}
        onSelect={handleTabClick}
        stickyRef={stickyHeaderRef}
      />

      <DietaryFilterBar value={dietaryFilter} onChange={setDietaryFilter} />
      {hasFeatured ? (
        <section
          ref={(element) => {
            if (element) sectionRefs.current.set(-1, element);
            else sectionRefs.current.delete(-1);
          }}
          style={{ scrollMarginTop: stickyHeaderHeight + 5 + 12 }}
          className="rounded-[24px] border border-[#e8dfe3] bg-[#fffbfc] p-3"
          aria-label="پیشنهادهای منو"
        >
          <FeaturedFoodRail title="پرفروش‌های هفته" foods={popularFoods} onOpen={setSelectedFood} />
          <FeaturedFoodRail title="کنار غذات چی مینوشی؟" foods={recommendedDrinks} onOpen={setSelectedFood} showTopDivider={popularFoods.length > 0} />
        </section>
      ) : null}

      <section className="mt-0 flex flex-col gap-6">
        {menuTree.map(({ category, foods, subcategories }, index) => {
          const storedSubcategoryId = activeSubcategories[category.Id];
          const activeSubId = subcategories.some(
            (subcategory) => subcategory.category.Id === storedSubcategoryId,
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
              dietaryFilter={dietaryFilter}
              scrollMarginTop={stickyHeaderHeight + 5 + 12}
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

      <FoodModal
        food={selectedFood}
        suggestDrink={categoriesById.get(Number(selectedFood?.categoryId))?.SuggestDrink === true}
        recommendedDrinks={collectUniqueFlaggedFoods(searchableFoods, "isRecommendedDrink")}
        onAddRecommendedDrink={handleAddToOrder}
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

      <SearchBottomSheet
        isOpen={isSearchOpen}
        foods={searchableFoods}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        onClose={closeSearch}
        onSelect={handleSearchSelect}
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
