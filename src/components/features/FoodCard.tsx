import {
  memo,
  useCallback,
  type FC,
  type MouseEvent,
} from "react";
import clsx from "clsx";
import type { Food, FoodImageLayout } from "../../types/menu";
import { isFoodAvailable } from "../../lib/menu/utils";
import ProductImage from "../ui/ProductImage";
import ProductOrderRow from "../ui/ProductOrderRow";
import ProductPrice from "../ui/ProductPrice";

interface FoodCardProps {
  food: Food;
  quantity: number;
  imagePriority?: boolean;
  compact?: boolean;
  imageLayout?: FoodImageLayout;
  onAddToOrder: (food: Food) => void;
  onRemoveFromOrder: (food: Food) => void;
  onOpen: (food: Food) => void;
}

const FoodCard: FC<FoodCardProps> = ({
  food,
  quantity,
  imagePriority = false,
  compact = false,
  imageLayout = "large",
  onAddToOrder,
  onRemoveFromOrder,
  onOpen,
}) => {
  const isAvailable = isFoodAvailable(
    food.enabled,
    food.availability ?? { type: "always" },
  );
  const hasVariants = (food.variants?.length ?? 0) > 0;
  const showImage = imageLayout !== "none";
  const isSmallLeft = imageLayout === "small-left";
  const optionLabels =
    food.variants?.map((variant) => variant.label).filter(Boolean) ?? [];

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

  const orderRow = (
    <ProductOrderRow
      compact={compact || imageLayout === "none"}
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
  );

  // FirstItemImage trailing rows → reference `.title-price-row`
  if (compact) {
    return (
      <article
        className={clsx(
          "flex min-h-[58px] min-w-0 flex-wrap items-center justify-between gap-x-3.5 gap-y-2 rounded-[13px] border border-[#eee] bg-white px-3 py-3.5",
          !isAvailable && "opacity-60",
        )}
        data-order-disabled={!isAvailable || undefined}
      >
        <h3
          className={clsx(
            "min-w-0 flex-1 text-[13px] font-medium [overflow-wrap:anywhere]",
            !isAvailable && "text-[#666]",
          )}
        >
          <button
            type="button"
            onClick={handleOpen}
            className="text-right focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a394a]"
            aria-label={`مشاهده جزئیات ${food.name}`}
          >
            {food.name}
          </button>
        </h3>
        {orderRow}
      </article>
    );
  }

  // NoImage → reference `.text-only-card` (e.g. نوشابه و آب)
  if (imageLayout === "none") {
    return (
      <article
        className={clsx(
          "flex min-w-0 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#e4e4e7] bg-white px-3 py-3.5 shadow-[0_1px_2px_#00000010]",
          !isAvailable && "not-available opacity-60",
        )}
        onClick={handleOpen}
        aria-label={`مشاهده جزئیات ${food.name}${
          isAvailable ? "" : "، در حال حاضر قابل سفارش نیست"
        }`}
        data-order-disabled={!isAvailable || undefined}
      >
        <h3
          className={clsx(
            "min-w-0 flex-1 text-[15px] leading-[1.7] font-bold",
            isAvailable ? "text-[#242424]" : "text-[#666]",
          )}
        >
          {food.name}
        </h3>
        {orderRow}
      </article>
    );
  }

  const imageBlock = showImage ? (
    <div
      className={clsx(
        "relative overflow-hidden bg-[#f4f4f5]",
        isSmallLeft
          ? "aspect-square h-[76px] w-[76px] shrink-0 self-center rounded-[12px]"
          : "aspect-square w-full",
      )}
    >
      <ProductImage
        src={food.image}
        hasRealImage={food.hasRealImage}
        alt={food.name}
        className={clsx(
          "absolute inset-0 h-full w-full",
          !isAvailable && "opacity-50 grayscale",
        )}
        logoClassName={isSmallLeft ? "p-2.5" : "p-12 sm:p-16"}
        loading={imagePriority ? "eager" : "lazy"}
        fetchPriority={imagePriority ? "high" : "auto"}
        decoding="async"
        width={isSmallLeft ? 76 : 640}
        height={isSmallLeft ? 76 : 640}
      />
      {!isAvailable ? (
        <span
          className={clsx(
            "pointer-events-none absolute z-10 border border-[#e5ded1] bg-[#fffef5ed] text-[#6a6256]",
            isSmallLeft
              ? "bottom-1.5 left-1.5 rounded-lg px-1.5 py-0.5 text-[9px] leading-4"
              : "bottom-3 left-3 rounded-[10px] px-3 py-1.5 text-xs",
          )}
        >
          فعلاً موجود نیست
        </span>
      ) : null}
    </div>
  ) : null;

  const textBlock = (
    <div className={clsx("min-w-0", isSmallLeft ? "p-0" : "px-3 pt-3.5")}>
      <div className="flex items-start justify-between gap-1.5">
        <h3
          className={clsx(
            "min-w-0 leading-[1.7] font-bold",
            isSmallLeft ? "text-[15px]" : "text-base",
            isAvailable ? "text-[#242424]" : "text-[#666]",
          )}
        >
          <button
            type="button"
            className="text-right focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a394a]"
            aria-label={`مشاهده جزئیات ${food.name}`}
          >
            {food.name}
          </button>
        </h3>
        {food.isForTwo === true ? (
          <span className="inline-flex shrink-0 rounded-[7px] bg-[#f4edef] px-1.5 py-0.5 text-[10px] font-normal whitespace-nowrap text-[#6d1e39]">
            دونفره
          </span>
        ) : null}
      </div>
      {food.isVegetarian === true || food.isDietary === true ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {food.isVegetarian === true ? (
            <span className="inline-flex rounded-[7px] bg-[#edf5e9] px-2 py-0.5 text-[11px] text-[#49643a]">
              گیاهی
            </span>
          ) : null}
          {food.isDietary === true ? (
            <span className="inline-flex rounded-[7px] bg-[#eaf3f9] px-2 py-0.5 text-[11px] text-[#37657e]">
              رژیمی
            </span>
          ) : null}
        </div>
      ) : null}
      {food.variant ? (
        <p className="mt-1 text-sm font-semibold text-[#7a394a]">
          {food.variant.label} - {food.variant.description}
        </p>
      ) : null}
      <p
        className={clsx(
          "mt-1 line-clamp-2 text-[#71717a]",
          isSmallLeft
            ? "min-h-[22px] text-xs leading-[1.8]"
            : "min-h-[25px] text-[13px] leading-[1.9]",
        )}
      >
        {food.shortDescription}
      </p>
      {optionLabels.length > 0 ? (
        <p className="mt-0.5 text-[10px] text-[#71717a]">
          {optionLabels.join(" / ")}
        </p>
      ) : null}
    </div>
  );

  const orderBlock = (
    <div className={clsx(isSmallLeft ? "col-span-2 pt-3" : "p-3")}>
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
  );

  // SmallImageLeft → reference `.compact-card`; LargeImage → `.card`
  return (
    <article
      className={clsx(
        "group relative overflow-hidden border border-[#e4e4e7] bg-white shadow-[0_1px_2px_#00000010]",
        isSmallLeft
          ? "grid grid-cols-[minmax(0,1fr)_76px] gap-3 rounded-[18px] p-[14px_12px]"
          : "rounded-[24px]",
        "cursor-pointer",
        !isAvailable && "not-available",
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
          {textBlock}
          {orderBlock}
        </>
      )}
    </article>
  );
};

export default memo(FoodCard);
