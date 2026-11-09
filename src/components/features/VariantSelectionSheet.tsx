import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import type { Food, FoodVariantQuantity } from "../../types/menu";
import {
  formatMenuPrice,
  toPersianDigits,
} from "../../lib/menu/utils";
import {
  SHEET_BODY_WITH_FOOTER_CLASS,
  SHEET_FOOTER_CLASS,
  SHEET_OVERLAY_NESTED_CLASS,
  SHEET_PANEL_CLASS,
  sheetOverlayMotion,
  sheetPanelMotion,
} from "../../lib/ui/sheetMotion";
import SheetHeader from "../ui/SheetHeader";
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
  const reduceMotion = useReducedMotion() === true;
  const variants = useMemo(() => food.variants ?? [], [food.variants]);
  const presentation = food.variantPresentation;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const overlayMotion = sheetOverlayMotion(reduceMotion);
  const panelMotion = sheetPanelMotion(reduceMotion);
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
      {...overlayMotion}
      className={SHEET_OVERLAY_NESTED_CLASS}
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        ref={dialogRef}
        tabIndex={-1}
        {...panelMotion}
        className={SHEET_PANEL_CLASS}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="variant-sheet-title"
      >
        <SheetHeader
          titleId="variant-sheet-title"
          title={presentation?.sheetTitle ?? food.name}
          subtitle={
            <>
              <p className="mt-1 text-[13px] leading-6 text-[#71717a]">
                {presentation?.sheetSubtitle ?? "انتخاب گزینه"}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-[#71717a]">
                <span>{toPersianDigits(variants.length)} گزینه</span>
                <span aria-live="polite">
                  {totalSelected > 0
                    ? `${toPersianDigits(totalSelected)} مورد انتخاب شده`
                    : "هنوز موردی انتخاب نشده"}
                </span>
              </div>
            </>
          }
          onClose={onClose}
          closeLabel={`بستن ${presentation?.sheetTitle ?? "انتخاب محصول"}`}
          closeRef={closeButtonRef}
        />

        <div className={`${SHEET_BODY_WITH_FOOTER_CLASS} space-y-2`}>
          {variants.map((variant) => {
            const quantity = variant.enabled
              ? (quantities[variant.key] ?? 0)
              : 0;
            const optionTitle = `${variant.label} (${variant.description})`;

            return (
              <div
                key={variant.key}
                className={`min-h-[46px] rounded-xl border px-3 py-3 transition-colors ${
                  variant.enabled
                    ? quantity > 0
                      ? "border-[#986071] bg-[#fbf4f6]"
                      : "border-[#e6e1e2] bg-white"
                    : "border-zinc-100 bg-zinc-50 opacity-60"
                }`}
                aria-disabled={!variant.enabled}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[13px] font-bold leading-6 text-[#242424]">
                      {optionTitle}
                    </h3>
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-sm leading-6 font-bold text-[#151515]">
                    {formatMenuPrice(variant.price)}
                  </span>
                </div>

                {!variant.enabled ? (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#8a8a8a]">
                    <span
                      className="inline-flex h-[9px] w-[9px] shrink-0 rounded-full bg-[#a1a1aa]"
                      aria-hidden="true"
                    />
                    <span>ناموجود</span>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-[11px] text-[#8a8a8a]">
                      <span
                        className="inline-flex h-[9px] w-[9px] shrink-0 rounded-full bg-[#10b981]"
                        aria-hidden="true"
                      />
                      قابل سفارش
                    </span>
                    <div
                      dir="ltr"
                      role="group"
                      aria-label={`تعداد ${presentation?.optionLabel ?? "گزینه"} ${optionTitle}`}
                      className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#e4e4e7] p-0.5 [direction:ltr]"
                    >
                      <button
                        type="button"
                        onClick={() => changeQuantity(variant.key, -1)}
                        disabled={quantity === 0}
                        className="flex h-[38px] w-8 items-center justify-center text-[22px] leading-none text-[#637d6c] disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label={`کم کردن تعداد ${optionTitle}`}
                      >
                        −
                      </button>
                      <span
                        className="min-w-5 text-center text-[13px] font-semibold text-zinc-900"
                        aria-live="polite"
                      >
                        {toPersianDigits(quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => changeQuantity(variant.key, 1)}
                        className="flex h-[38px] w-8 items-center justify-center text-[22px] leading-none text-[#637d6c]"
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

        <footer className={SHEET_FOOTER_CLASS}>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-[#71717a]">جمع انتخاب‌ها</p>
              <p className="mt-0.5 font-bold text-[#242424]">
                {toPersianDigits(totalSelected)} مورد
              </p>
            </div>
            {totalSelected > 0 ? (
              <div className="text-left">
                <p className="text-xs text-[#71717a]">مبلغ کل</p>
                <p className="mt-0.5 font-bold text-[#151515]">
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
            className="product-add-button min-h-[46px] w-full rounded-[14px] px-4 py-3 text-xs font-bold disabled:cursor-not-allowed"
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
