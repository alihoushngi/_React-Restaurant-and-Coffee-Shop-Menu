import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { HiXMark } from "react-icons/hi2";
import type { Food, FoodVariantQuantity } from "../../types/menu";
import { formatMenuPrice, toPersianDigits } from "../../lib/menu/utils";
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
  const variants = food.variants ?? [];
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

  const changeQuantity = (variantKey: string, delta: number) => {
    const variant = variants.find((item) => item.key === variantKey);
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
        className="absolute inset-x-0 bottom-0 mx-auto max-h-[88dvh] w-full max-w-xl overflow-y-auto overscroll-contain rounded-t-[28px] bg-white p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl outline-none sm:p-5"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="variant-sheet-title"
      >
        <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-zinc-200" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="variant-sheet-title" className="text-xl font-bold text-zinc-900">
              {food.name}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">انتخاب سایز</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100"
            aria-label="بستن انتخاب سایز"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {variants.map((variant) => {
            const quantity = variant.enabled
              ? (quantities[variant.key] ?? 0)
              : 0;

            return (
              <div
                key={variant.key}
                className={`rounded-2xl border p-4 transition ${
                  variant.enabled
                    ? "border-zinc-200 bg-white"
                    : "border-zinc-100 bg-zinc-50 opacity-60"
                }`}
                aria-disabled={!variant.enabled}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-zinc-900">
                    {variant.label} ({variant.description})
                  </span>
                  <span className="text-sm font-semibold text-amber-700">
                    {formatMenuPrice(variant.price)}
                  </span>
                </div>

                {!variant.enabled ? (
                  <p className="mt-3 text-xs font-medium leading-5 text-rose-600">
                    متاسفانه در حال حاضر قابل سفارش نیست
                  </p>
                ) : (
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-emerald-600">
                      قابل سفارش
                    </span>
                    <div
                      dir="ltr"
                      role="group"
                      aria-label={`تعداد ${variant.label} ${variant.description}`}
                      className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 p-1"
                    >
                      <button
                        type="button"
                        onClick={() => changeQuantity(variant.key, -1)}
                        disabled={quantity === 0}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-bold text-[#7a394a] shadow-sm disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label={`کم کردن تعداد ${variant.label}`}
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
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7a394a] text-lg font-bold text-white shadow-sm"
                        aria-label={`افزودن تعداد ${variant.label}`}
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
          className="mt-5 w-full rounded-2xl bg-[#7a394a] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          افزودن به لیست سفارش
        </button>
      </motion.div>
    </motion.div>
  );
};

export default VariantSelectionSheet;
