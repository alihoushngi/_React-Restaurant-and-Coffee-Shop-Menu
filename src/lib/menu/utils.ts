import {
  getCategoryVariantConfig,
  type CategoryVariantDefinition,
} from "../../constants/categoryVariants";
import RayoLogo from "../../assets/logo/logo.png";
import type {
  FavoriteEntry,
  Food,
  FoodVariant,
  MenuAvailability,
  MenuCategory,
  MenuItem,
  MenuMode,
  MenuTreeNode,
  OrderSelection,
} from "../../types/menu";

const ORDER_STORAGE_KEY = "Rayo-order-items";
const LEGACY_ORDER_STORAGE_KEY = "Rayo-favorites";
const LAST_MENU_MODE_KEY = "Rayo-last-menu-mode";
const FALLBACK_CATEGORY_TITLE = "دسته‌بندی نامشخص";

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 0,
  }).format(price);

export const formatMenuPrice = (price: number | null | undefined) =>
  typeof price === "number" && Number.isFinite(price)
    ? `${formatPrice(price)} تومان`
    : "قیمت نامشخص";

export const toPersianDigits = (value: string | number) => {
  const map: Record<string, string> = {
    "0": "۰",
    "1": "۱",
    "2": "۲",
    "3": "۳",
    "4": "۴",
    "5": "۵",
    "6": "۶",
    "7": "۷",
    "8": "۸",
    "9": "۹",
  };

  return String(value).replace(/[0-9]/g, (digit) => map[digit] || digit);
};

export const normalizePersianText = (value: string) =>
  value
    .normalize("NFKC")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c|\u200d|\u200e|\u200f/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("fa-IR");

const cleanDisplayText = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback;
  return value.replace(/\s+/g, " ").trim() || fallback;
};

export const isSearchQueryActive = (query: string) =>
  Array.from(normalizePersianText(query)).length >= 3;

export const RAYO_LOGO_IMAGE = RayoLogo;

export const getCategoryIcon = (categoryId: number | string): string =>
  `https://placehold.co/60x60/7a394a/white?text=${categoryId}&font=playfair`;

export const createCategoryLookup = (categories: MenuCategory[]) =>
  new Map(categories.map((category) => [category.Id, category]));

export const resolveCategoryTitle = (
  categoriesById: ReadonlyMap<number, MenuCategory>,
  categoryId: number,
  fallback = FALLBACK_CATEGORY_TITLE,
) => categoriesById.get(categoryId)?.Title || fallback;

export const createOrderKey = (menuMode: MenuMode, itemId: number | string) =>
  `${menuMode}:item:${itemId}`;

export const getOrderSelection = (food: Food): OrderSelection | null => {
  if (food.sourceItemId === undefined) return null;

  return {
    foodId: String(food.sourceItemId),
    orderKey: food.orderKey,
    menuMode: food.menuMode,
  };
};

interface MapMenuItemOptions {
  menuMode: MenuMode;
  categoryTitle?: string;
  orderKey?: string;
}

export const mapMenuItemToFood = (
  item: MenuItem,
  { menuMode, categoryTitle, orderKey }: MapMenuItemOptions,
): Food => {
  const name = cleanDisplayText(item?.Title, "آیتم منو");
  const enabled = item?.Enable === true;
  const imageUrl = cleanDisplayText(item?.ImageUrl, "");
  const hasRealImage = item?.HasPic === true && Boolean(imageUrl);

  return {
    id: item.Id,
    sourceItemId: item.Id,
    orderKey: orderKey ?? createOrderKey(menuMode, item.Id),
    menuMode,
    categoryId: item.CategoryId,
    categoryTitle: cleanDisplayText(categoryTitle, FALLBACK_CATEGORY_TITLE),
    name,
    image: hasRealImage ? imageUrl : RAYO_LOGO_IMAGE,
    hasRealImage,
    shortDescription: cleanDisplayText(item.Summary, "بدون توضیحات"),
    price:
      typeof item.Price === "number" && Number.isFinite(item.Price)
        ? item.Price
        : null,
    enabled,
    favoriteEnabled: enabled,
    availability: { type: "always" },
    rank: typeof item.Rank === "number" ? item.Rank : undefined,
    summary: typeof item.Summary === "string" ? item.Summary : null,
    searchText: normalizePersianText(name),
  };
};

