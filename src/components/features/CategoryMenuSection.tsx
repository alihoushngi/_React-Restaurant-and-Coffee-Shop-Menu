import type { Food, MenuCategory } from "../../types/menu";
import type { MenuTreeNode } from "../../lib/menu/utils";
import { SHOW_SUBCATEGORY_TABS } from "../../constants/menu";
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
  activeSubId?: number;
  onSubSelect?: (subcategoryId: number) => void;
  getQuantity: (foodId: string) => number;
  onAddToOrder: (foodId: string) => void;
  onRemoveFromOrder: (foodId: string) => void;
  onOpen: (food: Food) => void;
}

function FoodGrid({
  foods,
  getQuantity,
  onAddToOrder,
  onRemoveFromOrder,
  onOpen,
}: {
  foods: Food[];
  getQuantity: (foodId: string) => number;
  onAddToOrder: (foodId: string) => void;
  onRemoveFromOrder: (foodId: string) => void;
  onOpen: (food: Food) => void;
}) {
  if (foods.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">
        در حال حاضر آیتمی در این بخش موجود نیست
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {foods.map((food) => (
        <FoodCard
          key={food.id}
          food={food}
          quantity={getQuantity(String(food.id))}
          onAddToOrder={() => onAddToOrder(String(food.id))}
          onRemoveFromOrder={() => onRemoveFromOrder(String(food.id))}
          onOpen={() => onOpen(food)}
        />
      ))}
    </div>
  );
}

export default function CategoryMenuSection({
  category,
  foods,
  subcategories,
  index,
  sectionRef,
  activeSubId,
  onSubSelect,
  getQuantity,
  onAddToOrder,
  onRemoveFromOrder,
  onOpen,
}: CategoryMenuSectionProps) {
  const hasSubcategories = subcategories.length > 0;

  const tabVisibleFoods = hasSubcategories
    ? (subcategories.find((sub) => sub.category.Id === activeSubId)?.foods ??
      [])
    : foods;

  const totalFoods = hasSubcategories
    ? subcategories.reduce((sum, item) => sum + item.foods.length, 0)
    : foods.length;

  const flatFoodCount = hasSubcategories
    ? subcategories.reduce((sum, item) => sum + item.foods.length, 0) +
      foods.length
    : foods.length;

  return (
    <div
      data-category={category.Id}
      ref={sectionRef}
      className={`scroll-mt-40 rounded-[28px] p-4 shadow-sm ${categoryBg[index % categoryBg.length]}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col items-start gap-1 text-sm text-zinc-500">
          <span className="text-lg font-bold text-zinc-900">
            {category.Title}
          </span>
          <span>
            {SHOW_SUBCATEGORY_TABS ? totalFoods : flatFoodCount} آیتم
          </span>
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

      {/* Tab mode: subcategory chips filter visible foods */}
      {SHOW_SUBCATEGORY_TABS && hasSubcategories && (
        <div className="mb-4 flex gap-2 overflow-x-auto">
          {subcategories.map((sub) => {
            const isActive = activeSubId === sub.category.Id;

            return (
              <button
                key={sub.category.Id}
                type="button"
                onClick={() => onSubSelect?.(sub.category.Id)}
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
      )}

      {SHOW_SUBCATEGORY_TABS || !hasSubcategories ? (
        <FoodGrid
          foods={SHOW_SUBCATEGORY_TABS ? tabVisibleFoods : foods}
          getQuantity={getQuantity}
          onAddToOrder={onAddToOrder}
          onRemoveFromOrder={onRemoveFromOrder}
          onOpen={onOpen}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {foods.length > 0 && (
            <FoodGrid
              foods={foods}
              getQuantity={getQuantity}
              onAddToOrder={onAddToOrder}
              onRemoveFromOrder={onRemoveFromOrder}
              onOpen={onOpen}
            />
          )}

          {subcategories.map((sub) => (
            <div key={sub.category.Id} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-zinc-700">
                {sub.category.Title}
              </h3>
              <FoodGrid
                foods={sub.foods}
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
