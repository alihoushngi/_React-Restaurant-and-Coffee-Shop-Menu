import type { Food } from "../../types/menu";
import { formatMenuPrice } from "../../lib/menu/utils";

interface ProductPriceProps {
  food: Food;
  appearance: "card" | "details";
}

const ProductPrice = ({ food, appearance }: ProductPriceProps) => {
  const priceClasses =
    appearance === "details" ? "text-lg leading-7" : "text-base leading-6";

  if (!food.variants?.length) {
    return (
      <span
        className={`block max-w-full font-bold text-black [overflow-wrap:anywhere] ${priceClasses}`}
        data-product-price
      >
        {formatMenuPrice(food.price)}
      </span>
    );
  }

  return (
    <div className="flex min-w-0 max-w-full flex-col items-end gap-1 text-right">
      {food.variants.map((variant) => (
        <div
          key={variant.key}
          className={`flex min-w-0 max-w-full flex-wrap items-baseline justify-end gap-x-1.5 gap-y-0.5 ${
            variant.enabled ? "" : "opacity-50 line-through"
          }`}
          aria-disabled={!variant.enabled}
        >
          <span className="min-w-0 text-xs font-semibold text-zinc-600">
            {variant.label} ({variant.description})
          </span>
          <span
            className={`max-w-full font-bold text-black [overflow-wrap:anywhere] ${priceClasses}`}
            data-product-price
          >
            {formatMenuPrice(variant.price)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ProductPrice;
