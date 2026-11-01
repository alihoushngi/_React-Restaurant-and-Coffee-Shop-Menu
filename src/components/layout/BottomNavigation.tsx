import { AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { memo, useMemo, useState } from "react";
import {
  HiBars3,
  HiClipboardDocumentList,
  HiChatBubbleBottomCenterText,
  HiMagnifyingGlass,
} from "react-icons/hi2";
import clsx from "clsx";
import type { MenuMode } from "../../types/menu";
import { getMenuPath, resolveMenuMode } from "../../lib/menu/utils";
import InformationSheet from "../features/InformationSheet";
import {
  getFavoriteEntryMenuMode,
  useFavorites,
} from "../../hooks/useFavorites";

export interface MenuSearchControls {
  isOpen: boolean;
  isActive: boolean;
  value: string;
  hint?: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onToggle: () => void;
}

interface BottomNavigationProps {
  menuMode?: MenuMode;
  searchControls?: MenuSearchControls;
}

const navItemClass = (active: boolean) =>
  clsx(
    "relative flex h-full min-h-11 w-full min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-xs font-bold leading-4 transition",
    active ? "text-[#7a394a]" : "text-zinc-500",
  );

const BottomNavigation = ({
  menuMode,
  searchControls,
}: BottomNavigationProps) => {
  const location = useLocation();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const { favorites } = useFavorites();
  const queryMenuMode = new URLSearchParams(location.search).get("menu");
  const resolvedMenuMode = menuMode ?? resolveMenuMode(queryMenuMode);
  const orderHref = `/favorites?menu=${resolvedMenuMode}`;
  const searchHref = `${getMenuPath(resolvedMenuMode)}?search=1`;
  const isSearchOpen = searchControls?.isOpen === true;
  const isOrderActive = location.pathname === "/favorites";
  const orderCount = useMemo(
    () =>
      favorites.reduce(
        (total, entry) =>
          getFavoriteEntryMenuMode(entry) === resolvedMenuMode
            ? total + entry.quantity
            : total,
        0,
      ),
    [favorites, resolvedMenuMode],
  );

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex min-h-14 max-w-5xl items-stretch justify-between gap-0.5">
          <div className="min-w-0 flex-1">
            <Link
              to={orderHref}
              aria-label={
                orderCount > 0
                  ? `لیست انتخاب‌ها، ${orderCount} آیتم`
                  : "لیست انتخاب‌ها"
              }
              className={navItemClass(isOrderActive || (!isSearchOpen && !isInfoOpen))}
            >
              <HiClipboardDocumentList
                className={clsx("h-6 w-6", isOrderActive && "stroke-[1.5]")}
              />
              <span className="whitespace-nowrap">لیست انتخاب‌ها</span>
            </Link>
          </div>

          <div className="min-w-0 flex-1">
            {searchControls ? (
              <button
                type="button"
                onClick={searchControls.onToggle}
                className={navItemClass(isSearchOpen)}
                aria-expanded={isSearchOpen}
                aria-label="جستجو"
              >
                <HiMagnifyingGlass className="h-6 w-6" />
                <span>جستجو</span>
              </button>
            ) : (
              <Link to={searchHref} className={navItemClass(false)}>
                <HiMagnifyingGlass className="h-6 w-6" />
                <span>جستجو</span>
              </Link>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="نظرسنجی فعلاً در دسترس نیست"
              aria-label="نظرسنجی، فعلاً در دسترس نیست"
              className={clsx(navItemClass(false), "cursor-not-allowed")}
            >
              <HiChatBubbleBottomCenterText className="h-6 w-6" />
              <span>نظرسنجی</span>
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setIsInfoOpen(true)}
              className={navItemClass(isInfoOpen)}
              aria-label="اطلاعات"
            >
              <HiBars3 className="h-6 w-6" />
              <span className="whitespace-nowrap">اطلاعات</span>
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isInfoOpen ? (
          <InformationSheet onClose={() => setIsInfoOpen(false)} />
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default memo(BottomNavigation);
