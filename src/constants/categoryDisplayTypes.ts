import type { CategoryDisplayType } from "../types/menu";

/**
 * Client-side category display contract used when API omits DisplayType.
 * Explicit API values always win via resolveCategoryDisplayType.
 */
export const CATEGORY_DISPLAY_TYPE_BY_ID: Readonly<
  Partial<Record<number, CategoryDisplayType>>
> = {
  20: "FirstItemImage",
  /** قهوه ها — زیردسته‌های آینده با ParentId=25 از والد ارث می‌برند */
  25: "SmallImageLeft",
  /** پایه اسپرسو (سرد) — زیر درخت سرد؛ قرارداد مستقیم چون OtherParentId در درخت نیست */
  21: "SmallImageLeft",
  /** نوشیدنی های گرم — فرزندان 9/10 با ارث والد */
  24: "SmallImageLeft",
  /** شیک */
  26: "SmallImageLeft",
  /**
   * ماکتیل و سرد نوش (MENU-016 EC-1=B): تا تفکیک API، کل دسته شامل نوشابه/آب compact است.
   */
  11: "SmallImageLeft",
};

export const getContractedDisplayType = (
  categoryId: number,
): CategoryDisplayType | undefined =>
  CATEGORY_DISPLAY_TYPE_BY_ID[categoryId];
