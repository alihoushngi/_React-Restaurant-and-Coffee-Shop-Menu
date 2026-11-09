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
import { getMenuPath, resolveMenuMode, toPersianDigits } from "../../lib/menu/utils";
import InformationSheet from "../features/InformationSheet";
import OrderSelectionSheet from "../features/OrderSelectionSheet";
import SurveyBottomSheet from "../features/SurveyBottomSheet";
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
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [surveySessionKey, setSurveySessionKey] = useState(0);
  const { favorites } = useFavorites();
  const queryMenuMode = new URLSearchParams(location.search).get("menu");
  const resolvedMenuMode = menuMode ?? resolveMenuMode(queryMenuMode);
  const searchHref = `${getMenuPath(resolvedMenuMode)}?search=1`;
  const isSearchOpen = searchControls?.isOpen === true;
  const isFavoritesRoute = location.pathname === "/favorites";
  const isOrderActive = isOrderOpen || isFavoritesRoute;
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
      <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[540px] -translate-x-1/2 border-t border-[#eadfe3] bg-white/95 px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_28px_rgba(74,33,48,0.08)] backdrop-blur-xl">
        <div className="flex min-h-14 items-stretch justify-between gap-0.5">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => {
                setIsInfoOpen(false);
                setIsSurveyOpen(false);
                setIsOrderOpen(true);
              }}
              aria-expanded={isOrderOpen}
              aria-label={
                orderCount > 0
                  ? `لیست انتخاب‌ها، ${orderCount} آیتم`
                  : "لیست انتخاب‌ها"
              }
              className={navItemClass(
                isOrderActive ||
                  (!isSearchOpen && !isInfoOpen && !isSurveyOpen),
              )}
            >
              <span className="relative">
                <HiClipboardDocumentList
                  className={clsx("h-6 w-6", isOrderActive && "stroke-[1.5]")}
                />
                {orderCount > 0 ? (
                  <b className="absolute -top-1 -left-3 min-w-[18px] rounded-full bg-[#6d1e39] px-1.5 py-px text-center text-[10px] font-bold text-white">
                    {toPersianDigits(orderCount)}
                  </b>
                ) : null}
              </span>
              <span className="whitespace-nowrap">لیست انتخاب‌ها</span>
            </button>
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
              onClick={() => {
                setIsOrderOpen(false);
                setIsInfoOpen(false);
                setSurveySessionKey((key) => key + 1);
                setIsSurveyOpen(true);
              }}
              aria-expanded={isSurveyOpen}
              aria-label="نظرسنجی"
              className={navItemClass(isSurveyOpen)}
            >
              <HiChatBubbleBottomCenterText className="h-6 w-6" />
              <span>نظرسنجی</span>
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => {
                setIsOrderOpen(false);
                setIsSurveyOpen(false);
                setIsInfoOpen(true);
              }}
              className={navItemClass(isInfoOpen)}
              aria-label="اطلاعات"
            >
              <HiBars3 className="h-6 w-6" />
              <span className="whitespace-nowrap">اطلاعات</span>
            </button>
          </div>
        </div>
      </nav>

      <OrderSelectionSheet
        isOpen={isOrderOpen}
        menuMode={resolvedMenuMode}
        onClose={() => setIsOrderOpen(false)}
      />

      <SurveyBottomSheet
        isOpen={isSurveyOpen}
        sessionKey={surveySessionKey}
        onClose={() => setIsSurveyOpen(false)}
      />

      <AnimatePresence>
        {isInfoOpen ? (
          <InformationSheet onClose={() => setIsInfoOpen(false)} />
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default memo(BottomNavigation);
