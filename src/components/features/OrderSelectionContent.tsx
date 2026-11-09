import type { Food } from "../../types/menu";
import type { ResolvedOrderSelection } from "../../lib/menu/utils";
import {
  formatMenuPrice,
  getCartItemLabels,
  isFoodAvailable,
  MAX_ORDER_SELECTION_QUANTITY,
  toPersianDigits,
} from "../../lib/menu/utils";
import ProductImage from "../ui/ProductImage";

interface OrderSelectionContentProps {
  selections: ResolvedOrderSelection[];
  isLoading?: boolean;
  onClose?: () => void;
  onOpenFood: (food: Food) => void;
  onIncrement: (food: Food) => void;
  onDecrement: (food: Food) => void;
  onRemoveLine: (food: Food, quantity: number) => void;
  onRequestClear?: () => void;
}

const OrderSelectionContent = ({
  selections,
  isLoading = false,
  onClose,
  onOpenFood,
  onIncrement,
  onDecrement,
  onRemoveLine,
  onRequestClear,
}: OrderSelectionContentProps) => {
  if (isLoading) {
    return (
      <div className="px-1 py-16 text-center text-sm text-zinc-500">
        در حال بارگذاری انتخاب‌ها...
      </div>
    );
  }

  if (selections.length === 0) {
    return (
      <div className="px-1 py-9 text-center text-[13px] leading-7 text-zinc-500">
        <p>هنوز چیزی انتخاب نکرده‌اید.</p>
        <p>از منو، غذای دلخواهتان را پیدا کنید.</p>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="mt-2 text-[11px] font-semibold text-[#7a394a] underline-offset-2 hover:underline"
          >
            بازگشت به منو ←
          </button>
        ) : null}
      </div>
    );
  }

  const total = selections.reduce(
    (sum, entry) => sum + (entry.food.price ?? 0) * entry.quantity,
    0,
  );

  return (
    <div className="space-y-4">
      {onRequestClear ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onRequestClear}
            className="min-h-10 rounded-xl px-3 text-[11px] font-semibold text-[#9b6576] transition hover:bg-[#f7f1f3]"
          >
            پاک کردن لیست
          </button>
        </div>
      ) : null}

      <div className="grid gap-3">
        {selections.map((entry) => {
          const labels = getCartItemLabels(entry.food);
          const unitPrice = entry.food.price ?? 0;
          const lineTotal = unitPrice * entry.quantity;
          const canIncrement = entry.quantity < MAX_ORDER_SELECTION_QUANTITY;

          return (
            <article
              key={entry.resolvedOrderKey}
              className="rounded-2xl border border-[#eeeeee] p-3"
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => onOpenFood(entry.food)}
                  className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-zinc-100"
                  aria-label={`مشاهده جزئیات ${entry.food.name}`}
                >
                  <ProductImage
                    src={entry.food.image}
                    hasRealImage={entry.food.hasRealImage}
                    alt={entry.food.name}
                    className="h-full w-full"
                    logoClassName="p-6"
                    width={112}
                    height={112}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onOpenFood(entry.food)}
                    className="text-right"
                  >
                    <strong className="block text-[13px] font-bold leading-6 text-zinc-900">
                      {entry.food.name}
                    </strong>
                  </button>
                  {labels ? (
                    <p className="mt-0.5 text-[11px] leading-5 text-zinc-500">
                      {labels}
                    </p>
                  ) : null}
                  <p className="mt-0.5 text-[11px] leading-5 text-zinc-500">
                    هر عدد {formatMenuPrice(unitPrice)}
                  </p>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between gap-2">
                <div
                  dir="ltr"
                  role="group"
                  aria-label={`تعداد ${entry.food.name}`}
                  className="flex items-center gap-1 rounded-xl border border-zinc-200 p-0.5 [direction:ltr]"
                >
                  <button
                    type="button"
                    onClick={() => onDecrement(entry.food)}
                    className="flex h-[30px] w-8 items-center justify-center text-[22px] leading-none text-[#637d6c]"
                    aria-label={`کم کردن ${entry.food.name}`}
                  >
                    −
                  </button>
                  <output className="min-w-5 text-center text-[13px] font-semibold text-zinc-900">
                    {toPersianDigits(entry.quantity)}
                  </output>
                  <button
                    type="button"
                    onClick={() => onIncrement(entry.food)}
                    disabled={
                      !canIncrement ||
                      !isFoodAvailable(
                        entry.food.enabled,
                        entry.food.availability ?? { type: "always" },
                      )
                    }
                    className="flex h-[30px] w-8 items-center justify-center text-[22px] leading-none text-[#637d6c] disabled:opacity-40"
                    aria-label={`زیاد کردن ${entry.food.name}`}
                  >
                    +
                  </button>
                </div>
                <strong className="text-[13px] font-bold text-zinc-900">
                  {formatMenuPrice(lineTotal)}
                </strong>
                <button
                  type="button"
                  onClick={() => onRemoveLine(entry.food, entry.quantity)}
                  className="text-[11px] text-[#9b6576]"
                >
                  حذف
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-dashed border-[#ded2d5] pt-3.5 text-sm font-bold text-zinc-900">
        <span>جمع انتخاب‌ها</span>
        <span>{formatMenuPrice(total)}</span>
      </div>

      <p className="rounded-xl bg-[#f7f7f7] px-3 py-2.5 text-[11px] leading-6 text-zinc-500">
        این لیست برای مرور انتخاب‌هاست و سفارشی به رستوران ارسال نمی‌کند.
      </p>
    </div>
  );
};

export default OrderSelectionContent;
