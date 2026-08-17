export interface MenuCategory {
  Id: number;

  Title: string;

  Rank: number;

  ParentId: number | null;

  OtherParentId: number | null;

  BeforeLunchRank: number;

  Delivery: boolean;

  HasChild: boolean;

  ImageUrl: string;
}

export interface MenuItem {
  Id: number;

  Title: string;

  Summary: string | null;

  Rank: number;

  CategoryId: number;

  CategoryParentId: number | null;

  Price: number | null;

  SmallPrice: number | null;

  Enable: boolean;

  HasPic: boolean;

  Delivery: boolean;

  JustTestTime: boolean;

  HideForMidweekBreakfast: boolean;

  ImageUrl: string;

  IsNew?: boolean;
}

export type MenuMode = "delivery" | "dineIn";

export interface MenuTreeNode {
  category: MenuCategory;

  categorySearchText: string;

  foods: Food[];

  subcategories: MenuTreeNode[];
}

export type MenuAvailability =
  | {
      type: "always";
    }
  | {
      type: "hours";
      availableFrom: string;
      availableTo: string;
    };

export interface Food {
  id: string | number;

  sourceItemId?: number;

  orderKey: string;

  menuMode: MenuMode;

  categoryId: string | number;

  categoryTitle: string;

  name: string;

  image: string;

  hasRealImage: boolean;

  shortDescription: string;

  price: number | null;

  enabled: boolean;

  isPopular?: boolean;

  favoriteEnabled?: boolean;

  availability?: MenuAvailability;

  rank?: number;

  summary?: string | null;

  searchText: string;

  variants?: FoodVariant[];

  variant?: FoodVariantMeta;
}

export interface FoodVariantMeta {
  key: string;

  label: string;

  description: string;

  categoryId: number;
}

export interface FoodVariant extends FoodVariantMeta {
  itemId: number;

  title: string;

  orderKey: string;

  price: number | null;

  enabled: boolean;

  image: string;

  hasRealImage: boolean;

  shortDescription: string;

  summary?: string | null;

  rank?: number;

  searchText: string;
}

export interface FavoriteEntry {
  foodId: string;

  orderKey?: string;

  menuMode?: MenuMode;

  quantity: number;

  addedAt: string;
}

export interface OrderSelection {
  foodId: string;

  orderKey: string;

  menuMode: MenuMode;
}

export interface OrderSelectionQuantity extends OrderSelection {
  quantity: number;
}

export interface FoodVariantQuantity {
  variant: FoodVariant;
  quantity: number;
}
