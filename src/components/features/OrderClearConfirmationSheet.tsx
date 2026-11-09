import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { HiTrash } from "react-icons/hi2";
import { useModalBehavior } from "../../hooks/useModalBehavior";
import {
  SHEET_OVERLAY_NESTED_CLASS,
  SHEET_PANEL_CLASS,
  sheetOverlayMotion,
  sheetPanelMotion,
} from "../../lib/ui/sheetMotion";
import SheetHeader from "../ui/SheetHeader";

interface OrderClearConfirmationSheetProps {
  onCancel: () => void;
  onConfirm: () => void;
}

const OrderClearConfirmationSheet = ({
  onCancel,
  onConfirm,
}: OrderClearConfirmationSheetProps) => {
  const reduceMotion = useReducedMotion() === true;
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const overlayMotion = sheetOverlayMotion(reduceMotion);
  const panelMotion = sheetPanelMotion(reduceMotion);

  useModalBehavior({
    isOpen: true,
    onClose: onCancel,
    dialogRef,
    initialFocusRef: cancelButtonRef,
  });

  return (
    <motion.div
      {...overlayMotion}
      className={SHEET_OVERLAY_NESTED_CLASS}
      onClick={onCancel}
      role="presentation"
    >
      <motion.div
        ref={dialogRef}
        tabIndex={-1}
        {...panelMotion}
        className={`${SHEET_PANEL_CLASS} max-h-none`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="clear-order-title"
        aria-describedby="clear-order-description"
      >
        <SheetHeader
          titleId="clear-order-title"
          title="پاک کردن لیست سفارش"
          onClose={onCancel}
          closeLabel="بستن تأیید حذف سفارش‌ها"
        />

        <div className="px-4 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
              <HiTrash className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-zinc-900">
                آیا از پاک کردن لیست سفارش مطمئنید؟
              </p>
              <p
                id="clear-order-description"
                className="mt-2 text-sm leading-6 text-zinc-600"
              >
                با تأیید این گزینه، تمام آیتم‌های انتخاب‌شده حذف می‌شوند.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={onCancel}
              className="min-h-12 rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="min-h-12 rounded-2xl bg-rose-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-rose-800"
            >
              پاک کردن لیست سفارش
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrderClearConfirmationSheet;
