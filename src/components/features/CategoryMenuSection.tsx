import type {
  DietaryFilter,
  Food,
  MenuCategory,
  MenuTreeNode,
} from "../../types/menu";
import { getContractedDisplayType } from "../../constants/categoryDisplayTypes";
import { SHOW_SUBCATEGORY_TABS } from "../../constants/menu";
import {
  filterFoodsByDietary,
  resolveCategoryDisplayType,
  resolveFoodImageLayout,
  toPersianDigits,
} from "../../lib/menu/utils";
import { getSubcategoryHeadingNote } from "../../constants/subcategoryHeadings";
import FoodCard from "./FoodCard";
import ProductImage from "../ui/ProductImage";
import SubcategoryHeading from "../ui/SubcategoryHeading";

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

  const sharedImage = displayType === "FirstItemImage" ? foods[0] : null;
  const stackGapClass =
    displayType === "FirstItemImage"
      ? "gap-2"
      : displayType === "SmallImageLeft" || displayType === "NoImage"
        ? "gap-4"
        : "gap-3";

  return (
    <div className={`flex flex-col ${stackGapClass}`}>
      {sharedImage ? (
        <div className="mb-3.5 aspect-square overflow-hidden rounded-[18px] bg-zinc-100">
          <ProductImage
            src={sharedImage.image}
            hasRealImage={sharedImage.hasRealImage}
            alt={sharedImage.name}
            className="h-full w-full"
            loading={prioritizeImages ? "eager" : "lazy"}
            width={640}
            height={640}
          />
        </div>
      ) : null}
      {foods.map((food, foodIndex) => (
        <FoodCard
          key={food.orderKey}
          food={food}
          quantity={getQuantity(food)}
          imagePriority={prioritizeImages && foodIndex < 2}
          compact={displayType === "FirstItemImage"}
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
  const contractedDisplayType = getContractedDisplayType(category.Id);
  const parentDisplayType = resolveCategoryDisplayType(
    category.DisplayType,
    contractedDisplayType,
  );
  const activeTabCategory = (activeSubcategory ?? subcategories[0])?.category;
  const tabContractedDisplayType = activeTabCategory
    ? getContractedDisplayType(activeTabCategory.Id)
    : undefined;
  const scopeDisplayType = resolveCategoryDisplayType(
    useSubcategoryTabs
      ? activeTabCategory?.DisplayType
      : category.DisplayType,
    useSubcategoryTabs
      ? (tabContractedDisplayType ?? parentDisplayType)
      : contractedDisplayType,
  );

  const scopedFoods = useSubcategoryTabs
    ? (activeSubcategory ?? subcategories[0])?.foods ?? []
    : foods;

  const childFoodCount = subcategories.reduce(
    (sum, item) => sum + item.foods.length,
    0,
  );
  const totalFoods = foods.length + childFoodCount;
  const parentVisibleFoods = filterFoodsByDietary(foods, dietaryFilter);
  const visibleSubcategories = subcategories.flatMap((sub, subcategoryIndex) => {
    const filtered = filterFoodsByDietary(sub.foods, dietaryFilter);
    if (filtered.length === 0) return [];
    return [{ sub, filtered, subcategoryIndex }];
  });

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
      className="category-surface rounded-[28px] border border-[#eadfe3] bg-[#fffbfc] p-3 shadow-[0_8px_24px_rgba(74,33,48,0.05)]"
    >
      <div className="mb-3.5 flex items-start justify-between gap-2.5 px-0.5 text-sm text-zinc-500">
        <span className="text-lg font-bold text-[#3a222a]">
          {category.Title}
        </span>
        <span className="whitespace-nowrap pt-1 text-[11px] text-[#888]">
          {toPersianDigits(totalFoods)} آیتم
        </span>
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
        <div className="flex flex-col">
          {parentVisibleFoods.length > 0
            ? renderFilteredGrid(foods, parentDisplayType, index === 0)
            : null}

          {visibleSubcategories.map(
            ({ sub, filtered, subcategoryIndex }, visibleIndex) => (
              <div key={sub.category.Id} className="flex flex-col">
                <SubcategoryHeading
                  title={sub.category.Title}
                  note={getSubcategoryHeadingNote(sub.category.Id)}
                  isFirst={
                    visibleIndex === 0 && parentVisibleFoods.length === 0
                  }
                />
                <FoodGrid
                  foods={filtered}
                  displayType={resolveCategoryDisplayType(
                    sub.category.DisplayType,
                    getContractedDisplayType(sub.category.Id) ??
                      parentDisplayType,
                  )}
                  prioritizeImages={
                    index === 0 &&
                    parentVisibleFoods.length === 0 &&
                    subcategoryIndex === 0
                  }
                  getQuantity={getQuantity}
                  onAddToOrder={onAddToOrder}
                  onRemoveFromOrder={onRemoveFromOrder}
                  onOpen={onOpen}
                />
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
