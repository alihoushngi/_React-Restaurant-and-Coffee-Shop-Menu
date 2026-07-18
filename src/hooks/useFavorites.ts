import { useCallback, useMemo, useState } from "react";
import type { FavoriteEntry } from "../types/menu";
import { getAllFavorites, saveFavorites } from "../lib/menu/utils";
import { showToast } from "../lib/toast";

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>(() => {
    if (typeof window === "undefined") return [];
    return getAllFavorites();
  });

  const hydrated = useMemo(() => {
    return typeof window !== "undefined";
  }, []);

  const addToFavorites = useCallback((foodId: string, quantity = 1) => {
    if (quantity <= 0) return;

    setFavorites((current) => {
      const exists = current.find((item) => item.foodId === foodId);

      const next = exists
        ? current.map((item) =>
            item.foodId === foodId
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        : [
            ...current,
            {
              foodId,
              quantity,
              addedAt: new Date().toISOString(),
            },
          ];

      saveFavorites(next);
      showToast("به لیست سفارش اضافه شد");

      return next;
    });
  }, []);

  const removeFromFavorites = useCallback((foodId: string, quantity = 1) => {
    setFavorites((current) => {
      const next = current
        .map((item) => {
          if (item.foodId !== foodId) return item;

          const nextQuantity = item.quantity - quantity;
          return nextQuantity > 0 ? { ...item, quantity: nextQuantity } : null;
        })
        .filter((item): item is FavoriteEntry => Boolean(item));

      saveFavorites(next);

      if (next.length < current.length) {
        showToast("از لیست سفارش حذف شد");
      }

      return next;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    saveFavorites([]);
  }, []);

  const isFavorite = useCallback(
    (foodId: string) => {
      return favorites.some((item) => item.foodId === foodId);
    },
    [favorites],
  );

  const getQuantity = useCallback(
    (foodId: string) => {
      return favorites.find((item) => item.foodId === foodId)?.quantity ?? 0;
    },
    [favorites],
  );

  return {
    favorites,
    hydrated,
    addToFavorites,
    removeFromFavorites,
    clearFavorites,
    isFavorite,
    getQuantity,
  } as const;
}
