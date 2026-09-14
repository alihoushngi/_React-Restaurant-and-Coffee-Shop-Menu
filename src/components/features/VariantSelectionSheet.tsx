import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { HiXMark } from "react-icons/hi2";
import type { Food, FoodVariantQuantity } from "../../types/menu";
import {
  formatMenuPrice,
  toPersianDigits,
} from "../../lib/menu/utils";
import { useModalBehavior } from "../../hooks/useModalBehavior";

interface VariantSelectionSheetProps {
  food: Food;
  onClose: () => void;
  onConfirm: (selections: FoodVariantQuantity[]) => void;
}

const VariantSelectionSheet = ({
  food,
  onClose,
  onConfirm,
}: VariantSelectionSheetProps) => {
  const variants = useMemo(() => food.variants ?? [], [food.variants]);
  const presentation = food.variantPresentation;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(variants.map((variant) => [variant.key, 0])),
  );
  useModalBehavior({
    isOpen: true,
    onClose,
    dialogRef,
    initialFocusRef: closeButtonRef,
  });

  const totalSelected = variants.reduce(
    (total, variant) =>
      total + (variant.enabled ? (quantities[variant.key] ?? 0) : 0),
    0,
  );
  const totalPrice = variants.reduce((total, variant) => {
    const quantity = variant.enabled ? (quantities[variant.key] ?? 0) : 0;
    return total + (variant.price ?? 0) * quantity;
  }, 0);
  const variantsByKey = useMemo(
    () => new Map(variants.map((variant) => [variant.key, variant])),
    [variants],
  );

  const changeQuantity = (variantKey: string, delta: number) => {
    const variant = variantsByKey.get(variantKey);
    if (!variant?.enabled) return;

    setQuantities((current) => ({
      ...current,
      [variantKey]: Math.max(0, (current[variantKey] ?? 0) + delta),
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-70 bg-zinc-950/60"
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        ref={dialogRef}
        tabIndex={-1}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[88dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl outline-none"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="variant-sheet-title"
      >
        <header className="shrink-0 px-4 pt-3 sm:px-5">
          <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-zinc-200" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2
                id="variant-sheet-title"
                className="text-xl font-bold text-zinc-900"
              >
                {presentation?.sheetTitle ?? food.name}
              </h2>
              <p className="mt-1 text-sm leading-6 text-zinc-500">
                {presentation?.sheetSubtitle ?? "انتخاب سایز"}
              </p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition hover:bg-zinc-200"
              aria-label={`بستن ${presentation?.sheetTitle ?? "انتخاب محصول"}`}
            >
              <HiXMark className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between border-b border-zinc-100 pb-3 text-xs text-zinc-500">
            <span>{toPersianDigits(variants.length)} گزینه</span>
            <span aria-live="polite">
              {totalSelected > 0
                ? `${toPersianDigits(totalSelected)} مورد انتخاب شده`
                : "هنوز موردی انتخاب نشده"}
            </span>
          </div>
        </header>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          {variants.map((variant) => {
            const quantity = variant.enabled
              ? (quantities[variant.key] ?? 0)
              : 0;
            const optionTitle = `${variant.label} (${variant.description})`;

            return (
              <div
                key={variant.key}
                className={`rounded-2xl border p-4 transition-colors ${
                  variant.enabled
                    ? quantity > 0
                      ? "border-[#7a394a]/35 bg-[#fff7f4]"
                      : "border-zinc-200 bg-white"
                    : "border-zinc-100 bg-zinc-50 opacity-60"
                }`}
                aria-disabled={!variant.enabled}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold leading-6 text-zinc-900">
                      {optionTitle}
                    </h3>
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-sm leading-6 font-bold text-black">
                    {formatMenuPrice(variant.price)}
                  </span>
                </div>

                {!variant.enabled ? (
                  <p className="mt-3 text-xs font-medium leading-5 text-rose-600">
                    متاسفانه در حال حاضر قابل سفارش نیست
                  </p>
                ) : (
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="order-available-text whitespace-nowrap text-xs font-medium">
                      قابل سفارش
                    </span>
                    <div
                      dir="ltr"
                      role="group"
                      aria-label={`تعداد ${presentation?.optionLabel ?? "گزینه"} ${optionTitle}`}
                      className="flex shrink-0 items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 p-1"
                    >
                      <button
                        type="button"
                        onClick={() => changeQuantity(variant.key, -1)}
                        disabled={quantity === 0}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-bold text-[#7a394a] shadow-sm disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label={`کم کردن تعداد ${optionTitle}`}
                      >
                        −
                      </button>
                      <span
                        className="min-w-7 text-center text-base font-bold text-zinc-900"
                        aria-live="polite"
                      >
                        {toPersianDigits(quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeQuantity(variant.key, 1)}
                        className="product-add-button flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold shadow-sm"
                        aria-label={`افزودن تعداد ${optionTitle}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <footer className="shrink-0 border-t border-zinc-100 bg-white px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.05)] sm:px-5">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-zinc-500">جمع انتخاب‌ها</p>
              <p className="mt-0.5 font-bold text-zinc-900">
                {toPersianDigits(totalSelected)} مورد
              </p>
            </div>
            {totalSelected > 0 ? (
              <div className="text-left">
                <p className="text-xs text-zinc-500">مبلغ کل</p>
                <p className="mt-0.5 font-bold text-zinc-900">
                  {formatMenuPrice(totalPrice)}
                </p>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() =>
              onConfirm(
                variants.flatMap((variant) => {
                  const quantity = variant.enabled
                    ? (quantities[variant.key] ?? 0)
                    : 0;
                  return quantity > 0 ? [{ variant, quantity }] : [];
                }),
              )
            }
            disabled={totalSelected === 0}
            className="product-add-button min-h-12 w-full rounded-2xl px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {totalSelected > 0
              ? `افزودن ${toPersianDigits(totalSelected)} مورد به لیست سفارش`
              : "افزودن به لیست سفارش"}
          </button>
        </footer>
      </motion.div>
    </motion.div>
  );
};

export default VariantSelectionSheet;