export const sortCategories = (categories: MenuCategory[]) =>
  [...categories].sort((a, b) => a.Rank - b.Rank);

const createVariantPairingKey = (
  title: string,
  definition: CategoryVariantDefinition,
) => {
  const ignoredTokens = new Set(
    (definition.pairingIgnoredTokens ?? []).map(normalizePersianText),
  );

  return normalizePersianText(title)
    .split(" ")
    .filter((token) => token && !ignoredTokens.has(token))
    .join(" ");
};

const buildVariantFoods = (
  parentCategory: MenuCategory,
  itemsByCategory: ReadonlyMap<number, MenuItem[]>,
  menuMode: MenuMode,
): Food[] => {
  const config = getCategoryVariantConfig(parentCategory.Id);
  if (!config) return [];

  const groups = new Map<string, Map<string, FoodVariant>>();

  for (const definition of config.variants) {
    const variantItems = itemsByCategory.get(definition.categoryId) ?? [];

    for (const item of variantItems) {
      const basePairingKey =
        createVariantPairingKey(item.Title, definition) || `item-${item.Id}`;
      let pairingKey = basePairingKey;
      let group = groups.get(pairingKey);

      if (group?.has(definition.key)) {
        pairingKey = `${basePairingKey}::${item.Id}`;
        group = undefined;
      }

      if (!group) {
        group = new Map<string, FoodVariant>();
        groups.set(pairingKey, group);
      }

      const mapped = mapMenuItemToFood(item, {
        menuMode,
        categoryTitle: parentCategory.Title,
      });

      group.set(definition.key, {
        key: definition.key,
        label: definition.label,
        description: definition.description,
        categoryId: definition.categoryId,
        itemId: item.Id,
        title: mapped.name,
        orderKey: mapped.orderKey,
        price: mapped.price,
        enabled: mapped.enabled,
        image: mapped.image,
        hasRealImage: mapped.hasRealImage,
        shortDescription: mapped.shortDescription,
        summary: mapped.summary,
        rank: mapped.rank,
        searchText: mapped.searchText,
      });
    }
  }

  return Array.from(groups.entries()).map(([pairingKey, group]) => {
    const variants = config.variants.flatMap((definition) => {
      const variant = group.get(definition.key);
      return variant ? [variant] : [];
    });
    const representative =
      variants.find((variant) => variant.hasRealImage) ?? variants[0];
    const enabled = variants.some((variant) => variant.enabled);

    return {
      id: `variant:${parentCategory.Id}:${pairingKey}`,
      orderKey: `variant-group:${menuMode}:${parentCategory.Id}:${pairingKey}`,
      menuMode,
      categoryId: parentCategory.Id,
      categoryTitle: parentCategory.Title,
      name: representative?.title ?? "آیتم منو",
      image: representative?.image ?? RAYO_LOGO_IMAGE,
      hasRealImage: representative?.hasRealImage ?? false,
      shortDescription:
        representative?.shortDescription ?? "بدون توضیحات",
      price: representative?.price ?? null,
      enabled,
      favoriteEnabled: enabled,
      availability: { type: "always" } as const,
      rank: Math.min(
        ...variants.map((variant) => variant.rank ?? Number.MAX_SAFE_INTEGER),
      ),
      summary: representative?.summary ?? null,
      searchText: variants
        .map((variant) => variant.searchText)
        .join(" "),
      variants,
    } satisfies Food;
  });
};

