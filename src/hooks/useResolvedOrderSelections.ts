import { useMemo } from "react";
import type { MenuCategory, MenuItem, MenuMode } from "../types/menu";
import {
  getFavoriteEntryMenuMode,
  useFavorites,
} from "./useFavorites";
import { useDineInItems } from "./menu/useDineInItems";
import { useDeliveryItems } from "./menu/useDeliveryItems";
import { useDineInCategory } from "./menu/useDineInCategory";
import { useDeliveryCategory } from "./menu/useDeliveryCategory";
import {
  buildMenuTree,
  collectUniqueFlaggedFoods,
  createCategoryLookup,
  extractArrayData,
  flattenOrderableFoods,
  resolveOrderSelections,
} from "../lib/menu/utils";

export function useResolvedOrderSelections(menuMode: MenuMode) {
  const { favorites, addToFavorites, removeFromFavorites, clearOrderList } =
    useFavorites();
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

  const selections = useMemo(
    () => resolveOrderSelections(favorites, orderableFoods, menuMode),
    [favorites, menuMode, orderableFoods],
  );

  const selectionCount = useMemo(
    () =>
      favorites.reduce(
        (total, entry) =>
          getFavoriteEntryMenuMode(entry) === menuMode
            ? total + entry.quantity
            : total,
        0,
      ),
    [favorites, menuMode],
  );

  const recommendedDrinks = useMemo(
    () => collectUniqueFlaggedFoods(orderableFoods, "isRecommendedDrink"),
    [orderableFoods],
  );

  const isLoading =
    menuMode === "delivery"
      ? deliveryItemsLoading || deliveryCategoriesLoading
      : dineInItemsLoading || dineInCategoriesLoading;

  return {
    selections,
    selectionCount,
    categories,
    orderableFoods,
    recommendedDrinks,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    clearOrderList,
  } as const;
}
