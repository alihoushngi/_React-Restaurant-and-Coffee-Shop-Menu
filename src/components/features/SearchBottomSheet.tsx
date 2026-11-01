import { AnimatePresence, motion } from "framer-motion";
import { useDeferredValue, useMemo, useRef } from "react";
import { HiXMark } from "react-icons/hi2";
import type { Food } from "../../types/menu";
import { useModalBehavior } from "../../hooks/useModalBehavior";
import {
  filterFoodsForSearchSheet,
  normalizePersianText,
} from "../../lib/menu/utils";
import ProductImage from "../ui/ProductImage";
import SearchInput from "../ui/SearchInput";

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
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

  useModalBehavior({
    isOpen,
    onClose,
    dialogRef,
    initialFocusRef: titleRef,
  });

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-60 overscroll-contain bg-zinc-950/55 backdrop-blur-[2px]"
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
            className="absolute inset-x-0 bottom-0 mx-auto flex h-[88dvh] w-[calc(100%_-_1.5rem)] max-w-xl flex-col overflow-hidden rounded-t-[30px] bg-white shadow-2xl outline-none"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-sheet-title"
          >
            <div className="shrink-0 px-4 pt-3 sm:px-5">
              <div className="mx-auto h-1 w-8 rounded-full bg-zinc-300" />
              <header className="flex items-center gap-3 py-4">
                <h2
                  id="search-sheet-title"
                  ref={titleRef}
                  tabIndex={-1}
                  className="min-w-0 flex-1 text-right text-sm font-bold text-zinc-900 outline-none"
                >
                  جستجو در منو
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700"
                  aria-label="بستن جستجو"
                >
                  <HiXMark className="h-5 w-5" />
                </button>
              </header>
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

            <div className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:px-5">
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
                        {/* RTL: first flex child sits on the right — image must be first. */}
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
                            {food.name}{food.shortDescription ? ` – ${food.shortDescription}` : ""}
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
