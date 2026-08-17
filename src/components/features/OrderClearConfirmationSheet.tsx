import { motion } from "framer-motion";
import { useRef } from "react";
import { HiTrash, HiXMark } from "react-icons/hi2";
import { useModalBehavior } from "../../hooks/useModalBehavior";

interface OrderClearConfirmationSheetProps {
  onCancel: () => void;
  onConfirm: () => void;
}

const OrderClearConfirmationSheet = ({
  onCancel,
  onConfirm,
}: OrderClearConfirmationSheetProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  useModalBehavior({
    isOpen: true,
    onClose: onCancel,
    dialogRef,
    initialFocusRef: cancelButtonRef,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-70 overscroll-contain bg-zinc-950/60"
      onClick={onCancel}
      role="presentation"
    >
      <motion.div
        ref={dialogRef}
        tabIndex={-1}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
        className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-xl overflow-hidden rounded-t-[28px] bg-white p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl outline-none sm:p-5"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="clear-order-title"
        aria-describedby="clear-order-description"
      >
        <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-zinc-200" />
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
            <HiTrash className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="clear-order-title" className="text-lg font-bold text-zinc-900">
              آیا از پاک کردن لیست سفارش مطمئنید؟
            </h2>
            <p
              id="clear-order-description"
              className="mt-2 text-sm leading-6 text-zinc-600"
            >
              با تأیید این گزینه، تمام آیتم‌های انتخاب‌شده حذف می‌شوند.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700"
            aria-label="بستن تأیید حذف سفارش‌ها"
          >
            <HiXMark className="h-5 w-5" />
          </button>
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
      </motion.div>
    </motion.div>
  );
};

export default OrderClearConfirmationSheet;
