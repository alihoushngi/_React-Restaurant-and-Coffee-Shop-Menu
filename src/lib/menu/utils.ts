import type {
  FavoriteEntry,
  Food,
  MenuCategory,
  MenuItem,
} from "../../types/menu";

export interface MenuTreeNode {
  category: MenuCategory;
  foods: Food[];
  subcategories: MenuTreeNode[];
}

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: 0,
  }).format(price);

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

export const getCategoryIcon = (categoryId: number | string): string => {
  return `https://placehold.co/60x60/7a394a/white?text=${categoryId}&font=playfair`;
};

export const mapMenuItemToFood = (item: MenuItem): Food => ({
  id: item.Id,
  categoryId: item.CategoryId,
  name: item.Title,
  image:
    item.HasPic && item.ImageUrl
      ? item.ImageUrl
      : `https://placehold.co/600x400/eee/333?text=${encodeURIComponent(
          item.Title.substring(0, 15),
        )}`,
  shortDescription: item.Summary || "بدون توضیحات",
  price: item.Price || 0,
  favoriteEnabled: item.Enable,
  availability: {
    type: "always",
  },
  rank: item.Rank,
  summary: item.Summary,
});

export const sortCategories = (categories: MenuCategory[]) =>
  [...categories].sort((a, b) => a.Rank - b.Rank);

export const buildMenuTree = (
  categories: MenuCategory[],
  items: MenuItem[],
): MenuTreeNode[] => {
  const enabledItems = items.filter((item) => item.Enable);

  const sortedCategories = sortCategories(categories);

  const rootCategories = sortedCategories.filter(
    (category) => category.ParentId === null,
  );

  const getFoodsForCategory = (categoryId: number): Food[] => {
    return enabledItems
      .filter((item) => item.CategoryId === categoryId)
      .map(mapMenuItemToFood);
  };

  const buildNode = (category: MenuCategory): MenuTreeNode => {
    const children = sortedCategories.filter(
      (child) => child.ParentId === category.Id,
    );

    return {
      category,

      /**
       * آیتم هایی که مستقیم به این دسته وصل هستند
       *
       * مثال:
       * CategoryId:20
       * CategoryParentId:null
       *
       * مستقیم داخل قلیان
       */
      foods: getFoodsForCategory(category.Id),

      /**
       * ساب کتگوری ها
       *
       * مثال:
       * نوشیدنی گرم
       *   ├ دمنوش و چایی
       *   └ برپایه شیر
       */
      subcategories: children.map(buildNode),
    };
  };

  return rootCategories.map(buildNode);
};

export const getAllFavorites = (): FavoriteEntry[] => {
  if (typeof window === "undefined") return [];

  const stored = window.localStorage.getItem("Rayo-order-items");

  if (stored) {
    return JSON.parse(stored) as FavoriteEntry[];
  }

  // Legacy support
  const legacy = window.localStorage.getItem("Rayo-favorites");

  if (legacy) {
    const parsed = JSON.parse(legacy) as Array<string | { foodId: string }>;

    return parsed.map((item) => {
      if (typeof item === "string") {
        return {
          foodId: item,
          quantity: 1,
          addedAt: new Date().toISOString(),
        };
      }

      return {
        foodId: item.foodId,
        quantity: 1,
        addedAt: new Date().toISOString(),
      };
    });
  }

  return [];
};

export const saveFavorites = (favorites: FavoriteEntry[]) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem("Rayo-order-items", JSON.stringify(favorites));
};

export type MenuAvailability =
  | {
      type: "always";
    }
  | {
      type: "hours";
      availableFrom: string;
      availableTo: string;
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

export const isAvailabilityActive = (
  availability: MenuAvailability,
  currentTime = new Date(),
) => {
  if (availability.type === "always") {
    return true;
  }

  if (!availability.availableFrom || !availability.availableTo) {
    return false;
  }

  const time = `${currentTime
    .getHours()
    .toString()
    .padStart(2, "0")}:${currentTime.getMinutes().toString().padStart(2, "0")}`;

  return isTimeInRange(
    time,
    availability.availableFrom,
    availability.availableTo,
  );
};