export const buildMenuTree = (
  categories: MenuCategory[],
  items: MenuItem[],
  menuMode: MenuMode,
  categoriesById = createCategoryLookup(categories),
): MenuTreeNode[] => {
  const sortedCategories = sortCategories(categories);
  const childrenByParent = new Map<number, MenuCategory[]>();
  const itemsByCategory = new Map<number, MenuItem[]>();

  for (const category of sortedCategories) {
    if (category.ParentId === null) continue;
    const children = childrenByParent.get(category.ParentId) ?? [];
    children.push(category);
    childrenByParent.set(category.ParentId, children);
  }

  for (const item of items) {
    if (!item || typeof item.CategoryId !== "number") continue;
    const categoryItems = itemsByCategory.get(item.CategoryId) ?? [];
    categoryItems.push(item);
    itemsByCategory.set(item.CategoryId, categoryItems);
  }

  const buildNode = (
    category: MenuCategory,
    ancestorIds: ReadonlySet<number>,
  ): MenuTreeNode => {
    const config = getCategoryVariantConfig(category.Id);
    const directFoods = (itemsByCategory.get(category.Id) ?? []).map((item) =>
      mapMenuItemToFood(item, {
        menuMode,
        categoryTitle: resolveCategoryTitle(categoriesById, item.CategoryId),
      }),
    );

    if (config) {
      return {
        category,
        categorySearchText: normalizePersianText(category.Title),
        foods: [
          ...directFoods,
          ...buildVariantFoods(category, itemsByCategory, menuMode),
        ],
        subcategories: [],
      };
    }

    const nextAncestorIds = new Set(ancestorIds).add(category.Id);
    const children = (childrenByParent.get(category.Id) ?? []).filter(
      (child) => !nextAncestorIds.has(child.Id),
    );

    return {
      category,
      categorySearchText: normalizePersianText(category.Title),
      foods: directFoods,
      subcategories: children.map((child) =>
        buildNode(child, nextAncestorIds),
      ),
    };
  };

  return sortedCategories
    .filter((category) => category.ParentId === null)
    .map((category) => buildNode(category, new Set<number>()));
};

export const filterMenuTreeBySearch = (
  menuTree: MenuTreeNode[],
  query: string,
): MenuTreeNode[] => {
  const normalizedQuery = normalizePersianText(query);

  const filterNode = (
    node: MenuTreeNode,
    ancestorCategoryMatches = false,
  ): MenuTreeNode | null => {
    const categoryMatches = node.categorySearchText.includes(normalizedQuery);
    const includeAllFoods = ancestorCategoryMatches || categoryMatches;
    const foods = includeAllFoods
      ? node.foods
      : node.foods.filter((food) => food.searchText.includes(normalizedQuery));
    const subcategories = node.subcategories.flatMap((child) => {
      const filteredChild = filterNode(child, includeAllFoods);
      return filteredChild ? [filteredChild] : [];
    });

    if (foods.length === 0 && subcategories.length === 0) return null;
    return { ...node, foods, subcategories };
  };

  return menuTree.flatMap((node) => {
    const filteredNode = filterNode(node);
    return filteredNode ? [filteredNode] : [];
  });
};

export const flattenOrderableFoods = (menuTree: MenuTreeNode[]) => {
  const foods: Food[] = [];

  const visitNode = (node: MenuTreeNode) => {
    for (const food of node.foods) {
      if (!food.variants) {
        foods.push(food);
        continue;
      }

      for (const variant of food.variants) {
        foods.push({
          ...food,
          id: variant.itemId,
          sourceItemId: variant.itemId,
          orderKey: variant.orderKey,
          name: food.name,
          image: variant.image,
          hasRealImage: variant.hasRealImage,
          shortDescription: variant.shortDescription,
          price: variant.price,
          enabled: variant.enabled,
          favoriteEnabled: variant.enabled,
          rank: variant.rank,
          summary: variant.summary,
          searchText: variant.searchText,
          variants: undefined,
          variant: {
            key: variant.key,
            label: variant.label,
            description: variant.description,
            categoryId: variant.categoryId,
          },
        });
      }
    }

    node.subcategories.forEach(visitNode);
  };

  menuTree.forEach(visitNode);
  return foods;
};

