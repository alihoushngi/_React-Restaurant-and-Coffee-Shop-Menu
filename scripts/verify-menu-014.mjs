import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const EXPECTED =
  "حساسیت غذایی یا سؤال درباره ترکیبات داری؟ قبل از سفارش با همکارهای ما در میون بذار تا راهنمایی‌ات کنیم.";

const server = await createServer({ server: { middlewareMode: true } });

try {
  const { FOOD_ALLERGY_ENDNOTE } = await server.ssrLoadModule(
    "/src/constants/menu.ts",
  );
  const { default: FoodAllergyEndnote } = await server.ssrLoadModule(
    "/src/components/ui/FoodAllergyEndnote.tsx",
  );

  assert.equal(
    FOOD_ALLERGY_ENDNOTE,
    EXPECTED,
    "endnote copy matches reference exactly",
  );

  const markup = renderToStaticMarkup(React.createElement(FoodAllergyEndnote));
  assert.ok(markup.includes("<footer"), "renders as footer landmark");
  assert.ok(markup.includes(EXPECTED), "renders exact Persian copy once");
  assert.equal(
    (markup.match(new RegExp(EXPECTED, "g")) ?? []).length,
    1,
    "copy appears exactly once in endnote markup",
  );
  assert.ok(markup.includes("text-center"), "centered like reference");
  assert.ok(markup.includes("text-[12px]"), "12px font (cascaded .endnote)");
  assert.ok(markup.includes("leading-[2]"), "line-height 2 like reference");
  assert.ok(markup.includes("text-[#71717a]"), "muted #71717a (--muted)");
  assert.ok(markup.includes("pt-2.5"), "top padding 10px");
  assert.ok(markup.includes("px-3"), "horizontal padding 12px");
  assert.ok(markup.includes("pb-10"), "bottom padding 40px before nav clearance");

  const menuPage = readFileSync(
    new URL("../src/components/features/MenuPage.tsx", import.meta.url),
    "utf8",
  );
  assert.ok(
    menuPage.includes("FoodAllergyEndnote"),
    "MenuPage mounts the endnote (covers dine-in and delivery)",
  );
  assert.ok(
    /<\/section>\s*\n\s*<FoodAllergyEndnote\s*\/>/.test(menuPage),
    "endnote is placed after the categories section",
  );

  const tableMenu = readFileSync(
    new URL("../src/pages/TableMenu.tsx", import.meta.url),
    "utf8",
  );
  const deliveryMenu = readFileSync(
    new URL("../src/pages/DeliveryMenu.tsx", import.meta.url),
    "utf8",
  );
  assert.ok(
    !tableMenu.includes("FoodAllergyEndnote"),
    "loading/error shell in TableMenu does not embed endnote",
  );
  assert.ok(
    !deliveryMenu.includes("FoodAllergyEndnote"),
    "loading/error shell in DeliveryMenu does not embed endnote",
  );
  assert.ok(
    tableMenu.includes("در حال بارگذاری") && tableMenu.includes("خطا در دریافت"),
    "TableMenu keeps dedicated loading/error messages",
  );
  assert.ok(
    deliveryMenu.includes("در حال بارگذاری") &&
      deliveryMenu.includes("خطا در دریافت"),
    "DeliveryMenu keeps dedicated loading/error messages",
  );

  console.log(`verify-menu-014: PASS (${EXPECTED.length}-char endnote + placement)`);
} finally {
  await server.close();
}
