import {
  SURVEY_MESSAGES,
  SURVEY_STORAGE_KEY,
  SURVEY_STORAGE_LIMIT,
} from "./constants";
import type { SurveyRecord } from "./validateSurvey";

const createSurveyId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export type SaveSurveyResult =
  | { ok: true; record: SurveyRecord }
  | { ok: false; error: string };

export const saveSurveyPreview = (
  payload: Omit<
    SurveyRecord,
    "id" | "createdAt" | "status" | "sentToRestaurant"
  >,
): SaveSurveyResult => {
  try {
    const raw = localStorage.getItem(SURVEY_STORAGE_KEY) || "[]";
    const saved: unknown = JSON.parse(raw);
    if (!Array.isArray(saved)) {
      throw new Error("invalid storage");
    }
    if (saved.length >= SURVEY_STORAGE_LIMIT) {
      throw new Error("storage limit");
    }

    const record: SurveyRecord = {
      ...payload,
      id: createSurveyId(),
      createdAt: new Date().toISOString(),
      status: "local-preview",
      sentToRestaurant: false,
    };

    saved.push(record);
    localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(saved));
    return { ok: true, record };
  } catch {
    return { ok: false, error: SURVEY_MESSAGES.storageFailed };
  }
};
