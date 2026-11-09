import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRef, type FC } from "react";
import clsx from "clsx";
import type { Food } from "../../types/menu";
import { formatPrice, isFoodAvailable } from "../../lib/menu/utils";
import {
  SHEET_BODY_WITH_FOOTER_CLASS,
  SHEET_FOOTER_CLASS,
  SHEET_OVERLAY_CLASS,
  SHEET_PANEL_CLASS,
  sheetOverlayMotion,
  sheetPanelMotion,
} from "../../lib/ui/sheetMotion";
import ProductImage from "../ui/ProductImage";
import ProductOrderRow from "../ui/ProductOrderRow";
import ProductPrice from "../ui/ProductPrice";
import SheetHeader from "../ui/SheetHeader";
import { useModalBehavior } from "../../hooks/useModalBehavior";

interface FoodModalProps {
  food: Food | null;
  quantity: number;
  recommendedDrinks: Food[];
  suggestDrink: boolean;
  onAddRecommendedDrink: (drink: Food) => void;
  onClose: () => void;
  onAddToOrder: () => void;
  onRemoveFromOrder: () => void;
}

const FoodModal: FC<FoodModalProps> = ({
  food,
  quantity,
  recommendedDrinks,
  suggestDrink,
  onAddRecommendedDrink,
  onClose,
  onAddToOrder,
  onRemoveFromOrder,
}) => {
  const reduceMotion = useReducedMotion() === true;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const overlayMotion = sheetOverlayMotion(reduceMotion);
  const panelMotion = sheetPanelMotion(reduceMotion);
  useModalBehavior({
    isOpen: Boolean(food),
    onClose,
    dialogRef,
    initialFocusRef: closeButtonRef,
  });

  if (!food) return null;

  const isAvailable = isFoodAvailable(
    food.enabled,
    food.availability ?? { type: "always" },
  );
  const hasVariants = Boolean(food.variants?.length);
  const drinks = suggestDrink
    ? recommendedDrinks.filter(
        (drink) =>
          drink.isRecommendedDrink === true &&
          drink.menuMode === food.menuMode &&
          drink.orderKey !== food.orderKey,
      )
    : [];
  const description =
    food.summary ||
    food.shortDescription ||
    "توضیحات این آیتم در حال حاضر موجود نیست.";

  return (
    <AnimatePresence>
      <motion.div
        {...overlayMotion}
        className={SHEET_OVERLAY_CLASS}
        onClick={onClose}
        role="presentation"
      >
        <motion.div
          ref={dialogRef}
          tabIndex={-1}
          {...panelMotion}
          className={SHEET_PANEL_CLASS}
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="food-detail-sheet-title"
        >
          <SheetHeader
            titleId="food-detail-sheet-title"
            title="جزئیات انتخاب"
            onClose={onClose}
            closeLabel="بستن جزئیات محصول"
            closeRef={closeButtonRef}
          />

          <div className={SHEET_BODY_WITH_FOOTER_CLASS}>
            {!food.hideImage ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-[18px] bg-[#f4f4f5]">
                <ProductImage
                  src={food.image}
                  hasRealImage={food.hasRealImage}
                  alt={food.name}
                  className={clsx(
                    "absolute inset-0 h-full w-full",
                    !isAvailable && "opacity-50 grayscale",
                  )}
                  logoClassName="p-10 sm:p-16"
                  width={640}
                  height={640}
                />
                {!isAvailable ? (
                  <span className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-[10px] border border-[#e5ded1] bg-[#fffef5ed] px-3 py-1.5 text-xs text-[#6a6256]">
                    فعلاً موجود نیست
                  </span>
                ) : null}
              </div>
            ) : null}

            <h3 className="mt-[15px] text-[21px] font-bold text-[#242424]">
              {food.name}
            </h3>

            {food.isForTwo === true ||
            food.isVegetarian === true ||
            food.isDietary === true ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {food.isForTwo === true ? (
                  <span className="inline-flex rounded-[7px] bg-[#f4edef] px-2 py-0.5 text-[11px] text-[#6d1e39]">
                    دونفره
                  </span>
                ) : null}
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
              <p className="mt-1 font-semibold text-[#7a394a]">
                {food.variant.label} - {food.variant.description}
              </p>
            ) : null}

            <p className="mt-2 text-[15px] leading-[2] text-[#666]">
              {description}
            </p>

            {!isAvailable ? (
              <p className="mt-3 rounded-[10px] bg-[#f4f1ec] px-3 py-2.5 text-xs leading-6 text-[#766a56]">
                این آیتم فعلاً موجود نیست. می‌توانید سایر گزینه‌های منو را انتخاب
                کنید.
              </p>
            ) : null}

            {hasVariants && food.variants ? (
              <fieldset className="mt-5 border-0 p-0">
                <legend className="mb-2.5 text-sm font-bold text-[#242424]">
                  {food.variantPresentation?.sheetSubtitle ?? "انتخاب گزینه"}
                </legend>
                <ul className="grid gap-2">
                  {food.variants.map((variant) => (
                    <li
                      key={variant.key}
                      className={clsx(
                        "flex min-h-[46px] items-center gap-2 rounded-xl border px-3 py-2.5 text-[13px]",
                        variant.enabled
                          ? "border-[#e6e1e2] bg-white"
                          : "border-zinc-100 bg-zinc-50 opacity-60",
                      )}
                    >
                      <span className="min-w-0 flex-1 font-medium text-[#242424]">
                        {variant.label}
                        {variant.description ? ` · ${variant.description}` : ""}
                      </span>
                      <span className="shrink-0 text-[11px] text-[#777]">
                        {typeof variant.price === "number"
                          ? `${formatPrice(variant.price)} تومان`
                          : "قیمت نامشخص"}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs leading-6 text-[#637d6c]">
                  برای ثبت تعداد هر گزینه، افزودن را بزنید.
                </p>
              </fieldset>
            ) : null}

            {drinks.length > 0 ? (
              <section
                aria-label="نوشیدنی‌های پیشنهادی کنار غذا"
                className="mt-6 rounded-[18px] border border-[#efdee3] bg-[#f9f4f5] px-3 py-4"
              >
                <h3 className="text-base font-bold text-[#6d1e39]">
                  کنار غذات چی مینوشی؟
                </h3>
                <ul className="mt-3 grid gap-2.5">
                  {drinks.map((drink) => {
                    const canAdd =
                      drink.sourceItemId !== undefined &&
                      isFoodAvailable(
                        drink.enabled,
                        drink.availability ?? { type: "always" },
                      );
                    return (
                      <li
                        key={drink.orderKey}
                        className="flex min-w-0 items-center gap-2.5 rounded-[13px] border border-[#efeaeb] bg-white p-2"
                      >
                        <ProductImage
                          src={drink.image}
                          hasRealImage={drink.hasRealImage}
                          alt=""
                          className={clsx(
                            "h-[68px] w-[68px] shrink-0 rounded-[10px]",
                            !canAdd && "opacity-50 grayscale",
                          )}
                          logoClassName="p-2"
                          width={68}
                          height={68}
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-zinc-800">
                            {drink.name}
                          </p>
                          {drink.shortDescription ? (
                            <p className="mt-0.5 text-[10px] leading-[1.8] text-[#888]">
                              {drink.shortDescription}
                            </p>
                          ) : null}
                          {!canAdd ? (
                            <span className="mt-1 block text-[10px] font-medium text-[#837660]">
                              فعلاً ناموجود
                            </span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!canAdd) return;
                            onAddRecommendedDrink(drink);
                          }}
                          disabled={!canAdd}
                          aria-label={
                            canAdd
                              ? `افزودن ${drink.name}`
                              : `ناموجود ${drink.name}`
                          }
                          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-[#c6d4cb] bg-[#f6faf7] text-xl text-[#637d6c] transition hover:bg-[#e8f1eb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a394a] disabled:cursor-not-allowed disabled:border-[#ddd] disabled:bg-[#e5e5e5] disabled:text-[#7b7b7b]"
                        >
                          +
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}
          </div>

          <footer className={SHEET_FOOTER_CLASS}>
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
          </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FoodModal;
