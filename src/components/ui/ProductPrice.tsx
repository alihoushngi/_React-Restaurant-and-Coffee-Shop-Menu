import type { Food } from "../../types/menu";
import { formatPrice } from "../../lib/menu/utils";

interface ProductPriceProps {
  food: Food;
  appearance: "card" | "details";
}

const ProductPrice = ({ food, appearance }: ProductPriceProps) => {
  const hasVariants = Boolean(food.variants?.length);
  const price =
    typeof food.price === "number" && Number.isFinite(food.price)
      ? food.price
      : null;
  const sizeClass =
    appearance === "details" ? "text-base leading-6" : "text-base leading-6";

  if (price === null) {
    return (
      <span
        className={`whitespace-nowrap font-bold text-[#151515] ${sizeClass}`}
        data-product-price
      >
        قیمت نامشخص
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-baseline whitespace-nowrap font-bold text-[#151515] ${sizeClass}`}
      data-product-price
    >
      {hasVariants ? (
        <span className="ml-1 text-[10px] font-normal text-[#71717a]">از</span>
      ) : null}
      {formatPrice(price)}
      <small className="mr-1 text-xs font-normal">تومان</small>
    </span>
  );
};

export default ProductPrice;
