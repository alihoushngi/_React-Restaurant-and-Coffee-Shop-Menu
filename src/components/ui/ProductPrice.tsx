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
        className={`whitespace-nowrap font-bold text-black ${priceClasses}`}
        data-product-price
      >
        {formatMenuPrice(food.price)}
      </span>
    );
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1 text-right">
      {food.variants.map((variant) => (
        <div
          key={variant.key}
          className={`flex items-baseline justify-end gap-x-1.5 whitespace-nowrap ${
            variant.enabled ? "" : "opacity-50 line-through"
          }`}
          aria-disabled={!variant.enabled}
        >
          <span className="text-xs font-semibold text-zinc-600">
            {variant.label} ({variant.description})
          </span>
          <span
            className={`font-bold text-black ${priceClasses}`}
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
