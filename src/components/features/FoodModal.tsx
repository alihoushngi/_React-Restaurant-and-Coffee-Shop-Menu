import { AnimatePresence, motion } from "framer-motion";
import { useRef, type FC } from "react";
import { HiXMark } from "react-icons/hi2";
import type { Food } from "../../types/menu";
import { isAvailabilityActive } from "../../lib/menu/utils";
import ProductImage from "../ui/ProductImage";
import ProductOrderRow from "../ui/ProductOrderRow";
import ProductPrice from "../ui/ProductPrice";
import { useModalBehavior } from "../../hooks/useModalBehavior";

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
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalBehavior({
    isOpen: Boolean(food),
    onClose,
    dialogRef,
  });

  if (!food) return null;

  const isAvailable =
    food.enabled &&
    isAvailabilityActive(food.availability ?? { type: "always" });
  const hasVariants = Boolean(food.variants?.length);
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-60 bg-zinc-950/55"
        onClick={onClose}
        role="presentation"
      >
        <motion.div
          ref={dialogRef}
          tabIndex={-1}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="absolute inset-x-0 bottom-0 mx-auto max-h-[92dvh] w-full max-w-xl overflow-y-auto overscroll-contain rounded-t-[28px] bg-white shadow-2xl outline-none"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={food.name}
        >
          <div className="relative h-64 w-full overflow-hidden rounded-t-[28px] bg-zinc-100 sm:h-80">
            <ProductImage
              src={food.image}
              hasRealImage={food.hasRealImage}
              alt={food.name}
              className="h-full w-full"
              logoClassName="p-10 sm:p-16"
              width={640}
              height={480}
            />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm"
                aria-label="بستن جزئیات محصول"
              >
                <HiXMark className="h-5 w-5 text-zinc-700" />
              </button>
            </div>
          </div>

          <div className="space-y-3 p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:space-y-4 sm:p-5">
            <div className="min-w-0">
              <p className="text-xs text-zinc-500">{food.categoryTitle}</p>
              <h2 className="mt-1 text-xl font-bold text-zinc-900">
                {food.name}
              </h2>
              {food.variant ? (
                <p className="mt-1 font-semibold text-[#7a394a]">
                  {food.variant.label} - {food.variant.description}
                </p>
              ) : null}
            </div>

            <ProductOrderRow
              productName={food.name}
              enabled={food.enabled}
              availability={food.availability ?? { type: "always" }}
              isAvailable={isAvailable}
              hasVariants={hasVariants}
              quantity={quantity}
              appearance="details"
              price={<ProductPrice food={food} appearance="details" />}
              onAddToOrder={onAddToOrder}
              onRemoveFromOrder={onRemoveFromOrder}
            />

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
