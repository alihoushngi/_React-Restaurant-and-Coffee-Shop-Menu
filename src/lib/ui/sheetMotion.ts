import type { Transition } from "framer-motion";

/** Shared bottom-sheet chrome aligned to rayo_menu_mobile_v7 `.sheet` / `::backdrop`. */

export const SHEET_OVERLAY_CLASS =
  "fixed inset-0 z-60 overscroll-contain bg-[#211016]/70 backdrop-blur-[3px]";

export const SHEET_OVERLAY_NESTED_CLASS =
  "fixed inset-0 z-70 overscroll-contain bg-[#211016]/70 backdrop-blur-[3px]";

export const SHEET_PANEL_CLASS =
  "absolute inset-x-0 bottom-0 mx-auto flex max-h-[94dvh] w-full max-w-[540px] flex-col overflow-hidden rounded-t-[26px] bg-white text-[#242424] shadow-[0_-10px_60px_#0002] outline-none";

export const SHEET_HEAD_CLASS =
  "relative shrink-0 border-b border-[#f0f0f0] bg-white px-4 pt-3 pb-3";

export const SHEET_HANDLE_CLASS =
  "absolute top-[5px] left-[calc(50%-18px)] h-[3px] w-9 rounded-full bg-[#dedede]";

export const SHEET_TITLE_CLASS = "text-[15px] font-bold text-[#242424]";

/** 44px touch target (a11y); reference close is 40px. */
export const SHEET_CLOSE_CLASS =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f6f6f6] text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c58d96]";

export const SHEET_BODY_CLASS =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]";

export const SHEET_BODY_WITH_FOOTER_CLASS =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain p-4";

export const SHEET_FOOTER_CLASS =
  "shrink-0 border-t border-[#e4e4e7] bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]";

const reducedTransition: Transition = { duration: 0 };
const overlayTransition: Transition = { duration: 0.2 };
const panelTransition: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 24,
};

export function sheetOverlayMotion(reduceMotion: boolean) {
  return {
    initial: { opacity: reduceMotion ? 1 : 0 },
    animate: { opacity: 1 },
    exit: { opacity: reduceMotion ? 1 : 0 },
    transition: reduceMotion ? reducedTransition : overlayTransition,
  } as const;
}

export function sheetPanelMotion(reduceMotion: boolean) {
  return {
    initial: { y: reduceMotion ? 0 : "100%" },
    animate: { y: 0 },
    exit: { y: reduceMotion ? 0 : "100%" },
    transition: reduceMotion ? reducedTransition : panelTransition,
  } as const;
}
