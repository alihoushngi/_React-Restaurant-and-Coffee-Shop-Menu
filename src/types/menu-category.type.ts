export interface MenuCategory {
  Id: number;
  Title: string;
  Rank: number;
  ParentId: number | null;
  OtherParentId: number | null;
  BeforeLunchRank: number;
  Delivery: boolean;
  HasChild: boolean;
}
