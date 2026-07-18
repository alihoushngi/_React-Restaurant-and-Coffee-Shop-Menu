import { motion } from "framer-motion";

import {
  useCallback,
  type FC,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import type { Food } from "../../types/menu";
import { formatPrice } from "../../lib/menu/utils";
import AvailabilityIndicator from "../ui/AvailabilityIndicator";

interface FoodCardProps {
  food: Food;
  quantity: number;
  onAddToOrder: () => void;
  onRemoveFromOrder: () => void;
  onOpen: () => void;
}

const FoodCard: FC<FoodCardProps> = ({
  food,
  quantity,
  onAddToOrder,
  onRemoveFromOrder,
  onOpen,
}) => {
  const isAvailable = true;
  const categoryTitle = "دسته‌بندی";

  const handleAddClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onAddToOrder();
    },
    [onAddToOrder],
  );

  const handleRemoveClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onRemoveFromOrder();
    },
    [onRemoveFromOrder],
  );

  const handleCardKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onOpen();
      }
    },
    [onOpen],
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={handleCardKeyDown}
    >
      <div className="relative flex h-80 items-center justify-center overflow-hidden bg-zinc-100">
        <img
          src={food.image}
          alt={food.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="rounded-full bg-[#7a394a] px-2.5 py-1 text-xs font-medium text-white shadow-sm">
            {categoryTitle}
          </div>
        </div>
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/90 p-1 shadow-sm">
            {quantity > 0 ? (
              <>
                <button
                  type="button"
                  onClick={handleRemoveClick}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7a394a] text-lg font-semibold text-white"
                >
                  −
                </button>
                <span className="min-w-8 text-center text-sm font-semibold text-zinc-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleAddClick}
                  disabled={!food.favoriteEnabled || !isAvailable}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-green-700 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  +
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleAddClick}
                disabled={!food.favoriteEnabled || !isAvailable}
                className="rounded-full bg-green-700 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                افزودن
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="p-4 text-right z-40 relative bg-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-zinc-900">{food.name}</h3>
            <p className="mt-1 text-sm text-zinc-500 line-clamp-2">
              {food.shortDescription}
            </p>
          </div>
          <span className="text-sm font-semibold text-amber-600 whitespace-nowrap">
            {formatPrice(food.price)} تومان
          </span>
        </div>
        <div className="mt-4">
          <AvailabilityIndicator
            availability={food.availability ?? { type: "always" }}
          />
        </div>
        {quantity > 0 && (
          <p className="mt-2 text-sm font-medium text-[#496a65]">
            {quantity} عدد در لیست سفارش
          </p>
        )}
      </div>
    </motion.article>
  );
};

FoodCard.displayName = "FoodCard";

export default FoodCard;
