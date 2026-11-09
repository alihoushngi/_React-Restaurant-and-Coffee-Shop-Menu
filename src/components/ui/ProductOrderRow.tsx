import type { MouseEventHandler, ReactNode } from "react";
import clsx from "clsx";
import type { MenuAvailability } from "../../types/menu";
import { toPersianDigits } from "../../lib/menu/utils";
import AvailabilityIndicator from "./AvailabilityIndicator";

interface ProductOrderRowProps {
  productName: string;
  compact?: boolean;
  enabled: boolean;
  availability: MenuAvailability;
  isAvailable: boolean;
  hasVariants: boolean;
  variantActionLabel?: string;
  quantity: number;
  appearance: "card" | "details";
  price: ReactNode;
  onAddToOrder: MouseEventHandler<HTMLButtonElement>;
  onRemoveFromOrder: MouseEventHandler<HTMLButtonElement>;
}

const ProductOrderRow = ({
  productName,
  compact = false,
  enabled,
  availability,
  isAvailable,
  hasVariants,
  variantActionLabel,
  quantity,
  appearance,
  price,
  onAddToOrder,
  onRemoveFromOrder,
}: ProductOrderRowProps) => {
  const showQuantitySelector = !hasVariants && quantity > 0;
  const unavailableLabel =
    appearance === "details" ? "فعلاً موجود نیست" : "ناموجود";
  const addLabel = variantActionLabel ?? "افزودن";

  const unavailableButton = (
    <button
      type="button"
      disabled
      aria-label={`${unavailableLabel} ${productName}`}
      className={clsx(
        "product-add-button whitespace-nowrap font-bold disabled:cursor-not-allowed",
        appearance === "details"
          ? "min-h-[46px] flex-1 rounded-[14px] px-4 py-2.5 text-xs"
          : "min-h-[42px] rounded-full px-2.5 py-2 text-xs",
      )}
    >
      {unavailableLabel}
    </button>
  );

  const quantityStepper = (
    <div
      dir="ltr"
      role="group"
      aria-label={`تعداد ${productName}`}
      className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#e4e4e7] p-0.5 [direction:ltr]"
    >
      <button
        type="button"
        onClick={onRemoveFromOrder}
        className="flex h-[38px] w-8 items-center justify-center text-[22px] leading-none text-[#637d6c]"
        aria-label={`کم کردن ${productName}`}
      >
        −
      </button>
      <span
        className="min-w-5 text-center text-[13px] font-semibold text-zinc-900"
        aria-live="polite"
      >
        {toPersianDigits(quantity)}
      </span>
      {isAvailable ? (
        <button
          type="button"
          onClick={onAddToOrder}
          className="flex h-[38px] w-8 items-center justify-center text-[22px] leading-none text-[#637d6c]"
          aria-label={`افزودن ${productName}`}
        >
          +
        </button>
      ) : null}
    </div>
  );

  if (appearance === "details") {
    return (
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <AvailabilityIndicator
            enabled={enabled}
            availability={availability}
          />
          <div className="shrink-0">{price}</div>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          {!isAvailable ? (
            unavailableButton
          ) : hasVariants ? (
            <button
              type="button"
              onClick={onAddToOrder}
              className="product-add-button min-h-[46px] w-full flex-1 rounded-[14px] px-4 py-2.5 text-xs font-bold"
            >
              {addLabel}
            </button>
          ) : showQuantitySelector ? (
            <>
              {quantityStepper}
              <button
                type="button"
                onClick={onAddToOrder}
                className="product-add-button min-h-[46px] flex-1 rounded-[14px] px-4 py-2.5 text-xs font-bold"
              >
                افزودن
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onAddToOrder}
              className="product-add-button min-h-[46px] w-full flex-1 rounded-[14px] px-4 py-2.5 text-xs font-bold"
            >
              افزودن
            </button>
          )}
        </div>
      </div>
    );
  }

  if (hasVariants && variantActionLabel) {
    return (
      <div className="space-y-3">
        <div className="flex min-w-0 items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <AvailabilityIndicator
              enabled={enabled}
              availability={availability}
            />
          </div>
          <div className="shrink-0">{price}</div>
        </div>
        {isAvailable ? (
          <button
            type="button"
            onClick={onAddToOrder}
            className="product-add-button min-h-11 w-full rounded-2xl px-4 py-2.5 text-sm font-bold"
          >
            {variantActionLabel}
          </button>
        ) : (
          <button
            type="button"
            disabled
            aria-label={`${unavailableLabel} ${productName}`}
            className="product-add-button min-h-11 w-full rounded-2xl px-4 py-2.5 text-sm font-bold disabled:cursor-not-allowed"
          >
            {unavailableLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center justify-between gap-x-2">
      {!compact ? (
        <div className="min-w-0 flex-1">
          <AvailabilityIndicator enabled={enabled} availability={availability} />
        </div>
      ) : null}

      <div className="flex shrink-0 items-center justify-end gap-x-2">
        <div className="shrink-0">{price}</div>

        {!isAvailable && !showQuantitySelector ? (
          unavailableButton
        ) : hasVariants ? (
          isAvailable ? (
            <button
              type="button"
              onClick={onAddToOrder}
              aria-label={`افزودن ${productName}`}
              className="product-add-button min-h-[42px] whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-bold"
            >
              {addLabel}
            </button>
          ) : (
            unavailableButton
          )
        ) : showQuantitySelector ? (
          quantityStepper
        ) : (
          <button
            type="button"
            onClick={onAddToOrder}
            aria-label={`افزودن ${productName}`}
            className="product-add-button min-h-[42px] whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-bold"
          >
            افزودن
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductOrderRow;
