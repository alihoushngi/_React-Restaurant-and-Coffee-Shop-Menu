import {
  memo,
  useCallback,
  type FC,
  type MouseEvent,
} from "react";
import clsx from "clsx";
import type { Food, FoodImageLayout } from "../../types/menu";
import { isAvailabilityActive } from "../../lib/menu/utils";
import ProductImage from "../ui/ProductImage";
import ProductOrderRow from "../ui/ProductOrderRow";
import ProductPrice from "../ui/ProductPrice";

interface FoodCardProps {
  food: Food;
  quantity: number;
  imagePriority?: boolean;
  imageLayout?: FoodImageLayout;
  onAddToOrder: (food: Food) => void;
  onRemoveFromOrder: (food: Food) => void;
  onOpen: (food: Food) => void;
}

const FoodCard: FC<FoodCardProps> = ({
  food,
  quantity,
  imagePriority = false,
  imageLayout = "large",
  onAddToOrder,
  onRemoveFromOrder,
  onOpen,
}) => {
  const isAvailable =
    food.enabled &&
    isAvailabilityActive(food.availability ?? { type: "always" });
  const hasVariants = (food.variants?.length ?? 0) > 0;
  const showImage = imageLayout !== "none";
  const isSmallLeft = imageLayout === "small-left";

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

  const handleOpen = useCallback(() => {
    onOpen(food);
  }, [food, onOpen]);

  const imageBlock = showImage ? (
    <div
      className={clsx(
        "relative overflow-hidden bg-zinc-100",
        isSmallLeft
          ? "aspect-square w-20 shrink-0 self-center rounded-2xl"
          : "aspect-square w-full",
      )}
    >
      <ProductImage
        src={food.image}
        hasRealImage={food.hasRealImage}
        alt={food.name}
        className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105"
        logoClassName={isSmallLeft ? "p-4" : "p-12 sm:p-16"}
        loading={imagePriority ? "eager" : "lazy"}
        fetchPriority={imagePriority ? "high" : "auto"}
        decoding="async"
        width={isSmallLeft ? 112 : 640}
        height={isSmallLeft ? 112 : 640}
      />
    </div>
  ) : null;

  const textBlock = (
    <div className="min-w-0">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-base font-bold text-zinc-900">
          <button type="button" className="text-right focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a394a]" aria-label={`مشاهده جزئیات ${food.name}`}>
            {food.name}
          </button>
        </h3>
        {food.isForTwo === true ? (
          <span className="shrink-0 rounded-md bg-[#f5edef] px-1.5 py-0.5 text-[10px] font-medium text-[#8b6170]">
            دونفره
          </span>
        ) : null}
      </div>
      {food.isVegetarian === true || food.isDietary === true ? (
        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-medium">
          {food.isVegetarian === true ? (
            <span className="rounded-md bg-[#eff5e9] px-2 py-0.5 text-[#6e865a]">گیاهی</span>
          ) : null}
          {food.isDietary === true ? (
            <span className="rounded-md bg-[#eaf3f7] px-2 py-0.5 text-[#62879a]">رژیمی</span>
          ) : null}
        </div>
      ) : null}
      {food.variant ? (
        <p className="mt-1 text-sm font-semibold text-[#7a394a]">
          {food.variant.label} - {food.variant.description}
        </p>
      ) : null}
      <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{food.shortDescription}</p>
    </div>
  );

  const orderBlock = (
    <div className={isSmallLeft ? "col-span-2" : "mt-4"}>
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
      {quantity > 0 ? (
        <p className="mt-2 text-sm font-medium text-[#496a65]">
          {quantity} عدد در لیست سفارش
        </p>
      ) : null}
    </div>
  );

  return (
    <article
      className={clsx(
        "group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition",
        isAvailable
          ? "cursor-pointer hover:-translate-y-1 hover:shadow-lg"
          : "cursor-pointer opacity-[0.62] grayscale-[0.2] hover:shadow-md",
        isSmallLeft && "grid grid-cols-[minmax(0,1fr)_5rem] gap-3 p-3",
      )}
      onClick={handleOpen}
      aria-label={`مشاهده جزئیات ${food.name}${
        isAvailable ? "" : "، در حال حاضر قابل سفارش نیست"
      }`}
      data-order-disabled={!isAvailable || undefined}
    >
      {isSmallLeft ? (
        <>
          {textBlock}
          {imageBlock}
          {orderBlock}
        </>
      ) : (
        <>
          {imageBlock}
          <div className="bg-white p-4 text-right">
            {textBlock}
            {orderBlock}
          </div>
        </>
      )}
    </article>
  );
};

export default memo(FoodCard);
