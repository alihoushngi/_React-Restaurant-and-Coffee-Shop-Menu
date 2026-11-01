import type {
  DietaryFilter,
  Food,
  MenuCategory,
  MenuTreeNode,
} from "../../types/menu";
import { SHOW_SUBCATEGORY_TABS } from "../../constants/menu";
import {
  filterFoodsByDietary,
  resolveCategoryDisplayType,
  resolveFoodImageLayout,
} from "../../lib/menu/utils";
import FoodCard from "./FoodCard";

interface CategoryMenuSectionProps {
  category: MenuCategory;
  foods: Food[];
  subcategories: MenuTreeNode[];
  index: number;
  sectionRef: (element: HTMLDivElement | null) => void;
  scrollMarginTop: number;
  dietaryFilter: DietaryFilter;
  showAllSubcategories?: boolean;
  activeSubId?: number;
  onSubSelect?: (subcategoryId: number) => void;
  getQuantity: (food: Food) => number;
  onAddToOrder: (food: Food) => void;
  onRemoveFromOrder: (food: Food) => void;
  onOpen: (food: Food) => void;
}

interface FoodGridProps {
  foods: Food[];
  displayType: ReturnType<typeof resolveCategoryDisplayType>;
  prioritizeImages?: boolean;
  getQuantity: (food: Food) => number;
  onAddToOrder: (food: Food) => void;
  onRemoveFromOrder: (food: Food) => void;
  onOpen: (food: Food) => void;
}

const FoodGrid = ({
  foods,
  displayType,
  prioritizeImages = false,
  getQuantity,
  onAddToOrder,
  onRemoveFromOrder,
  onOpen,
}: FoodGridProps) => {
  if (foods.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">
        در حال حاضر آیتمی در این بخش موجود نیست
      </p>
    );
  }

  const stackVertically =
    displayType === "NoImage" ||
    displayType === "FirstItemImage" ||
    displayType === "SmallImageLeft";

  return (
    <div
      className={
        stackVertically ? "flex flex-col gap-4" : "grid gap-4 md:grid-cols-2"
      }
    >
      {foods.map((food, foodIndex) => (
        <FoodCard
          key={food.orderKey}
          food={food}
          quantity={getQuantity(food)}
          imagePriority={prioritizeImages && foodIndex < 2}
          imageLayout={resolveFoodImageLayout(
            displayType,
            foodIndex,
          )}
          onAddToOrder={onAddToOrder}
          onRemoveFromOrder={onRemoveFromOrder}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
};

export default function CategoryMenuSection({
  category,
  foods,
  subcategories,
  index,
  sectionRef,
  scrollMarginTop,
  dietaryFilter,
  showAllSubcategories = false,
  activeSubId,
  onSubSelect,
  getQuantity,
  onAddToOrder,
  onRemoveFromOrder,
  onOpen,
}: CategoryMenuSectionProps) {
  const hasSubcategories = subcategories.length > 0;
  const useSubcategoryTabs =
    SHOW_SUBCATEGORY_TABS && hasSubcategories && !showAllSubcategories;
  const activeSubcategory = subcategories.find(
    (sub) => sub.category.Id === activeSubId,
  );
  const scopeDisplayType = resolveCategoryDisplayType(
    useSubcategoryTabs
      ? (activeSubcategory ?? subcategories[0])?.category.DisplayType
      : category.DisplayType,
  );

  const scopedFoods = useSubcategoryTabs
    ? (activeSubcategory ?? subcategories[0])?.foods ?? []
    : foods;

  const childFoodCount = subcategories.reduce(
    (sum, item) => sum + item.foods.length,
    0,
  );
  const totalFoods = foods.length + childFoodCount;

  const renderFilteredGrid = (
    sourceFoods: Food[],
    displayType: ReturnType<typeof resolveCategoryDisplayType>,
    prioritizeImages: boolean,
  ) => (
    <FoodGrid
      foods={filterFoodsByDietary(sourceFoods, dietaryFilter)}
      displayType={displayType}
      prioritizeImages={prioritizeImages}
      getQuantity={getQuantity}
      onAddToOrder={onAddToOrder}
      onRemoveFromOrder={onRemoveFromOrder}
      onOpen={onOpen}
    />
  );

  return (
    <div
      id={`category-${category.Id}`}
      data-category={category.Id}
      ref={sectionRef}
      style={{ scrollMarginTop }}
      className="category-surface rounded-[28px] p-4 shadow-sm"
    >
      <div className="mb-4 flex flex-col items-start gap-1 text-sm text-zinc-500">
        <span className="text-lg font-bold text-zinc-900">
          {category.Title}
        </span>
        <span>{totalFoods} آیتم</span>
      </div>

      {useSubcategoryTabs ? (
        <div className="mb-4 flex gap-2 overflow-x-auto">
          {subcategories.map((sub) => {
            const isActive =
              (activeSubcategory ?? subcategories[0])?.category.Id ===
              sub.category.Id;

            return (
              <button
                key={sub.category.Id}
                type="button"
                onClick={() => onSubSelect?.(sub.category.Id)}
                aria-pressed={isActive}
                className={`category-item shrink-0 rounded-full px-3 py-1 text-xs transition ${
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "category-surface text-zinc-600"
                }`}
              >
                {sub.category.Title}
              </button>
            );
          })}
        </div>
      ) : null}

      {useSubcategoryTabs || !hasSubcategories ? (
        renderFilteredGrid(
          useSubcategoryTabs ? scopedFoods : foods,
          scopeDisplayType,
          index === 0,
        )
      ) : (
        <div className="flex flex-col gap-6">
          {foods.length > 0
            ? renderFilteredGrid(
                foods,
                resolveCategoryDisplayType(category.DisplayType),
                index === 0,
              )
            : null}

          {subcategories.map((sub, subcategoryIndex) => {
            const filtered = filterFoodsByDietary(sub.foods, dietaryFilter);
            if (filtered.length === 0) return null;

            return (
              <div key={sub.category.Id} className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-zinc-700">
                  {sub.category.Title}
                </h3>
                <FoodGrid
                  foods={filtered}
                  displayType={resolveCategoryDisplayType(
                    sub.category.DisplayType,
                  )}
                  prioritizeImages={
                    index === 0 &&
                    foods.length === 0 &&
                    subcategoryIndex === 0
                  }
                  getQuantity={getQuantity}
                  onAddToOrder={onAddToOrder}
                  onRemoveFromOrder={onRemoveFromOrder}
                  onOpen={onOpen}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
