import {
  memo,
  useCallback,
  type FC,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import type { Food } from "../../types/menu";
import { isAvailabilityActive } from "../../lib/menu/utils";
import ProductImage from "../ui/ProductImage";
import ProductOrderRow from "../ui/ProductOrderRow";
import ProductPrice from "../ui/ProductPrice";

interface FoodCardProps {
  food: Food;
  quantity: number;
  imagePriority?: boolean;
  onAddToOrder: (food: Food) => void;
  onRemoveFromOrder: (food: Food) => void;
  onOpen: (food: Food) => void;
}

const FoodCard: FC<FoodCardProps> = ({
  food,
  quantity,
  imagePriority = false,
  onAddToOrder,
  onRemoveFromOrder,
  onOpen,
}) => {
  const isAvailable =
    food.enabled &&
    isAvailabilityActive(food.availability ?? { type: "always" });
  const hasVariants = Boolean(food.variants?.length);

  const handleAddClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (isAvailable) onAddToOrder(food);
    },
    [food, isAvailable, onAddToOrder],
  );

  const handleRemoveClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onRemoveFromOrder(food);
    },
    [food, onRemoveFromOrder],
  );

  const handleOpen = useCallback(() => onOpen(food), [food, onOpen]);

  const handleCardKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleOpen();
      }
    },
    [handleOpen],
  );

  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition ${
        isAvailable
          ? "cursor-pointer hover:-translate-y-1 hover:shadow-lg"
          : "cursor-pointer opacity-[0.62] grayscale-[0.2] hover:shadow-md"
      }`}
      onClick={handleOpen}
      role="button"
      tabIndex={0}
      onKeyDown={handleCardKeyDown}
      aria-label={`مشاهده جزئیات ${food.name}${
        isAvailable ? "" : "، در حال حاضر قابل سفارش نیست"
      }`}
      data-order-disabled={!isAvailable || undefined}
    >
      <div className="relative flex h-80 items-center justify-center overflow-hidden bg-zinc-100">
        <ProductImage
          src={food.image}
          hasRealImage={food.hasRealImage}
          alt={food.name}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          logoClassName="p-12 sm:p-16"
          loading={imagePriority ? "eager" : "lazy"}
          fetchPriority={imagePriority ? "high" : "auto"}
          decoding="async"
          width={640}
          height={480}
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="max-w-[75%] rounded-2xl bg-[#7a394a] px-3 py-1.5 text-right text-white shadow-sm">
            <span className="block text-[10px] opacity-80">دسته بندی</span>
            <span className="block truncate text-xs font-semibold">
              {food.categoryTitle}
            </span>
          </div>
        </div>
      </div>
      <div className="relative z-10 bg-white p-4 text-right">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-zinc-900">{food.name}</h3>
          {food.variant ? (
            <p className="mt-1 text-sm font-semibold text-[#7a394a]">
              {food.variant.label} - {food.variant.description}
            </p>
          ) : null}
          <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
            {food.shortDescription}
          </p>
        </div>
        <div className="mt-4">
          <ProductOrderRow
            productName={food.name}
            enabled={food.enabled}
            availability={food.availability ?? { type: "always" }}
            isAvailable={isAvailable}
            hasVariants={hasVariants}
            quantity={quantity}
            appearance="card"
            price={<ProductPrice food={food} appearance="card" />}
            onAddToOrder={handleAddClick}
            onRemoveFromOrder={handleRemoveClick}
          />
        </div>
        {quantity > 0 ? (
          <p className="mt-2 text-sm font-medium text-[#496a65]">
            {quantity} عدد در لیست سفارش
          </p>
        ) : null}
      </div>
    </article>
  );
};

export default memo(FoodCard);
