import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import { useModalBehavior } from "../../hooks/useModalBehavior";
import {
  SHEET_BODY_CLASS,
  SHEET_OVERLAY_CLASS,
  SHEET_PANEL_CLASS,
  sheetOverlayMotion,
  sheetPanelMotion,
} from "../../lib/ui/sheetMotion";
import { HiSquares2X2, HiXMark } from "react-icons/hi2";
import type { MenuCategory } from "../../types/menu";
import SheetHeader from "./SheetHeader";

export type CategoryTab = Pick<MenuCategory, "Id" | "Title" | "ParentId"> & {
  selectionCount?: number;
};

interface CategoryTabsProps {
  categories: CategoryTab[];
  activeCategoryId: string;
  onSelect: (id: string) => void;
}

const CategoryTabs = ({
  categories,
  activeCategoryId,
  onSelect,
}: CategoryTabsProps) => {
  const reduceMotion = useReducedMotion() === true;
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pendingSelection = useRef<string | null>(null);
  const overlayMotion = sheetOverlayMotion(reduceMotion);
  const panelMotion = sheetPanelMotion(reduceMotion);
  useModalBehavior({
    isOpen: isPickerOpen,
    onClose: () => setIsPickerOpen(false),
    dialogRef,
    initialFocusRef: closeButtonRef,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

  const parentCategories = useMemo(() => {
    return categories.filter((category) => category.ParentId === null);
  }, [categories]);

  useEffect(() => {
    const activeBtn = containerRef.current?.querySelector(
      `[data-id="${activeCategoryId}"]`,
    ) as HTMLElement | null;

    if (activeBtn && containerRef.current) {
      const container = containerRef.current;
      const buttonRect = activeBtn.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      container.scrollBy({
        left: buttonRect.left + buttonRect.width / 2 - containerRect.left - containerRect.width / 2,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  }, [activeCategoryId, reduceMotion]);

  useEffect(() => {
    if (isPickerOpen || pendingSelection.current === null) return;
    const id = pendingSelection.current;
    pendingSelection.current = null;
    onSelect(id);
  }, [isPickerOpen, onSelect]);

  const selectCategory = (id: string) => {
    if (isPickerOpen) {
      pendingSelection.current = id;
      setIsPickerOpen(false);
    } else {
      onSelect(id);
    }
  };

  return (
    <div className="relative">
      <div className="menu-navbar flex items-stretch gap-1 rounded-2xl p-2 shadow-sm">
        <div
          ref={containerRef}
          className="flex min-w-0 flex-1 gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="گروه‌های منو"
        >
          {parentCategories.map((category) => {
            const isActive = String(category.Id) === activeCategoryId;

            return (
              <button
                key={category.Id}
                type="button"
                data-id={category.Id}
                onClick={() => selectCategory(String(category.Id))}
                aria-current={isActive ? "true" : undefined}
                className={`
                flex
                min-h-11
                shrink-0
                items-center
                rounded-xl
                px-3
                py-2
                text-sm
                font-semibold
                transition

                ${
                  isActive
                    ? "category-item-selected shadow"
                    : "category-item category-surface shadow-sm"
                }
              `}
              >
                <span>{category.Title}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsPickerOpen((current) => !current)}
          className="category-surface flex min-h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#6d1e39] shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label={isPickerOpen ? "بستن فهرست دسته‌ها" : "نمایش همه دسته‌ها"}
          aria-expanded={isPickerOpen}
          aria-controls="category-picker"
        >
          {isPickerOpen ? <HiXMark className="h-5 w-5" /> : <HiSquares2X2 className="h-5 w-5" />}
        </button>
      </div>

      {createPortal(
        <AnimatePresence>
          {isPickerOpen ? (
            <motion.div
              {...overlayMotion}
              className={SHEET_OVERLAY_CLASS}
              onClick={() => setIsPickerOpen(false)}
              role="presentation"
            >
              <motion.div
                id="category-picker"
                ref={dialogRef}
                tabIndex={-1}
                dir="rtl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="category-picker-title"
                {...panelMotion}
                className={SHEET_PANEL_CLASS}
                onClick={(event) => event.stopPropagation()}
              >
                <SheetHeader
                  titleId="category-picker-title"
                  title="همه دسته‌ها"
                  onClose={() => setIsPickerOpen(false)}
                  closeLabel="بستن فهرست دسته‌ها"
                  closeRef={closeButtonRef}
                />
                <div className={SHEET_BODY_CLASS}>
                  <div className="grid grid-cols-2 gap-[9px]">
                    {parentCategories.map((category) => (
                      <button
                        key={category.Id}
                        type="button"
                        onClick={() => selectCategory(String(category.Id))}
                        aria-current={String(category.Id) === activeCategoryId ? "true" : undefined}
                        className="min-w-0 rounded-[13px] border border-[#e6d7db] bg-[#fffafb] px-3 py-[15px] text-right text-sm leading-[1.7] font-bold text-[#6d1e39] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c58d96]"
                      >
                        {category.Title}
                        <small className="block text-[11px] font-normal text-[#71717a]">
                          {category.Id === -1 ? "برای شروع و کنار غذا" : `${(category.selectionCount ?? 0).toLocaleString("fa-IR")} انتخاب`}
                        </small>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
};

export default CategoryTabs;
