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
