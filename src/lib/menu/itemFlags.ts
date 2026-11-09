import type {
  CategoryDisplayType,
  DietaryFilter,
  Food,
  FoodImageLayout,
  FoodVariant,
  MenuTreeNode,
} from "../../types/menu";

/** API booleans are active only when strictly `true`. */
export const isTruthyApiFlag = (value: unknown): boolean => value === true;

export const CATEGORY_DISPLAY_TYPES = [
  "LargeImage",
  "SmallImageLeft",
  "NoImage",
  "FirstItemImage",
] as const satisfies readonly CategoryDisplayType[];

export const resolveCategoryDisplayType = (
  value: unknown,
  fallback?: unknown,
): CategoryDisplayType => {
  if (CATEGORY_DISPLAY_TYPES.includes(value as CategoryDisplayType)) {
    return value as CategoryDisplayType;
  }

  // Missing/null/empty on a child may inherit an explicit parent DisplayType
  // (e.g. شیک و اسموتی + زیردسته‌ها). Invalid strings never inherit.
  if (
    (value === undefined || value === null || value === "") &&
    fallback !== undefined
  ) {
    return resolveCategoryDisplayType(fallback);
  }

  return "LargeImage";
};

export const resolveFoodImageLayout = (
  displayType: CategoryDisplayType,
  index: number,
): FoodImageLayout => {
  switch (displayType) {
    case "NoImage":
      return "none";
    case "SmallImageLeft":
      return "small-left";
    case "FirstItemImage":
      return index === 0 ? "large" : "none";
    case "LargeImage":
    default:
      return "large";
  }
};

export type ItemFeatureFlags = {
  isForTwo?: boolean;
  isDietary?: boolean;
  isVegetarian?: boolean;
  isPopular?: boolean;
  isRecommendedDrink?: boolean;
  showInSearch?: boolean;
};

export const readItemFeatureFlags = (item: {
  IsForTwo?: unknown;
  IsDietary?: unknown;
  IsVegetarian?: unknown;
  IsPopular?: unknown;
  IsRecommendedDrink?: unknown;
  ShowInSearch?: unknown;
}): ItemFeatureFlags => ({
  ...(isTruthyApiFlag(item.IsForTwo) ? { isForTwo: true } : {}),
  ...(isTruthyApiFlag(item.IsDietary) ? { isDietary: true } : {}),
  ...(isTruthyApiFlag(item.IsVegetarian) ? { isVegetarian: true } : {}),
  ...(isTruthyApiFlag(item.IsPopular) ? { isPopular: true } : {}),
  ...(isTruthyApiFlag(item.IsRecommendedDrink)
    ? { isRecommendedDrink: true }
    : {}),
  ...(isTruthyApiFlag(item.ShowInSearch) ? { showInSearch: true } : {}),
});

const foodHasFlag = (
  food: Pick<
    Food,
    | "isForTwo"
    | "isDietary"
    | "isVegetarian"
    | "isPopular"
    | "isRecommendedDrink"
    | "showInSearch"
    | "variants"
  >,
  flag: keyof ItemFeatureFlags,
): boolean => {
  if (food[flag] === true) return true;
  return food.variants?.some((variant) => variant[flag] === true) === true;
};

export const matchesDietaryFilter = (
  food: Food,
  filter: DietaryFilter,
): boolean => {
  if (filter === "all") return true;
  if (filter === "vegetarian") return foodHasFlag(food, "isVegetarian");
  return foodHasFlag(food, "isDietary");
};

export const filterFoodsByDietary = (
  foods: readonly Food[],
  filter: DietaryFilter,
): Food[] =>
  foods.flatMap((food) => {
    if (filter === "all") return [food];
    if (!food.variants) return matchesDietaryFilter(food, filter) ? [food] : [];
    const variants = food.variants.filter((variant) =>
      filter === "vegetarian"
        ? variant.isVegetarian === true
        : variant.isDietary === true,
    );
    if (variants.length === 0) return [];
    const first = variants[0];
    return [{
      ...food,
      variants,
      image: first.image,
      hasRealImage: first.hasRealImage,
      shortDescription: first.shortDescription,
      summary: first.summary,
      price: first.price,
      enabled: variants.some((variant) => variant.enabled),
      isForTwo: variants.every((variant) => variant.isForTwo === true),
      isDietary: variants.every((variant) => variant.isDietary === true),
      isVegetarian: variants.every((variant) => variant.isVegetarian === true),
    }];
  });

export const filterMenuTreeByDietary = (
  nodes: readonly MenuTreeNode[],
  filter: DietaryFilter,
): MenuTreeNode[] => nodes.flatMap((node) => {
  const foods = filterFoodsByDietary(node.foods, filter);
  const subcategories = filterMenuTreeByDietary(node.subcategories, filter);
  return foods.length || subcategories.length
    ? [{ ...node, foods, subcategories }]
    : [];
});

export const collectUniqueFlaggedFoods = (
  foods: readonly Food[],
  flag: "isPopular" | "isRecommendedDrink",
): Food[] => {
  const seen = new Set<string>();
  const result: Food[] = [];

  for (const food of foods) {
    if (!foodHasFlag(food, flag)) continue;
    const key = String(food.sourceItemId ?? food.orderKey);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(food);
  }

  return result;
};

export const isMeaningfulSearchQuery = (query: string): boolean =>
  Array.from(query).length >= 1;

export const filterFoodsForSearchSheet = (
  foods: readonly Food[],
  normalizedQuery: string,
): Food[] => {
  if (!isMeaningfulSearchQuery(normalizedQuery)) {
    return foods.filter((food) => food.showInSearch === true);
  }

  return foods.filter((food) => food.searchText.includes(normalizedQuery));
};

export const pickVariantFeatureFlags = (
  variant: FoodVariant,
): ItemFeatureFlags => ({
  ...(variant.isForTwo ? { isForTwo: true } : {}),
  ...(variant.isDietary ? { isDietary: true } : {}),
  ...(variant.isVegetarian ? { isVegetarian: true } : {}),
  ...(variant.isPopular ? { isPopular: true } : {}),
  ...(variant.isRecommendedDrink ? { isRecommendedDrink: true } : {}),
  ...(variant.showInSearch ? { showInSearch: true } : {}),
});