export const extractArrayData = <T>(response: unknown): T[] => {
  if (Array.isArray(response)) return response as T[];
  if (!response || typeof response !== "object") return [];

  const directData = (response as { data?: unknown }).data;
  if (Array.isArray(directData)) return directData as T[];

  const result = (response as { result?: unknown }).result;
  if (result && typeof result === "object") {
    const resultData = (result as { data?: unknown }).data;
    if (Array.isArray(resultData)) return resultData as T[];
  }

  return [];
};

const isMenuMode = (value: unknown): value is MenuMode =>
  value === "delivery" || value === "dineIn";

export const getLastMenuMode = (): MenuMode => {
  if (typeof window === "undefined") return "dineIn";
  const stored = window.localStorage.getItem(LAST_MENU_MODE_KEY);
  return isMenuMode(stored) ? stored : "dineIn";
};

export const saveLastMenuMode = (menuMode: MenuMode) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_MENU_MODE_KEY, menuMode);
};

export const resolveMenuMode = (value: string | null): MenuMode =>
  isMenuMode(value) ? value : getLastMenuMode();

export const getMenuPath = (menuMode: MenuMode) =>
  menuMode === "delivery" ? "/deliverymenu" : "/tablemenu";

const parseFavoriteEntries = (value: string): FavoriteEntry[] => {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((entry) => {
      if (typeof entry === "string") {
        const menuMode = getLastMenuMode();
        return [
          {
            foodId: entry,
            orderKey: createOrderKey(menuMode, entry),
            menuMode,
            quantity: 1,
            addedAt: new Date().toISOString(),
          },
        ];
      }

      if (!entry || typeof entry !== "object") return [];
      const candidate = entry as Partial<FavoriteEntry>;
      if (typeof candidate.foodId !== "string") return [];
      const menuMode = isMenuMode(candidate.menuMode)
        ? candidate.menuMode
        : candidate.orderKey?.startsWith("delivery:")
          ? "delivery"
          : candidate.orderKey?.startsWith("dineIn:")
            ? "dineIn"
            : getLastMenuMode();

      return [
        {
          foodId: candidate.foodId,
          orderKey:
            typeof candidate.orderKey === "string"
              ? candidate.orderKey
              : createOrderKey(menuMode, candidate.foodId),
          menuMode,
          quantity:
            typeof candidate.quantity === "number" && candidate.quantity > 0
              ? candidate.quantity
              : 1,
          addedAt:
            typeof candidate.addedAt === "string"
              ? candidate.addedAt
              : new Date().toISOString(),
        },
      ];
    });
  } catch {
    return [];
  }
};

export const getAllFavorites = (): FavoriteEntry[] => {
  if (typeof window === "undefined") return [];

  const stored = window.localStorage.getItem(ORDER_STORAGE_KEY);
  if (stored) return parseFavoriteEntries(stored);

  const legacy = window.localStorage.getItem(LEGACY_ORDER_STORAGE_KEY);
  return legacy ? parseFavoriteEntries(legacy) : [];
};

export const saveFavorites = (favorites: FavoriteEntry[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(favorites));
};

export const isTimeInRange = (time: string, from: string, to: string) => {
  const toMinutes = (value: string) => {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const current = toMinutes(time);
  const start = toMinutes(from);
  const end = toMinutes(to);
  return current >= start && current <= end;
};

export const isAvailabilityActive = (availability: MenuAvailability) => {
  if (availability.type === "always") return true;

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;

  return isTimeInRange(
    currentTime,
    availability.availableFrom,
    availability.availableTo,
  );
};
