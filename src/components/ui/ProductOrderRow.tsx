import type { MouseEventHandler, ReactNode } from "react";
import type { MenuAvailability } from "../../types/menu";
import AvailabilityIndicator from "./AvailabilityIndicator";

interface ProductOrderRowProps {
  productName: string;
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
  const showOrderControls = isAvailable || (!hasVariants && quantity > 0);
  const showQuantitySelector = !hasVariants && quantity > 0;
  const decrementClasses =
    appearance === "card"
      ? "bg-[#7a394a] text-white"
      : "bg-zinc-100 text-zinc-700";

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
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center justify-between gap-x-3">
      <div className="min-w-0 flex-1">
        <AvailabilityIndicator enabled={enabled} availability={availability} />
      </div>

      <div className="flex shrink-0 items-center justify-end gap-x-3">
        <div className="shrink-0">{price}</div>

        {showOrderControls ? (
          <div
            dir="ltr"
            role="group"
            aria-label={`تعداد ${productName}`}
            className={`flex shrink-0 items-center [direction:ltr] ${
              showQuantitySelector
                ? "gap-2 rounded-full border border-zinc-200 bg-zinc-50 p-1 shadow-sm"
                : "border-0"
            }`}
          >
            {hasVariants ? (
              <button
                type="button"
                onClick={onAddToOrder}
                className="product-add-button whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold"
              >
                {variantActionLabel ?? "افزودن"}
              </button>
            ) : quantity > 0 ? (
              <>
                <button
                  type="button"
                  onClick={onRemoveFromOrder}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold ${decrementClasses}`}
                  aria-label={`کم کردن ${productName}`}
                >
                  −
                </button>
                <span
                  className="min-w-8 text-center text-sm font-semibold text-zinc-900"
                  aria-live="polite"
                >
                  {quantity}
                </span>
                {isAvailable ? (
                  <button
                    type="button"
                    onClick={onAddToOrder}
                    className="product-add-button flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold"
                    aria-label={`افزودن ${productName}`}
                  >
                    +
                  </button>
                ) : null}
              </>
            ) : (
              <button
                type="button"
                onClick={onAddToOrder}
                className="product-add-button whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold"
              >
                افزودن
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ProductOrderRow;
