import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { HiTrash } from "react-icons/hi2";
import {
  getFavoriteEntryMenuMode,
  useFavorites,
} from "../hooks/useFavorites";
import { useDineInItems } from "../hooks/menu/useDineInItems";
import { useDeliveryItems } from "../hooks/menu/useDeliveryItems";
import { useDineInCategory } from "../hooks/menu/useDineInCategory";
import { useDeliveryCategory } from "../hooks/menu/useDeliveryCategory";
import {
  buildMenuTree,
  createCategoryLookup,
  createOrderKey,
  extractArrayData,
  flattenOrderableFoods,
  getMenuPath,
  getOrderSelection,
  resolveMenuMode,
} from "../lib/menu/utils";
import type {
  FavoriteEntry,
  Food,
  MenuCategory,
  MenuItem,
  MenuMode,
} from "../types/menu";
import PageShell from "../components/layout/PageShell";
import Header from "../components/ui/Header";
import FoodCard from "../components/features/FoodCard";
import FoodModal from "../components/features/FoodModal";
import OrderClearConfirmationSheet from "../components/features/OrderClearConfirmationSheet";

interface ResolvedFavorite extends FavoriteEntry {
  resolvedOrderKey: string;
  food: Food;
}

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
    favorites,
    addToFavorites,
    removeFromFavorites,
    clearOrderList,
  } = useFavorites();
  const { data: dineInItemsResponse, isLoading: dineInItemsLoading } =
    useDineInItems(menuMode === "dineIn");
  const { data: deliveryItemsResponse, isLoading: deliveryItemsLoading } =
    useDeliveryItems(menuMode === "delivery");
  const { data: dineInCategoriesResponse, isLoading: dineInCategoriesLoading } =
    useDineInCategory(menuMode === "dineIn");
  const {
    data: deliveryCategoriesResponse,
    isLoading: deliveryCategoriesLoading,
  } = useDeliveryCategory(menuMode === "delivery");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isClearConfirmationOpen, setIsClearConfirmationOpen] =
    useState(false);

  const items = useMemo(
    () =>
      extractArrayData<MenuItem>(
        menuMode === "delivery"
          ? deliveryItemsResponse
          : dineInItemsResponse,
      ),
    [deliveryItemsResponse, dineInItemsResponse, menuMode],
  );
  const categories = useMemo(
    () =>
      extractArrayData<MenuCategory>(
        menuMode === "delivery"
          ? deliveryCategoriesResponse
          : dineInCategoriesResponse,
      ),
    [deliveryCategoriesResponse, dineInCategoriesResponse, menuMode],
  );
  const orderableFoods = useMemo(() => {
    const menuTree = buildMenuTree(
      categories,
      items,
      menuMode,
      createCategoryLookup(categories),
    );
    return flattenOrderableFoods(menuTree);
  }, [categories, items, menuMode]);

  const favoriteFoods = useMemo<ResolvedFavorite[]>(() => {
    const foodsByOrderKey = new Map(
      orderableFoods.map((food) => [food.orderKey, food]),
    );
    const foodsByItemId = new Map(
      orderableFoods.flatMap((food) =>
        food.sourceItemId === undefined
          ? []
          : [[String(food.sourceItemId), food] as const],
      ),
    );

    return favorites.flatMap((entry) => {
      const entryMenuMode = getFavoriteEntryMenuMode(entry);
      if (entryMenuMode && entryMenuMode !== menuMode) return [];

      const resolvedOrderKey =
        entry.orderKey ?? createOrderKey(menuMode, entry.foodId);
      const food =
        foodsByOrderKey.get(resolvedOrderKey) ??
        foodsByItemId.get(entry.foodId);
      if (!food) return [];

      return [{ ...entry, resolvedOrderKey, food }];
    });
  }, [favorites, menuMode, orderableFoods]);

  const isLoading =
    menuMode === "delivery"
      ? deliveryItemsLoading || deliveryCategoriesLoading
      : dineInItemsLoading || dineInCategoriesLoading;

  const handleAddToOrder = useCallback(
    (food: Food) => {
      const selection = getOrderSelection(food);
      if (food.enabled && selection) addToFavorites(selection);
    },
    [addToFavorites],
  );

  const handleRemoveFromOrder = useCallback(
    (food: Food) => removeFromFavorites(food.orderKey),
    [removeFromFavorites],
  );

  const handleConfirmClear = useCallback(() => {
    clearOrderList(menuMode);
    setSelectedFood(null);
    setIsClearConfirmationOpen(false);
  }, [clearOrderList, menuMode]);

  if (isLoading) {
    return (
      <PageShell menuMode={menuMode}>
        <MenuBackLink menuMode={menuMode} />
        <div className="py-20 text-center">در حال بارگذاری سفارش‌ها...</div>
      </PageShell>
    );
  }

  return (
    <PageShell menuMode={menuMode}>
      <Header title="لیست سفارش" subtitle="غذاهایی که برای سفارش انتخاب کردی" />

      {menuMode === "delivery" ? (
        <aside className="sticky top-[max(0.75rem,env(safe-area-inset-top))] z-30 rounded-3xl border border-[#7a394a]/20 bg-[#fff7f4]/95 p-4 text-sm leading-7 text-zinc-700 shadow-md backdrop-blur-md">
          <p>
            آیتم‌های انتخابی شما در این صفحه لیست شده و برای سفارش می‌بایست با
            شماره{" "}
            <a
              href="tel:02126550072"
              className="whitespace-nowrap font-bold text-[#7a394a] underline decoration-2 underline-offset-4"
            >
              02126550072
            </a>{" "}
            تماس بگیرید.
          </p>
        </aside>
      ) : null}

      <MenuBackLink menuMode={menuMode} />

      {favoriteFoods.length === 0 ? (
        <section className="rounded-[28px] bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-zinc-800">
            هنوز موردی را به لیست سفارش اضافه نکردی
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            از منوی اصلی غذاهای موردنظر را به لیست سفارش اضافه کن.
          </p>
        </section>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-sm">
            <div>
              <p className="text-sm text-zinc-500">تعداد آیتم‌ها</p>
              <p className="text-lg font-bold text-zinc-900">
                {favoriteFoods.reduce(
                  (total, item) => total + item.quantity,
                  0,
                )}{" "}
                عدد
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsClearConfirmationOpen(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
            >
              <HiTrash className="h-5 w-5" />
              حذف همه
            </button>
          </div>
          <section className="grid gap-4 md:grid-cols-2">
            {favoriteFoods.map((entry) => (
              <FoodCard
                key={entry.resolvedOrderKey}
                food={entry.food}
                quantity={entry.quantity}
                onAddToOrder={handleAddToOrder}
                onRemoveFromOrder={handleRemoveFromOrder}
                onOpen={setSelectedFood}
              />
            ))}
          </section>
        </>
      )}

      <FoodModal
        food={selectedFood}
        quantity={
          selectedFood
            ? (favoriteFoods.find(
                (entry) => entry.food.orderKey === selectedFood.orderKey,
              )?.quantity ?? 0)
            : 0
        }
        onClose={() => setSelectedFood(null)}
        onAddToOrder={() => {
          if (!selectedFood?.enabled) return;
          const selection = getOrderSelection(selectedFood);
          if (selection) addToFavorites(selection);
        }}
        onRemoveFromOrder={() =>
          selectedFood && removeFromFavorites(selectedFood.orderKey)
        }
      />

      <AnimatePresence>
        {isClearConfirmationOpen && favoriteFoods.length > 0 ? (
          <OrderClearConfirmationSheet
            onCancel={() => setIsClearConfirmationOpen(false)}
            onConfirm={handleConfirmClear}
          />
        ) : null}
      </AnimatePresence>
    </PageShell>
  );
}
