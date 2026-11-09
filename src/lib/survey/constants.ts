export const SURVEY_STORAGE_KEY = "rayo-menu-survey-preview-v1";
export const SURVEY_STORAGE_LIMIT = 100;

export const SURVEY_QUESTIONS = [
  { id: "food", label: "کیفیت غذا و نوشیدنی" },
  { id: "staff", label: "برخورد و توجه همکاران" },
  { id: "cleanliness", label: "تمیزی و بهداشت فضا" },
  { id: "speed", label: "زمان آماده‌شدن سفارش" },
  { id: "comfort", label: "راحتی و حال‌وهوای فضا" },
  { id: "value", label: "ارزش تجربه نسبت به هزینه" },
] as const;

export type SurveyQuestionId = (typeof SURVEY_QUESTIONS)[number]["id"];

export const RATING_GUIDE_LABELS = [
  "ضعیف",
  "نیاز به بهبود",
  "متوسط",
  "خوب",
  "عالی",
] as const;

export const SURVEY_SHEET_TITLE = "تجربه‌ات در رایو";

export const SURVEY_MESSAGES = {
  missingFeedback:
    "به یکی از بخش‌ها امتیاز بده یا چند کلمه درباره تجربه‌ات بنویس.",
  invalidRating: "امتیازها باید بین ۱ تا ۵ باشند.",
  invalidPhone: "شماره موبایل رو با ۱۱ رقم و با ۰۹ وارد کن.",
  invalidVisitDate: "تاریخ حضور معتبر نیست.",
  storageFailed:
    "ذخیره روی این دستگاه انجام نشد. دسترسی مرورگر به حافظه رو بررسی کن و دوباره امتحان کن.",
  successTitle: "ممنون که وقت گذاشتی",
  successBody: "بازخورد آزمایشی روی همین دستگاه ذخیره شد.",
  demoNotice:
    "این فایل هنوز به سیستم دریافت نظرات رایو وصل نیست؛ نظری برای رستوران ارسال نشده و پیگیری واقعی از این نسخه انجام نمی‌شود.",
  submitLabel: "ثبت آزمایشی بازخورد",
  thanks: "ممنون که کمک می‌کنی رایو بهتر بشه 💚",
} as const;
