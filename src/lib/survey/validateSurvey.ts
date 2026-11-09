import {
  SURVEY_MESSAGES,
  SURVEY_QUESTIONS,
  type SurveyQuestionId,
} from "./constants";
import { jalaliLabel, visitWeekdayLabel } from "./jalali";

export type SurveyRatingValue = "1" | "2" | "3" | "4" | "5" | "na" | "";

export interface SurveyFormValues {
  ratings: Record<SurveyQuestionId, SurveyRatingValue>;
  comment: string;
  name: string;
  visitDate: string;
  receipt: string;
  phone: string;
}

export interface SurveyRecord {
  id: string;
  createdAt: string;
  status: "local-preview";
  sentToRestaurant: false;
  name: string | null;
  visitDateJalali: string | null;
  ratings: Partial<Record<SurveyQuestionId, number>>;
  comment: string;
  phone: string | null;
  visitDate: string | null;
  visitWeekday: string | null;
  receipt: string | null;
}

export type SurveyValidationResult =
  | { error: string; record?: undefined }
  | { error?: undefined; record: Omit<SurveyRecord, "id" | "createdAt" | "status" | "sentToRestaurant"> };

export const createEmptySurveyValues = (): SurveyFormValues => ({
  ratings: {
    food: "",
    staff: "",
    cleanliness: "",
    speed: "",
    comfort: "",
    value: "",
  },
  comment: "",
  name: "",
  visitDate: "",
  receipt: "",
  phone: "",
});

export const surveyDigits = (value: string): string =>
  String(value || "")
    .replace(/[۰-۹]/g, (char) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(char)))
    .replace(/[٠-٩]/g, (char) => String("٠١٢٣٤٥٦٧٨٩".indexOf(char)));

const normalizePhone = (raw: string): string => {
  let phone = surveyDigits(raw).replace(/[\s()-]/g, "");
  if (phone.startsWith("+98")) phone = `0${phone.slice(3)}`;
  if (phone.startsWith("0098")) phone = `0${phone.slice(4)}`;
  return phone;
};

export const validateSurvey = (
  values: SurveyFormValues,
): SurveyValidationResult => {
  const ratings: Partial<Record<SurveyQuestionId, number>> = {};

  for (const question of SURVEY_QUESTIONS) {
    const value = values.ratings[question.id];
    if (!value || value === "na") continue;
    if (!/^[1-5]$/.test(value)) {
      return { error: SURVEY_MESSAGES.invalidRating };
    }
    ratings[question.id] = Number(value);
  }

  const comment = String(values.comment || "").trim();
  if (Object.keys(ratings).length === 0 && !comment) {
    return { error: SURVEY_MESSAGES.missingFeedback };
  }

  const phone = normalizePhone(values.phone);
  if (phone && !/^09\d{9}$/.test(phone)) {
    return { error: SURVEY_MESSAGES.invalidPhone };
  }

  const visitDate = String(values.visitDate || "");
  if (
    visitDate &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(visitDate) ||
      Number.isNaN(Date.parse(`${visitDate}T12:00:00`)))
  ) {
    return { error: SURVEY_MESSAGES.invalidVisitDate };
  }

  return {
    record: {
      name: String(values.name || "").trim().slice(0, 100) || null,
      visitDateJalali: visitDate ? jalaliLabel(visitDate) : null,
      ratings,
      comment,
      phone: phone || null,
      visitDate: visitDate || null,
      visitWeekday: visitDate ? visitWeekdayLabel(visitDate) : null,
      receipt: surveyDigits(values.receipt).trim() || null,
    },
  };
};
