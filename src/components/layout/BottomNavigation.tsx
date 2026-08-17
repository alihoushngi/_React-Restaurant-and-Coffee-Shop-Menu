import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { memo, useMemo, useState } from "react";
import {
  HiBars3,
  HiClipboardDocumentList,
  HiMagnifyingGlass,
} from "react-icons/hi2";
import type { MenuMode } from "../../types/menu";
import { getMenuPath, resolveMenuMode } from "../../lib/menu/utils";
import SearchInput from "../ui/SearchInput";
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

const navItemClass = (active: boolean, compact = false) =>
  `relative flex h-full w-full min-w-0 flex-col items-center justify-center gap-1 rounded-2xl py-2 font-semibold leading-4 transition ${
    compact ? "px-0 text-[10px]" : "px-1 text-[11px]"
  } ${active ? "bg-[#7a394a] text-white" : "text-zinc-500"}`;

const searchTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
};

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
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/95 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur">
        <motion.div
          layout
          transition={searchTransition}
          className="mx-auto flex min-h-14 max-w-5xl items-stretch justify-between gap-1"
        >
          <motion.div
            layout
            transition={searchTransition}
            className={
              isSearchOpen
                ? "w-[3.6rem] shrink-0 min-[360px]:w-[4.25rem]"
                : "min-w-0 flex-1"
            }
          >
            <Link
              to={orderHref}
              aria-label={
                orderCount > 0 ? `لیست سفارش، ${orderCount} آیتم` : "لیست سفارش"
              }
              className={navItemClass(
                location.pathname === "/favorites",
                isSearchOpen,
              )}
            >
              <HiClipboardDocumentList className="h-5 w-5" />
              {/* {orderCount > 0 ? (
                <span
                  className="absolute top-1 right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] leading-none font-bold text-zinc-950 shadow-sm"
                  aria-hidden="true"
                >
                  {orderCount}
                </span>
              ) : null} */}
              <span className="whitespace-nowrap">لیست سفارش</span>
            </Link>
          </motion.div>

          {searchControls ? (
            <motion.div
              layout
              transition={searchTransition}
              className="min-w-0 flex-1"
            >
              <AnimatePresence initial={false} mode="popLayout">
                {isSearchOpen ? (
                  <motion.div
                    key="search-input"
                    initial={{ opacity: 0, scaleX: 0.45 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0.45 }}
                    transition={searchTransition}
                    className="flex h-full origin-center items-center"
                  >
                    <SearchInput
                      value={searchControls.value}
                      onChange={searchControls.onChange}
                      onClear={searchControls.onClear}
                      showClear
                      autoFocus
                      compact
                    />
                  </motion.div>
                ) : (
                  <motion.button
                    layout
                    key="search-action"
                    type="button"
                    onClick={searchControls.onToggle}
                    className={navItemClass(false)}
                    aria-expanded="false"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={searchTransition}
                  >
                    <HiMagnifyingGlass className="h-5 w-5" />
                    <span>جستجو</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="min-w-0 flex-1">
              <Link to={searchHref} className={navItemClass(false)}>
                <HiMagnifyingGlass className="h-5 w-5" />
                <span>جستجو</span>
              </Link>
            </div>
          )}

          <motion.div
            layout
            transition={searchTransition}
            className={
              isSearchOpen
                ? "w-[3.6rem] shrink-0 min-[360px]:w-[4.25rem]"
                : "min-w-0 flex-1"
            }
          >
            <button
              type="button"
              onClick={() => setIsInfoOpen(true)}
              className={navItemClass(false, isSearchOpen)}
            >
              <HiBars3 className="h-5 w-5" />
              <span className="whitespace-nowrap">اطلاعات</span>
            </button>
          </motion.div>
        </motion.div>
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
