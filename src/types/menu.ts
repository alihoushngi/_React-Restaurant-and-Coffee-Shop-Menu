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

  Summary: string;

  Rank: number;

  CategoryId: number;

  CategoryParentId: number | null;

  Price: number;

  SmallPrice: number | null;

  Enable: boolean;

  HasPic: boolean;

  Delivery: boolean;

  JustTestTime: boolean;

  HideForMidweekBreakfast: boolean;

  ImageUrl: string;
}

export interface MenuTreeNode {
  category: MenuCategory;

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

  categoryId: string | number;

  name: string;

  image: string;

  shortDescription: string;

  price: number;

  isPopular?: boolean;

  favoriteEnabled?: boolean;

  availability?: MenuAvailability;

  rank?: number;

  summary?: string;
}

export interface FavoriteEntry {
  foodId: string;

  quantity: number;

  addedAt: string;
}
