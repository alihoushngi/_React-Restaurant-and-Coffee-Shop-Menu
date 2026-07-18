import { useMemo, useState } from "react";
import type { Food } from "../types/menu";
import { useFavorites } from "../hooks/useFavorites";
import { useDineInItems } from "../hooks/menu/useDineInItems";
import { useDeliveryItems } from "../hooks/menu/useDeliveryItems";
import PageShell from "../components/layout/PageShell";
import Header from "../components/ui/Header";
import SearchInput from "../components/ui/SearchInput";
import FoodCard from "../components/features/FoodCard";
import FoodModal from "../components/features/FoodModal";
import { mapMenuItemToFood } from "../lib/menu/utils";

type SearchFood = Food & {
  menuType: "dineIn" | "delivery";
};

export default function SearchPage() {
  const { addToFavorites, removeFromFavorites, getQuantity } = useFavorites();

  const { data: dineInResponse } = useDineInItems();

  const { data: deliveryResponse } = useDeliveryItems();

  const [query, setQuery] = useState("");

  const [selectedFood, setSelectedFood] = useState<SearchFood | null>(null);

  const foods = useMemo<SearchFood[]>(() => {
    const dineInItems = Array.isArray(dineInResponse)
      ? dineInResponse
      : (dineInResponse?.result?.data ?? []);

    const deliveryItems = Array.isArray(deliveryResponse)
      ? deliveryResponse
      : (deliveryResponse?.result?.data ?? []);

    const dineFoods = dineInItems
      .filter((item) => item.Enable)
      .map(mapMenuItemToFood)
      .map((food) => ({
        ...food,
        menuType: "dineIn" as const,
      }));

    const deliveryFoods = deliveryItems
      .filter((item) => item.Enable)
      .map(mapMenuItemToFood)
      .map((food) => ({
        ...food,
        menuType: "delivery" as const,
      }));

    return [...dineFoods, ...deliveryFoods];
  }, [dineInResponse, deliveryResponse]);

  const filteredFoods = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fa");

    if (!normalized) {
      return [];
    }

    return foods.filter((food) =>
      food.name.toLocaleLowerCase("fa").includes(normalized),
    );
  }, [foods, query]);

  return (
    <PageShell>
      <Header title="جستجوی غذا" subtitle="نام غذا را وارد کن" />

      <SearchInput value={query} onChange={setQuery} />

      {filteredFoods.length === 0 && query && (
        <div className="py-12 text-center text-sm text-zinc-500">
          غذایی با این نام پیدا نشد
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        {filteredFoods.map((food) => (
          <div key={`${food.menuType}-${food.id}`} className="relative">
            <div
              className="
                absolute
                right-3
                top-3
                z-10
                rounded-full
                bg-white/90
                px-3
                py-1
                text-xs
                font-semibold
                shadow
              "
            >
              {food.menuType === "delivery" ? "🛵 بیرون‌بر" : "🍽 داخل سالن"}
            </div>

            <FoodCard
              food={food}
              quantity={getQuantity(String(food.id))}
              onAddToOrder={() => addToFavorites(String(food.id))}
              onRemoveFromOrder={() => removeFromFavorites(String(food.id))}
              onOpen={() => setSelectedFood(food)}
            />
          </div>
        ))}
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
