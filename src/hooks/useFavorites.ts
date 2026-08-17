import { useCallback, useSyncExternalStore } from "react";
import type {
  FavoriteEntry,
  MenuMode,
  OrderSelection,
  OrderSelectionQuantity,
} from "../types/menu";
import { getAllFavorites, saveFavorites } from "../lib/menu/utils";
import { showToast } from "../lib/toast";

const getEntryKey = (entry: FavoriteEntry) => entry.orderKey ?? entry.foodId;

export const getFavoriteEntryMenuMode = (
  entry: FavoriteEntry,
): MenuMode | undefined => {
  if (entry.menuMode) return entry.menuMode;
  if (entry.orderKey?.startsWith("delivery:")) return "delivery";
  if (entry.orderKey?.startsWith("dineIn:")) return "dineIn";
  return undefined;
};

const getItemIdFromOrderKey = (orderKey: string) => {
  const marker = ":item:";
  const markerIndex = orderKey.indexOf(marker);
  return markerIndex >= 0 ? orderKey.slice(markerIndex + marker.length) : null;
};

const addSelections = (
  current: FavoriteEntry[],
  selections: OrderSelectionQuantity[],
) => {
  const next = [...current];
  const indexesByKey = new Map(
    next.map((entry, index) => [getEntryKey(entry), index]),
  );

  for (const selection of selections) {
    if (selection.quantity <= 0) continue;
    const existingIndex = indexesByKey.get(selection.orderKey);

    if (existingIndex !== undefined) {
      const existing = next[existingIndex];
      next[existingIndex] = {
        ...existing,
        quantity: existing.quantity + selection.quantity,
      };
      continue;
    }

    indexesByKey.set(selection.orderKey, next.length);
    next.push({
      ...selection,
      quantity: selection.quantity,
      addedAt: new Date().toISOString(),
    });
  }

  return next;
};

const EMPTY_FAVORITES: FavoriteEntry[] = [];
const favoriteStoreListeners = new Set<() => void>();
let favoriteStoreSnapshot: FavoriteEntry[] | null = null;

const getFavoriteStoreSnapshot = () => {
  if (favoriteStoreSnapshot === null) {
    favoriteStoreSnapshot =
      typeof window === "undefined" ? EMPTY_FAVORITES : getAllFavorites();
  }

  return favoriteStoreSnapshot;
};

const subscribeToFavoriteStore = (listener: () => void) => {
  favoriteStoreListeners.add(listener);
  return () => favoriteStoreListeners.delete(listener);
};

const updateFavoriteStore = (
  updater: (current: FavoriteEntry[]) => FavoriteEntry[],
) => {
  const current = getFavoriteStoreSnapshot();
  const next = updater(current);
  if (next === current) return;

  favoriteStoreSnapshot = next;
  saveFavorites(next);
  favoriteStoreListeners.forEach((listener) => listener());
};

export function useFavorites() {
  const favorites = useSyncExternalStore(
    subscribeToFavoriteStore,
    getFavoriteStoreSnapshot,
    () => EMPTY_FAVORITES,
  );
  const hydrated = typeof window !== "undefined";

  const addToFavorites = useCallback(
    (selection: OrderSelection, quantity = 1) => {
      if (quantity <= 0) return;
      updateFavoriteStore((current) =>
        addSelections(current, [{ ...selection, quantity }]),
      );
      showToast("به لیست سفارش اضافه شد");
    },
    [],
  );

  const addManyToFavorites = useCallback(
    (selections: OrderSelectionQuantity[]) => {
      if (!selections.some((selection) => selection.quantity > 0)) return;
      updateFavoriteStore((current) => addSelections(current, selections));
      showToast("به لیست سفارش اضافه شد");
    },
    [],
  );

  const removeFromFavorites = useCallback(
    (orderKey: string, quantity = 1) => {
      if (quantity <= 0) return;

      updateFavoriteStore((current) =>
        current.flatMap((entry) => {
          if (getEntryKey(entry) !== orderKey) return [entry];
          const nextQuantity = entry.quantity - quantity;
          return nextQuantity > 0
            ? [{ ...entry, quantity: nextQuantity }]
            : [];
        }),
      );
      showToast("از لیست سفارش حذف شد");
    },
    [],
  );

  const clearOrderList = useCallback((menuMode?: MenuMode) => {
    updateFavoriteStore((current) =>
      menuMode
        ? current.filter((entry) => {
            const entryMenuMode = getFavoriteEntryMenuMode(entry);
            return entryMenuMode !== undefined && entryMenuMode !== menuMode;
          })
        : [],
    );
    showToast("لیست سفارش پاک شد");
  }, []);

  const isFavorite = useCallback(
    (orderKey: string) =>
      favorites.some((entry) => getEntryKey(entry) === orderKey),
    [favorites],
  );

  const getQuantity = useCallback(
    (orderKey: string) => {
      const exactEntry = favorites.find(
        (entry) => getEntryKey(entry) === orderKey,
      );
      if (exactEntry) return exactEntry.quantity;

      const itemId = getItemIdFromOrderKey(orderKey);
      if (!itemId) return 0;

      return (
        favorites.find(
          (entry) => !entry.orderKey && entry.foodId === itemId,
        )?.quantity ?? 0
      );
    },
    [favorites],
  );

  return {
    favorites,
    hydrated,
    addToFavorites,
    addManyToFavorites,
    removeFromFavorites,
    clearOrderList,
    isFavorite,
    getQuantity,
  } as const;
}
