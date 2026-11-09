import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useDeferredValue, useMemo, useRef } from "react";
import type { Food } from "../../types/menu";
import { useModalBehavior } from "../../hooks/useModalBehavior";
import {
  filterFoodsForSearchSheet,
  normalizePersianText,
} from "../../lib/menu/utils";
import {
  SHEET_BODY_CLASS,
  SHEET_OVERLAY_CLASS,
  SHEET_PANEL_CLASS,
  sheetOverlayMotion,
  sheetPanelMotion,
} from "../../lib/ui/sheetMotion";
import ProductImage from "../ui/ProductImage";
import SearchInput from "../ui/SearchInput";
import SheetHeader from "../ui/SheetHeader";

interface SearchBottomSheetProps {
  isOpen: boolean;
  foods: Food[];
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  onSelect: (food: Food) => void;
}

const SearchBottomSheet = ({
  isOpen,
  foods,
  query,
  onQueryChange,
  onClose,
  onSelect,
}: SearchBottomSheetProps) => {
  const reduceMotion = useReducedMotion() === true;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = useMemo(
    () => normalizePersianText(deferredQuery),
    [deferredQuery],
  );
  const results = useMemo(
    () => filterFoodsForSearchSheet(foods, normalizedQuery),
    [foods, normalizedQuery],
  );
  const isSuggestionMode = normalizedQuery.length === 0;
  const overlayMotion = sheetOverlayMotion(reduceMotion);
  const panelMotion = sheetPanelMotion(reduceMotion);

  useModalBehavior({
    isOpen,
    onClose,
    dialogRef,
    initialFocusRef: closeButtonRef,
  });

  return (
    <AnimatePresence>
      {isOpen ? (
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
            aria-labelledby="search-sheet-title"
          >
            <SheetHeader
              titleId="search-sheet-title"
              title="جستجو در منو"
              onClose={onClose}
              closeLabel="بستن جستجو"
              closeRef={closeButtonRef}
            />

            <div className={SHEET_BODY_CLASS}>
              <div className="sticky top-[-1rem] z-[2] bg-white pb-3">
                <SearchInput
                  value={query}
                  onChange={onQueryChange}
                  onClear={() => onQueryChange("")}
                  showClear={query.length > 0}
                  autoFocus={false}
                  showIcon={false}
                  placeholder="نام غذا، طعم یا ترکیب..."
                />
              </div>

              {results.length === 0 ? (
                <p className="py-10 text-center text-sm text-zinc-500">
                  {isSuggestionMode
                    ? "پیشنهادی برای نمایش نیست."
                    : "موردی پیدا نشد."}
                </p>
              ) : (
                <ul className="flex flex-col gap-2.5" aria-label="نتایج جستجو">
                  {results.map((food) => (
                    <li key={food.orderKey}>
                      <button
                        type="button"
                        onClick={() => onSelect(food)}
                        className="flex w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-2.5 text-right transition hover:border-[#7a394a]/35 hover:bg-[#fff8f6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a394a]"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                          <ProductImage
                            src={food.image}
                            hasRealImage={food.hasRealImage}
                            alt=""
                            style={{ objectFit: "contain" }}
                            className="absolute inset-0 h-full w-full"
                            logoClassName="p-2"
                            width={56}
                            height={56}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-[13px] font-semibold text-zinc-800">
                            {food.name}
                            {food.shortDescription
                              ? ` – ${food.shortDescription}`
                              : ""}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default SearchBottomSheet;
