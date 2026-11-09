/**
 * When true: subcategory chips act as tabs.
 * When false: all subcategory items render sequentially under the parent
 * with reference pill headings (MENU-012).
 *
 * Pizza junior/large stays paired via CATEGORY_VARIANT_CONFIG (no sub tabs).
 * Flip to true only to restore the previous tabbed subcategory UX.
 */
export const SHOW_SUBCATEGORY_TABS = false;

/** Shown under the sticky logo on dine-in and delivery menus. */
export const WELCOME_TITLE = "به رایو خوش آمدید";

export const TABLE_TIME_NOTICE =
  "شب‌های تعطیل و آخر هفته، برای اینکه بتونیم میزبان مهمون‌های بیشتری باشیم، زمان استفاده از میز تا ۲ ساعته. بقیه وقت‌ها خوشحال می‌شیم بیشتر کنارمون بمونید 💚";

/** Reference endnote after the last visible menu category (MENU-014). */
export const FOOD_ALLERGY_ENDNOTE =
  "حساسیت غذایی یا سؤال درباره ترکیبات داری؟ قبل از سفارش با همکارهای ما در میون بذار تا راهنمایی‌ات کنیم.";
