import type { FavoriteEntry, Food, MenuMode } from "../../types/menu";

export const MAX_ORDER_SELECTION_QUANTITY = 99;

export const resolveFavoriteEntryMenuMode = (
  entry: FavoriteEntry,
): MenuMode | undefined => {
  if (entry.menuMode) return entry.menuMode;
  if (entry.orderKey?.startsWith("delivery:")) return "delivery";
  if (entry.orderKey?.startsWith("dineIn:")) return "dineIn";
  return undefined;
};

export interface ResolvedOrderSelection extends FavoriteEntry {
  resolvedOrderKey: string;
  food: Food;
}

export const createOrderSelectionKey = (
  menuMode: MenuMode,
  itemId: number | string,
) => `${menuMode}:item:${itemId}`;

export const resolveOrderSelections = (
  favorites: FavoriteEntry[],
  orderableFoods: Food[],
  menuMode: MenuMode,
): ResolvedOrderSelection[] => {
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
    const entryMenuMode = resolveFavoriteEntryMenuMode(entry);
    if (entryMenuMode && entryMenuMode !== menuMode) return [];

    const resolvedOrderKey =
      entry.orderKey ?? createOrderSelectionKey(menuMode, entry.foodId);
    const food =
      foodsByOrderKey.get(resolvedOrderKey) ??
      foodsByItemId.get(entry.foodId);
    if (!food) return [];

    return [{ ...entry, resolvedOrderKey, food }];
  });
};

export const getCartItemLabels = (food: Food): string => {
  if (!food.variant) return "";
  return [food.variant.label, food.variant.description]
    .filter(Boolean)
    .join(" - ");
};
