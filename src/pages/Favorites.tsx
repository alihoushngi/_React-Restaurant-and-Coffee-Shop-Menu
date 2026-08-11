import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useFavorites } from "../hooks/useFavorites";
import { useDineInItems } from "../hooks/menu/useDineInItems";
import { useDeliveryItems } from "../hooks/menu/useDeliveryItems";

import { mapMenuItemToFood } from "../lib/menu/utils";
import type { Food } from "../types/menu";
import PageShell from "../components/layout/PageShell";
import Header from "../components/ui/Header";
import FoodCard from "../components/features/FoodCard";
import FoodModal from "../components/features/FoodModal";
// import OrderInvoiceModal from "../components/features/OrderInvoiceModal";

export default function FavoritesPage() {
  const { favorites, addToFavorites, removeFromFavorites, getQuantity } =
    useFavorites();

  const { data: dineInResponse, isLoading: dineInLoading } = useDineInItems();

  const { data: deliveryResponse, isLoading: deliveryLoading } =
    useDeliveryItems();

  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  // const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const favoriteFoods = useMemo<
    Array<{
      foodId: string;
      quantity: number;
      addedAt: string;
      food: Food;
    }>
  >(() => {
    const dineInItems = Array.isArray(dineInResponse)
      ? dineInResponse
      : (dineInResponse?.result?.data ?? []);

    const deliveryItems = Array.isArray(deliveryResponse)
      ? deliveryResponse
      : (deliveryResponse?.result?.data ?? []);

    const allItems = [...dineInItems, ...deliveryItems];

    const foods = allItems.filter((item) => item.Enable).map(mapMenuItemToFood);

    return favorites
      .map((entry) => {
        const food = foods.find(
          (item) => String(item.id) === String(entry.foodId),
        );

        if (!food) return null;

        return {
          ...entry,
          food,
        };
      })
      .filter(
        (
          entry,
        ): entry is {
          foodId: string;
          quantity: number;
          addedAt: string;
          food: Food;
        } => Boolean(entry),
      );
  }, [favorites, dineInResponse, deliveryResponse]);

  if (dineInLoading || deliveryLoading) {
    return (
      <PageShell>
        <div className="py-20 text-center">در حال بارگذاری سفارش‌ها...</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Header title="لیست سفارش" subtitle="غذاهایی که برای سفارش انتخاب کردی" />
      {favoriteFoods.length === 0 ? (
        <section className="rounded-[28px] bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-zinc-800">
            هنوز موردی را به لیست سفارش اضافه نکردی
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            از منوی اصلی غذاهای موردنظر را به لیست سفارش اضافه کن.
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
          >
            بازگشت به منو
          </Link>
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
            {/* <button
              type="button"
              onClick={() => setIsInvoiceOpen(true)}
              className="rounded-full bg-[#7a394a] px-4 py-2 text-sm font-semibold text-white"
            >
              مشاهده فاکتور
            </button> */}
          </div>
          <section className="grid gap-4 md:grid-cols-2">
            {favoriteFoods.map((entry) => (
              <FoodCard
                key={entry.foodId}
                food={entry.food}
                quantity={entry.quantity}
                onAddToOrder={() => addToFavorites(entry.foodId)}
                onRemoveFromOrder={() => removeFromFavorites(entry.foodId)}
                onOpen={() => setSelectedFood(entry.food)}
              />
            ))}
          </section>
        </>
      )}
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
      {/* <OrderInvoiceModal
        isOpen={isInvoiceOpen}
        items={favoriteFoods}
        onClose={() => setIsInvoiceOpen(false)}
      /> */}
    </PageShell>
  );
}
