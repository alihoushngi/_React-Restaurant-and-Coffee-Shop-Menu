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
  IsForTwo?: boolean | null;
  IsDietary?: boolean | null;
  IsVegetarian?: boolean | null;
  IsPopular?: boolean | null;
  IsRecommendedDrink?: boolean | null;
  ShowInSearch?: boolean | null;
}
