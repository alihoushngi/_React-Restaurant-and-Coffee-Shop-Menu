import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HiXMark } from "react-icons/hi2";
import { toPersianDigits } from "../../lib/menu/utils";
import {
  PERSIAN_MONTHS,
  jalaliParts,
  persianYearData,
  resolvePersianDayIso,
  tehranTodayIso,
} from "../../lib/survey/jalali";
import { useModalBehavior } from "../../hooks/useModalBehavior";

interface SurveyDatePickerProps {
  selectedIso: string;
  onClose: () => void;
  onConfirm: (iso: string) => void;
  onClear: () => void;
}

const SurveyDatePicker = ({
  selectedIso,
  onClose,
  onConfirm,
  onClear,
}: SurveyDatePickerProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const daySelectRef = useRef<HTMLSelectElement>(null);
  const todayIso = tehranTodayIso();
  const initialParts = jalaliParts(selectedIso || todayIso);
  const currentYear = jalaliParts(todayIso).year;

  const [year, setYear] = useState(initialParts.year);
  const [month, setMonth] = useState(initialParts.month);
  const [day, setDay] = useState(initialParts.day);
  const [errorVisible, setErrorVisible] = useState(false);

  const yearOptions = useMemo(
    () => Array.from({ length: 6 }, (_, index) => currentYear - index),
    [currentYear],
  );

  const dayOptions = useMemo(
    () => persianYearData(year)[month - 1] ?? [],
    [month, year],
  );

  const clampedDay = Math.min(
    day,
    dayOptions[dayOptions.length - 1]?.day ?? day,
  );

  useModalBehavior({
    isOpen: true,
    onClose,
    dialogRef,
    initialFocusRef: daySelectRef,
  });

  if (typeof document === "undefined") return null;

  const applyMonth = (nextMonth: number) => {
    const options = persianYearData(year)[nextMonth - 1] ?? [];
    const maxDay = options[options.length - 1]?.day ?? 1;
    setMonth(nextMonth);
    setDay((current) => Math.min(current, maxDay));
    setErrorVisible(false);
  };

  const applyYear = (nextYear: number) => {
    const options = persianYearData(nextYear)[month - 1] ?? [];
    const maxDay = options[options.length - 1]?.day ?? 1;
    setYear(nextYear);
    setDay((current) => Math.min(current, maxDay));
    setErrorVisible(false);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#211016]/80 px-3.5 backdrop-blur-[3px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="survey-calendar-title"
        className="w-full max-w-[430px] rounded-[22px] bg-white p-5 text-zinc-900 shadow-[0_12px_60px_rgba(0,0,0,0.25)] outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2.5">
          <h2 id="survey-calendar-title" className="text-lg font-bold">
            تاریخ حضورت رو انتخاب کن
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f6f6f6] text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c58d96]"
            aria-label="بستن انتخاب تاریخ"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 mb-4 text-[13px] text-[#777]">
          تاریخ شمسی؛ از راست، روز، ماه و سال
        </p>

        <div className="flex gap-2.5" dir="rtl">
          <label className="min-w-0 flex-1 text-sm font-bold">
            روز
            <select
              ref={daySelectRef}
              aria-label="روز"
              value={clampedDay}
              onChange={(event) => {
                setDay(Number(event.target.value));
                setErrorVisible(false);
              }}
              className="mt-1.5 block min-h-12 w-full rounded-xl border border-[#d9ccd1] bg-white px-1.5 py-1.5 text-base text-zinc-900"
              dir="rtl"
            >
              {dayOptions.map((option) => (
                <option key={option.iso} value={option.day}>
                  {toPersianDigits(option.day)}
                </option>
              ))}
            </select>
          </label>

          <label className="min-w-0 flex-[1.5] text-sm font-bold">
            ماه
            <select
              aria-label="ماه"
              value={month}
              onChange={(event) => applyMonth(Number(event.target.value))}
              className="mt-1.5 block min-h-12 w-full rounded-xl border border-[#d9ccd1] bg-white px-1.5 py-1.5 text-base text-zinc-900"
              dir="rtl"
            >
              {PERSIAN_MONTHS.map((label, index) => (
                <option key={label} value={index + 1}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="min-w-0 flex-1 text-sm font-bold">
            سال
            <select
              aria-label="سال"
              value={year}
              onChange={(event) => applyYear(Number(event.target.value))}
              className="mt-1.5 block min-h-12 w-full rounded-xl border border-[#d9ccd1] bg-white px-1.5 py-1.5 text-base text-zinc-900"
              dir="rtl"
            >
              {yearOptions.map((optionYear) => (
                <option key={optionYear} value={optionYear}>
                  {toPersianDigits(optionYear)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {errorVisible ? (
          <p role="alert" className="mt-3 text-sm text-[#a12f47]">
            تاریخ معتبر انتخاب کن.
          </p>
        ) : null}

        <button
          type="button"
          className="mt-4 block min-h-[50px] w-full rounded-[14px] bg-[#637d6c] px-3 py-3 text-[15px] font-bold text-white"
          onClick={() => {
            const iso = resolvePersianDayIso(year, month, clampedDay);
            if (!iso) {
              setErrorVisible(true);
              return;
            }
            onConfirm(iso);
          }}
        >
          تأیید تاریخ
        </button>

        <div className="mt-3 flex justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 px-3 py-2 text-sm text-[#6d1e39]"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={onClear}
            className="min-h-11 px-3 py-2 text-sm text-[#6d1e39]"
          >
            بدون تاریخ
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default SurveyDatePicker;
