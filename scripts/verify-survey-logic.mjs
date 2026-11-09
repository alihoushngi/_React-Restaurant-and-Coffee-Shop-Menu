import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true } });

try {
  const {
    createEmptySurveyValues,
    surveyDigits,
    validateSurvey,
  } = await server.ssrLoadModule("/src/lib/survey/validateSurvey.ts");
  const { SURVEY_MESSAGES } = await server.ssrLoadModule(
    "/src/lib/survey/constants.ts",
  );
  const {
    jalaliLabel,
    jalaliParts,
    resolvePersianDayIso,
    tehranTodayIso,
  } = await server.ssrLoadModule("/src/lib/survey/jalali.ts");

  let failed = 0;
  const assert = (condition, message) => {
    if (!condition) {
      failed += 1;
      console.error(`FAIL: ${message}`);
    } else {
      console.log(`PASS: ${message}`);
    }
  };

  assert(surveyDigits("۰۹۱۲") === "0912", "surveyDigits converts Persian digits");
  assert(
    surveyDigits("٠٩١٢") === "0912",
    "surveyDigits converts Arabic-Indic digits",
  );

  const empty = createEmptySurveyValues();
  assert(
    validateSurvey(empty).error === SURVEY_MESSAGES.missingFeedback,
    "empty survey requires rating or comment",
  );

  assert(
    validateSurvey({ ...empty, comment: "  عالی بود  " }).error === undefined,
    "comment alone is valid",
  );

  assert(
    validateSurvey({
      ...empty,
      ratings: { ...empty.ratings, food: "5" },
    }).record?.ratings.food === 5,
    "single rating is valid",
  );

  assert(
    validateSurvey({
      ...empty,
      ratings: { ...empty.ratings, food: "na" },
      comment: "",
    }).error === SURVEY_MESSAGES.missingFeedback,
    "na-only ratings without comment are invalid",
  );

  assert(
    validateSurvey({
      ...empty,
      comment: "ok",
      phone: "9123456789",
    }).error === SURVEY_MESSAGES.invalidPhone,
    "phone without leading 09 is rejected",
  );

  assert(
    validateSurvey({
      ...empty,
      comment: "ok",
      phone: "+989123456789",
    }).record?.phone === "09123456789",
    "phone +98 normalizes to 09",
  );

  assert(
    validateSurvey({
      ...empty,
      comment: "ok",
      visitDate: "not-a-date",
    }).error === SURVEY_MESSAGES.invalidVisitDate,
    "invalid visitDate rejected",
  );

  const today = tehranTodayIso();
  const parts = jalaliParts(today);
  assert(
    Number.isFinite(parts.year) && parts.month >= 1 && parts.month <= 12,
    "jalaliParts returns year/month for Tehran today",
  );
  assert(jalaliLabel(today).includes(" "), "jalaliLabel returns Persian label");

  const resolved = resolvePersianDayIso(parts.year, parts.month, parts.day);
  assert(resolved === today, "resolvePersianDayIso matches today parts");

  if (failed > 0) {
    console.error(`verify-survey-logic: ${failed} failed`);
    process.exitCode = 1;
  } else {
    console.log("verify-survey-logic: all assertions passed");
  }
} finally {
  await server.close();
}
