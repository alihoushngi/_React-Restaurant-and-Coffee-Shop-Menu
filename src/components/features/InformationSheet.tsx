import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import {
  HiArrowTopRightOnSquare,
  HiCamera,
  HiClock,
  HiMapPin,
  HiPhone,
} from "react-icons/hi2";
import { useModalBehavior } from "../../hooks/useModalBehavior";
import { RAYO_LOGO_IMAGE } from "../../lib/menu/utils";
import {
  SHEET_BODY_CLASS,
  SHEET_OVERLAY_CLASS,
  SHEET_PANEL_CLASS,
  sheetOverlayMotion,
  sheetPanelMotion,
} from "../../lib/ui/sheetMotion";
import SheetHeader from "../ui/SheetHeader";

interface InformationSheetProps {
  onClose: () => void;
}

const linkClass =
  "flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-[#7a394a]/35 hover:bg-[#fff8f6]";

const InformationSheet = ({ onClose }: InformationSheetProps) => {
  const reduceMotion = useReducedMotion() === true;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const overlayMotion = sheetOverlayMotion(reduceMotion);
  const panelMotion = sheetPanelMotion(reduceMotion);

  useModalBehavior({
    isOpen: true,
    onClose,
    dialogRef,
    initialFocusRef: closeButtonRef,
  });

  return (
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
        aria-labelledby="information-sheet-title"
        aria-describedby="information-sheet-description"
      >
        <SheetHeader
          titleId="information-sheet-title"
          title="اطلاعات و نشانی"
          onClose={onClose}
          closeLabel="بستن اطلاعات و نشانی"
          closeRef={closeButtonRef}
        />

        <div className={`${SHEET_BODY_CLASS} space-y-4`}>
          <div className="flex items-center gap-3 rounded-2xl border border-[#eadfe3] bg-[#fffafb] p-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#7a394a]/10 bg-white p-2">
              <img
                src={RAYO_LOGO_IMAGE}
                alt="لوگوی کافه رستوران رایو"
                width={56}
                height={56}
                decoding="async"
                className="h-full w-full object-contain"
              />
            </div>
            <strong className="text-sm font-bold text-[#6d1e39]">
              کافه رستوران رایو
            </strong>
          </div>

          <section
            id="information-sheet-description"
            className="rounded-3xl border border-[#6d1e39]/70 bg-[#6d1e39] p-4"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
                <HiClock className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-white">مدت استفاده از میز</h3>
                <p className="mt-1 text-sm leading-7 text-white">
                  فقط پنج‌شنبه و جمعه شب‌ها، مدت استفاده از میز حداکثر ۲ ساعته.
                  در سایر زمان‌ها محدودیتی که نداریم هیچ، خوشحال می‌شیم بیشتر
                  میزبانتون باشیم ☺️
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#7a394a]/10 text-[#7a394a]">
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
                ۰۲۱-۲۶۵۵۰۰۷۲
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
