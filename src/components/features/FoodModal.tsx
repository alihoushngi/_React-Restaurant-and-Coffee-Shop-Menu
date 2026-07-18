import { AnimatePresence, motion } from "framer-motion";
import type { FC } from "react";
import { HiXMark } from "react-icons/hi2";
import type { Food } from "../../types/menu";
import { formatPrice } from "../../lib/menu/utils";
import AvailabilityIndicator from "../ui/AvailabilityIndicator";

interface FoodModalProps {
  food: Food | null;
  quantity: number;
  onClose: () => void;
  onAddToOrder: () => void;
  onRemoveFromOrder: () => void;
}

const FoodModal: FC<FoodModalProps> = ({
  food,
  quantity,
  onClose,
  onAddToOrder,
  onRemoveFromOrder,
}) => {
  if (!food) return null;

  const isAvailable = true;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-zinc-950/55"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-xl rounded-t-[28px] bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative h-96 w-full overflow-hidden rounded-t-[28px] bg-zinc-100">
            <img
              src={food.image}
              alt={food.name}
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm"
              >
                <HiXMark className="h-5 w-5 text-zinc-700" />
              </button>
            </div>
            <div className="absolute bottom-4 left-4">
              <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/90 p-1 shadow-sm">
                {quantity > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={onRemoveFromOrder}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-lg font-semibold text-zinc-700"
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold text-zinc-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={onAddToOrder}
                      disabled={!isAvailable}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7a394a] text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      +
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={onAddToOrder}
                    disabled={!isAvailable}
                    className="rounded-full bg-green-700 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    افزودن
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 pb-6 sm:space-y-4 sm:p-5 sm:pb-7">
            <div className="flex items-start justify-between gap-3">
              <div className="w-full">
                <h2 className="text-xl font-bold text-zinc-900">{food.name}</h2>
                {/* <p className="mt-1 text-sm text-zinc-500">
                  {food.shortDescription}
                </p> */}
              </div>
              <div className="rounded-full bg-[#000000] px-3 py-1 text-sm font-semibold text-white w-fit text-nowrap text-center">
                {formatPrice(food.price)} تومان
              </div>
            </div>

            <div>
              <AvailabilityIndicator
                availability={food.availability ?? { type: "always" }}
              />
            </div>

            <div className="rounded-2xl bg-zinc-50 p-4">
              <h3 className="font-semibold text-zinc-900">توضیحات</h3>
              <p className="mt-2 text-sm leading-7 text-zinc-600">
                {food.summary || "توضیحات این آیتم در حال حاضر موجود نیست."}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FoodModal;
