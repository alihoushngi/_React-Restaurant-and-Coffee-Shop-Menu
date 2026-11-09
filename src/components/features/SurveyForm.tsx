import clsx from "clsx";
import { useRef, useState, type FormEvent } from "react";
import { toPersianDigits } from "../../lib/menu/utils";
import {
  RATING_GUIDE_LABELS,
  SURVEY_MESSAGES,
  SURVEY_QUESTIONS,
  type SurveyQuestionId,
} from "../../lib/survey/constants";
import { jalaliLabel, visitWeekdayLabel } from "../../lib/survey/jalali";
import { saveSurveyPreview } from "../../lib/survey/storage";
import {
  createEmptySurveyValues,
  type SurveyFormValues,
  type SurveyRatingValue,
  validateSurvey,
} from "../../lib/survey/validateSurvey";
import SurveyDatePicker from "./SurveyDatePicker";

interface SurveyFormProps {
  onClose: () => void;
  onNestedOpenChange?: (isOpen: boolean) => void;
}

const inputClass =
  "w-full min-h-[46px] rounded-xl border border-[#ded4d8] bg-white px-3 py-3 text-base text-zinc-900 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c58d96]";

const SurveyForm = ({ onClose, onNestedOpenChange }: SurveyFormProps) => {
  const [values, setValues] = useState<SurveyFormValues>(createEmptySurveyValues);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  const setDatePickerOpen = (open: boolean) => {
    setIsDatePickerOpen(open);
    onNestedOpenChange?.(open);
  };

  const setRating = (id: SurveyQuestionId, value: SurveyRatingValue) => {
    setValues((current) => ({
      ...current,
      ratings: { ...current.ratings, [id]: value },
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaved || isSubmitting) return;

    const result = validateSurvey(values);
    if ("error" in result && result.error) {
      setError(result.error);
      window.requestAnimationFrame(() => {
        errorRef.current?.scrollIntoView({ block: "nearest" });
      });
      return;
    }

    if (!("record" in result) || !result.record) return;

    setError("");
    setIsSubmitting(true);
    const saveResult = saveSurveyPreview(result.record);
    if (!saveResult.ok) {
      setIsSubmitting(false);
      setError(saveResult.error);
      return;
    }

    setIsSaved(true);
    setIsSubmitting(false);
  };

  if (isSaved) {
    return (
      <div className="px-1 py-6 text-center" role="status">
        <span className="text-4xl" aria-hidden="true">
          💚
        </span>
        <h3 className="mt-3 text-[22px] font-bold text-zinc-900">
          {SURVEY_MESSAGES.successTitle}
        </h3>
        <p className="mt-3 mb-4 text-sm leading-8 text-zinc-700">
          {SURVEY_MESSAGES.successBody}
        </p>
        <p className="mb-4 rounded-xl border border-[#eee0c9] bg-[#faf3e7] px-3 py-2.5 text-[13px] leading-[1.9] text-[#7a6340]">
          {SURVEY_MESSAGES.demoNotice}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="block min-h-[50px] w-full rounded-[14px] bg-[#637d6c] px-3 py-3 text-[15px] font-bold text-white"
        >
          بازگشت به منو
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="pb-3.5">
        <span className="text-[13px] font-bold text-[#637d6c]">
          یک دقیقه از تو، یک قدم بهتر از ما
        </span>
        <h3 className="mt-2 text-[22px] font-bold text-zinc-900">
          امروز چطور گذشت؟
        </h3>
        <p className="mt-2 text-sm leading-8 text-[#666]">
          از چیزی که دوست داشتی و چیزی که می‌تونیم بهترش کنیم بگو. نظرت به ما
          کمک می‌کنه تجربه بهتری برای تو و مهمان‌های بعدی بسازیم. نظرها رو
          می‌خونیم و مواردی که نیاز به رسیدگی دارن پیگیری می‌کنیم.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div
          className="my-4 rounded-[15px] border border-[#cdded0] bg-[#f0f6f1] p-3.5 text-[13px] leading-[1.9] text-[#405a47]"
          role="note"
        >
          <strong className="mb-3 block text-[15px]">راهنمای امتیازدهی</strong>
          <div className="flex flex-wrap gap-x-3 gap-y-2">
            {RATING_GUIDE_LABELS.map((label, index) => (
              <span key={label} className="flex items-center gap-1.5 text-[13px]">
                <b className="grid min-h-[29px] min-w-[27px] place-items-center rounded-lg border border-[#d4e2d7] bg-white text-[15px]">
                  {toPersianDigits(index + 1)}
                </b>
                {label}
              </span>
            ))}
          </div>
          <p className="mt-3">
            فقط به بخش‌هایی که تجربه کردی امتیاز بده؛ پاسخ به یک بخش کافیه.
          </p>
        </div>

        {SURVEY_QUESTIONS.map((question) => (
          <fieldset
            key={question.id}
            className="mb-4 min-w-0 border-0 border-b border-[#eee] pb-4"
          >
            <legend className="mb-2.5 text-[15px] font-bold text-zinc-900">
              {question.label}
            </legend>
            <div className="flex gap-2" dir="ltr">
              {([1, 2, 3, 4, 5] as const).map((score) => {
                const checked = values.ratings[question.id] === String(score);
                return (
                  <label
                    key={score}
                    className="relative flex-1 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={score}
                      checked={checked}
                      onChange={() =>
                        setRating(question.id, String(score) as SurveyRatingValue)
                      }
                      className="absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0"
                      aria-label={`${question.label}: ${score} از ۵`}
                    />
                    <span
                      className={clsx(
                        "grid min-h-[46px] place-items-center rounded-xl border text-[17px] font-bold",
                        checked
                          ? "border-[#6d1e39] bg-[#6d1e39] text-white"
                          : "border-[#dcd4d7] bg-white text-zinc-900",
                      )}
                    >
                      {toPersianDigits(score)}
                    </span>
                  </label>
                );
              })}
            </div>
            <label className="mt-2.5 flex items-center gap-1.5 text-[13px] text-[#777]">
              <input
                type="radio"
                name={question.id}
                value="na"
                checked={values.ratings[question.id] === "na"}
                onChange={() => setRating(question.id, "na")}
                className="accent-[#6d1e39]"
              />
              تجربه نکردم / نظری ندارم
            </label>
          </fieldset>
        ))}

        <label
          htmlFor="survey-comment"
          className="mt-3.5 mb-2 block text-sm font-bold text-zinc-900"
        >
          چی رو دوست داشتی؟ چی رو بهتر کنیم؟{" "}
          <small className="mr-1 text-[13px] font-normal text-[#888]">
            اختیاری
          </small>
        </label>
        <textarea
          id="survey-comment"
          name="comment"
          maxLength={2000}
          rows={4}
          value={values.comment}
          onChange={(event) =>
            setValues((current) => ({ ...current, comment: event.target.value }))
          }
          placeholder="اگر موردی نیاز به رسیدگی داره، جزئیاتش رو اینجا برامون بنویس."
          className={clsx(inputClass, "resize-y")}
        />

        <details className="my-4 rounded-[14px] border border-[#e8dee1] p-3">
          <summary className="min-h-8 cursor-pointer text-sm font-bold text-[#6d1e39]">
            برای پیگیری دقیق‌تر، چند جزئیات اختیاری
          </summary>
          <p className="mt-2 text-[13px] leading-8 text-[#777]">
            این اطلاعات کمک می‌کنه زمان حضورت رو پیدا کنیم و موضوع رو دقیق‌تر
            بررسی کنیم.
          </p>

          <label
            htmlFor="survey-name"
            className="mt-3.5 mb-2 block text-sm font-bold"
          >
            نام شما{" "}
            <small className="mr-1 text-[13px] font-normal text-[#888]">
              اختیاری
            </small>
          </label>
          <input
            id="survey-name"
            name="name"
            autoComplete="name"
            maxLength={100}
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="دوست داری چی صدات کنیم؟"
            className={inputClass}
          />

          <label
            htmlFor="survey-date-button"
            className="mt-3.5 mb-2 block text-sm font-bold"
          >
            تاریخ حضور{" "}
            <small className="mr-1 text-[13px] font-normal text-[#888]">
              اختیاری
            </small>
          </label>
          <button
            id="survey-date-button"
            type="button"
            aria-haspopup="dialog"
            onClick={() => setDatePickerOpen(true)}
            className="flex min-h-12 w-full items-center justify-between rounded-xl border border-[#ded4d8] bg-white px-3 py-3 text-right text-base text-[#6d1e39]"
          >
            <span>
              {values.visitDate
                ? jalaliLabel(values.visitDate)
                : "انتخاب تاریخ شمسی"}
            </span>
            <span aria-hidden="true">▦</span>
          </button>
          <output
            className="mt-1 block text-[13px] text-[#637d6c]"
            aria-live="polite"
          >
            {values.visitDate ? visitWeekdayLabel(values.visitDate) : ""}
          </output>

          <label
            htmlFor="survey-receipt"
            className="mt-3.5 mb-2 block text-sm font-bold"
          >
            شماره فیش{" "}
            <small className="mr-1 text-[13px] font-normal text-[#888]">
              اختیاری
            </small>
          </label>
          <input
            id="survey-receipt"
            name="receipt"
            inputMode="numeric"
            maxLength={40}
            value={values.receipt}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                receipt: event.target.value,
              }))
            }
            placeholder="مثلاً ۱۲۳۴"
            className={inputClass}
          />

          <label
            htmlFor="survey-phone"
            className="mt-3.5 mb-2 block text-sm font-bold"
          >
            شماره موبایل{" "}
            <small className="mr-1 text-[13px] font-normal text-[#888]">
              اختیاری
            </small>
          </label>
          <input
            id="survey-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            value={values.phone}
            onChange={(event) =>
              setValues((current) => ({ ...current, phone: event.target.value }))
            }
            placeholder="۰۹۱۲…"
            className={inputClass}
          />
          <p className="mt-2 text-[13px] leading-8 text-[#777]">
            اگر دوست داری نتیجه پیگیری رو بهت بگیم، شماره‌ات رو بذار. شماره فقط
            برای پیگیری همین بازخورد استفاده می‌شه؛ ثبت نظر بدون شماره هم ممکنه.
          </p>
        </details>

        {error ? (
          <p
            ref={errorRef}
            role="alert"
            className="mt-2.5 rounded-[10px] bg-[#fff2f4] p-2.5 text-[13px] text-[#a12f47]"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 block min-h-[50px] w-full rounded-[14px] bg-[#637d6c] px-3 py-3 text-[15px] font-bold text-white disabled:opacity-50"
        >
          {SURVEY_MESSAGES.submitLabel}
        </button>
        <p className="my-2.5 text-center text-[13px] text-[#777]">
          {SURVEY_MESSAGES.thanks}
        </p>
      </form>

      {isDatePickerOpen ? (
        <SurveyDatePicker
          selectedIso={values.visitDate}
          onClose={() => setDatePickerOpen(false)}
          onConfirm={(iso) => {
            setValues((current) => ({ ...current, visitDate: iso }));
            setDatePickerOpen(false);
          }}
          onClear={() => {
            setValues((current) => ({ ...current, visitDate: "" }));
            setDatePickerOpen(false);
          }}
        />
      ) : null}
    </>
  );
};

export default SurveyForm;
