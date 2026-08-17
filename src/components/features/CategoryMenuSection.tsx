import type { Food, MenuCategory, MenuTreeNode } from "../../types/menu";
import { SHOW_SUBCATEGORY_TABS } from "../../constants/menu";
import { RAYO_LOGO_IMAGE } from "../../lib/menu/utils";
import FoodCard from "./FoodCard";

const categoryBg = [
  "bg-amber-50",
  "bg-emerald-50",
  "bg-blue-50",
  "bg-purple-50",
  "bg-pink-50",
  "bg-orange-50",
  "bg-slate-50",
];

interface CategoryMenuSectionProps {
  category: MenuCategory;
  foods: Food[];
  subcategories: MenuTreeNode[];
  index: number;
  sectionRef: (element: HTMLDivElement | null) => void;
  scrollMarginTop: number;
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
  prioritizeImages?: boolean;
  getQuantity: (food: Food) => number;
  onAddToOrder: (food: Food) => void;
  onRemoveFromOrder: (food: Food) => void;
  onOpen: (food: Food) => void;
}

const FoodGrid = ({
  foods,
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

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {foods.map((food, foodIndex) => (
        <FoodCard
          key={food.orderKey}
          food={food}
          quantity={getQuantity(food)}
          imagePriority={prioritizeImages && foodIndex < 2}
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
  const tabVisibleFoods = hasSubcategories
    ? (activeSubcategory?.foods ?? subcategories[0]?.foods ?? [])
    : foods;
  const childFoodCount = subcategories.reduce(
    (sum, item) => sum + item.foods.length,
    0,
  );
  const totalFoods = foods.length + childFoodCount;

  return (
    <div
      id={`category-${category.Id}`}
      data-category={category.Id}
      ref={sectionRef}
      style={{ scrollMarginTop }}
      className={`rounded-[28px] p-4 shadow-sm ${categoryBg[index % categoryBg.length]}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col items-start gap-1 text-sm text-zinc-500">
          <span className="text-lg font-bold text-zinc-900">
            {category.Title}
          </span>
          <span>{totalFoods} آیتم</span>
        </div>

        <img
          src={category.ImageUrl || RAYO_LOGO_IMAGE}
          alt={category.Title}
          width={56}
          height={56}
          loading="lazy"
          className="h-14 w-14 shrink-0 rounded-2xl object-contain"
          onError={(event) => {
            if (event.currentTarget.src !== RAYO_LOGO_IMAGE) {
              event.currentTarget.onerror = null;
              event.currentTarget.src = RAYO_LOGO_IMAGE;
            }
          }}
          decoding="async"
        />
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
                className={`shrink-0 rounded-full px-3 py-1 text-xs transition ${
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-600"
                }`}
              >
                {sub.category.Title}
              </button>
            );
          })}
        </div>
      ) : null}

      {useSubcategoryTabs || !hasSubcategories ? (
        <FoodGrid
          foods={useSubcategoryTabs ? tabVisibleFoods : foods}
          prioritizeImages={index === 0}
          getQuantity={getQuantity}
          onAddToOrder={onAddToOrder}
          onRemoveFromOrder={onRemoveFromOrder}
          onOpen={onOpen}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {foods.length > 0 ? (
            <FoodGrid
              foods={foods}
              prioritizeImages={index === 0}
              getQuantity={getQuantity}
              onAddToOrder={onAddToOrder}
              onRemoveFromOrder={onRemoveFromOrder}
              onOpen={onOpen}
            />
          ) : null}

          {subcategories.map((sub, subcategoryIndex) => (
            <div key={sub.category.Id} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-zinc-700">
                {sub.category.Title}
              </h3>
              <FoodGrid
                foods={sub.foods}
                prioritizeImages={
                  index === 0 && foods.length === 0 && subcategoryIndex === 0
                }
                getQuantity={getQuantity}
                onAddToOrder={onAddToOrder}
                onRemoveFromOrder={onRemoveFromOrder}
                onOpen={onOpen}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
