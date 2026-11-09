import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";
import { useResolvedOrderSelections } from "../hooks/useResolvedOrderSelections";
import {
  getMenuPath,
  getOrderSelection,
  isFoodAvailable,
  resolveMenuMode,
} from "../lib/menu/utils";
import type { Food, MenuMode } from "../types/menu";
import PageShell from "../components/layout/PageShell";
import OrderSelectionContent from "../components/features/OrderSelectionContent";
import FoodModal from "../components/features/FoodModal";
import OrderClearConfirmationSheet from "../components/features/OrderClearConfirmationSheet";

const MenuBackLink = ({ menuMode }: { menuMode: MenuMode }) => (
  <Link
    to={getMenuPath(menuMode)}
    className="inline-flex w-fit items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-700"
  >
    برگشت به منو
  </Link>
);

export default function FavoritesPage() {
  const [searchParams] = useSearchParams();
  const menuMode = resolveMenuMode(searchParams.get("menu"));
  const {
    selections,
    categories,
    recommendedDrinks,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    clearOrderList,
  } = useResolvedOrderSelections(menuMode);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isClearConfirmationOpen, setIsClearConfirmationOpen] = useState(false);

  const handleIncrement = useCallback(
    (food: Food) => {
      if (
        !isFoodAvailable(food.enabled, food.availability ?? { type: "always" })
      ) {
        return;
      }
      const selection = getOrderSelection(food);
      if (selection) addToFavorites(selection);
    },
    [addToFavorites],
  );

  const handleDecrement = useCallback(
    (food: Food) => removeFromFavorites(food.orderKey),
    [removeFromFavorites],
  );

  const handleRemoveLine = useCallback(
    (food: Food, quantity: number) =>
      removeFromFavorites(food.orderKey, quantity),
    [removeFromFavorites],
  );

  const handleConfirmClear = useCallback(() => {
    clearOrderList(menuMode);
    setSelectedFood(null);
    setIsClearConfirmationOpen(false);
  }, [clearOrderList, menuMode]);

  const selectedQuantity = selectedFood
    ? (selections.find(
        (entry) => entry.food.orderKey === selectedFood.orderKey,
      )?.quantity ?? 0)
    : 0;

  return (
    <PageShell menuMode={menuMode}>
      <header className="space-y-2 py-2">
        <h1 className="text-[15px] font-bold text-zinc-900">
          لیست انتخاب‌های شما
        </h1>
        <p className="text-[11px] leading-6 text-zinc-500">
          این لیست برای مرور انتخاب‌هاست و سفارشی به رستوران ارسال نمی‌کند.
        </p>
      </header>

      <MenuBackLink menuMode={menuMode} />

      <OrderSelectionContent
        selections={selections}
        isLoading={isLoading}
        onOpenFood={setSelectedFood}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onRemoveLine={handleRemoveLine}
        onRequestClear={
          selections.length > 0
            ? () => setIsClearConfirmationOpen(true)
            : undefined
        }
      />

      <FoodModal
        food={selectedFood}
        suggestDrink={
          categories.find(
            (category) => category.Id === Number(selectedFood?.categoryId),
          )?.SuggestDrink === true
        }
        recommendedDrinks={recommendedDrinks}
        onAddRecommendedDrink={handleIncrement}
        quantity={selectedQuantity}
        onClose={() => setSelectedFood(null)}
        onAddToOrder={() => {
          if (!selectedFood) return;
          handleIncrement(selectedFood);
        }}
        onRemoveFromOrder={() => {
          if (selectedFood) handleDecrement(selectedFood);
        }}
      />

      <AnimatePresence>
        {isClearConfirmationOpen && selections.length > 0 ? (
          <OrderClearConfirmationSheet
            onCancel={() => setIsClearConfirmationOpen(false)}
            onConfirm={handleConfirmClear}
          />
        ) : null}
      </AnimatePresence>
    </PageShell>
  );
}
