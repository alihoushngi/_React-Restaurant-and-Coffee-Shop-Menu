import { motion } from "framer-motion";
import { useRef } from "react";
import {
  HiArrowTopRightOnSquare,
  HiCamera,
  HiClock,
  HiMapPin,
  HiPhone,
  HiXMark,
} from "react-icons/hi2";
import { useModalBehavior } from "../../hooks/useModalBehavior";
import { RAYO_LOGO_IMAGE } from "../../lib/menu/utils";

interface InformationSheetProps {
  onClose: () => void;
}

const linkClass =
  "flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-[#7a394a]/35 hover:bg-[#fff8f6]";

const InformationSheet = ({ onClose }: InformationSheetProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useModalBehavior({
    isOpen: true,
    onClose,
    dialogRef,
    initialFocusRef: closeButtonRef,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-60 overscroll-contain bg-zinc-950/55"
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
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[90dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-[30px] bg-[#fbfaf8] shadow-2xl outline-none"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="information-sheet-title"
        aria-describedby="information-sheet-description"
      >
        <div className="shrink-0 px-4 pt-3 sm:px-5">
          <div className="mx-auto h-1.5 w-16 rounded-full bg-zinc-300" />
          <header className="flex items-center gap-3 border-b border-zinc-200/80 py-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#7a394a]/10 bg-white p-2 shadow-sm">
              <img
                src={RAYO_LOGO_IMAGE}
                alt="لوگوی کافه رستوران رایو"
                width={64}
                height={64}
                decoding="async"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#7a394a]">
                کافه رستوران رایو
              </p>
              <h2
                id="information-sheet-title"
                className="mt-1 text-xl font-bold text-zinc-900"
              >
                اطلاعات و نشانی
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-100"
              aria-label="بستن اطلاعات و نشانی"
            >
              <HiXMark className="h-5 w-5" />
            </button>
          </header>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:px-5">
          <section
            id="information-sheet-description"
            className="rounded-3xl border border-amber-200/70 bg-amber-50 p-4"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
                <HiClock className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-zinc-900">مدت استفاده از میز</h3>
                <p className="mt-1 text-sm leading-7 text-zinc-700">
                  فقط پنج‌شنبه و جمعه شب‌ها، مدت استفاده از میز حداکثر ۲ ساعته.
                  در سایر زمان‌ها محدودیتی که نداریم هیچ، خوشحال می‌شیم بیشتر
                  میزبانتون باشیم ☺️
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#7a394a]/10 text-[#7a394a]">
                <HiMapPin className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-zinc-900">نشانی</h3>
                <p className="mt-1 text-sm leading-7 text-zinc-600">
                  لواسان، بعد از میدان گلندوک، کافه رستوران رایو
                </p>
              </div>
            </div>

            <a
              href="tel:02126550072"
              className="mt-4 flex min-h-12 items-center gap-3 rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-700 transition hover:bg-zinc-100"
            >
              <HiPhone className="h-5 w-5 shrink-0 text-[#7a394a]" />
              <span className="font-medium">تلفن</span>
              <span dir="ltr" className="mr-auto font-bold text-zinc-900">
                26550072-021
              </span>
            </a>
          </section>

          <section>
            <h3 className="mb-2 px-1 text-sm font-semibold text-zinc-800">
              مسیرهای دسترسی و شبکه اجتماعی
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <a
                href="https://map.google.com/?q=35.82458085337998,%2051.638400225813804"
                target="_blank"
                rel="noreferrer"
                className={linkClass}
              >
                <span className="flex items-center gap-2">
                  <HiMapPin className="h-5 w-5 text-[#7a394a]" />
                  گوگل مپ
                </span>
                <HiArrowTopRightOnSquare className="h-4 w-4 text-zinc-400" />
              </a>
              <a
                href="https://waze.com/ul/htnkez19u7"
                target="_blank"
                rel="noreferrer"
                className={linkClass}
              >
                <span className="flex items-center gap-2">
                  <HiMapPin className="h-5 w-5 text-[#7a394a]" />
                  Waze
                </span>
                <HiArrowTopRightOnSquare className="h-4 w-4 text-zinc-400" />
              </a>
              <a
                href="https://instagram.com/rayo.restaurant"
                target="_blank"
                rel="noreferrer"
                className={`${linkClass} sm:col-span-2`}
              >
                <span className="flex items-center gap-2">
                  <HiCamera className="h-5 w-5 text-[#7a394a]" />
                  اینستاگرام
                </span>
                <HiArrowTopRightOnSquare className="h-4 w-4 text-zinc-400" />
              </a>
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InformationSheet;
