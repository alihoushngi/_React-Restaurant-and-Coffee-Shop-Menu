import assert from "node:assert/strict";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const server = await createServer({ server: { middlewareMode: true } });

try {
  const { default: Section } = await server.ssrLoadModule(
    "/src/components/features/CategoryMenuSection.tsx",
  );
  const { SHOW_SUBCATEGORY_TABS } = await server.ssrLoadModule(
    "/src/constants/menu.ts",
  );
  const { getSubcategoryHeadingNote, SUBCATEGORY_HEADING_NOTES } =
    await server.ssrLoadModule("/src/constants/subcategoryHeadings.ts");

  assert.equal(
    SHOW_SUBCATEGORY_TABS,
    false,
    "sequential subcategory headings enabled for reference parity",
  );

  const food = (overrides = {}) => ({
    orderKey: "item-1",
    name: "آیتم نمونه",
    image: "https://example.com/a.jpg",
    hasRealImage: true,
    enabled: true,
    price: 100,
    shortDescription: "توضیح",
    isVegetarian: false,
    isDietary: false,
    ...overrides,
  });

  const render = (props = {}) =>
    renderToStaticMarkup(
      React.createElement(Section, {
        category: { Id: 24, Title: "نوشیدنی های گرم" },
        foods: [],
        subcategories: [
          {
            category: { Id: 10, Title: "برپایه شیر" },
            foods: [food({ orderKey: "milk-1", name: "ماچا لاته" })],
            subcategories: [],
          },
          {
            category: { Id: 9, Title: "دمنوش و چایی" },
            foods: [
              food({
                orderKey: "tea-1",
                name: "چای سبز",
                isVegetarian: true,
              }),
            ],
            subcategories: [],
          },
        ],
        index: 0,
        sectionRef() {},
        scrollMarginTop: 0,
        dietaryFilter: "all",
        getQuantity: () => 0,
        onAddToOrder() {},
        onRemoveFromOrder() {},
        onOpen() {},
        ...props,
      }),
    );

  const all = render();
  assert.ok(all.includes("برپایه شیر"), "shows first subcategory API title");
  assert.ok(all.includes("دمنوش و چایی"), "shows second subcategory API title");
  assert.equal(
    (all.match(/bg-\[#faf5f6\]/g) ?? []).length,
    2,
    "each subcategory gets one pill badge",
  );
  assert.ok(all.includes("bg-[#dcc5ca]"), "divider color matches reference");
  assert.ok(all.includes("text-[#7a394a]"), "heading color matches reference");
  assert.ok(all.includes("rounded-[30px]"), "pill radius matches reference");
  assert.ok(
    !all.includes('aria-pressed'),
    "tab chips are not used in sequential mode",
  );
  const pillTitles = [...all.matchAll(/bg-\[#faf5f6\][^>]*>([^<]+)</g)].map(
    (match) => match[1],
  );
  assert.deepEqual(
    pillTitles,
    ["برپایه شیر", "دمنوش و چایی"],
    "heading pills use API subcategory titles only (not dietary flags)",
  );

  const longTitle =
    "زیردستهٔ بسیار بلند برای بررسی شکست خط بدون بریدن متن در عرض باریک موبایل";
  const long = render({
    subcategories: [
      {
        category: { Id: 99, Title: longTitle },
        foods: [food({ orderKey: "long-1" })],
        subcategories: [],
      },
    ],
  });
  assert.ok(long.includes(longTitle), "long RTL title is kept in full");
  assert.ok(
    long.includes("break-words") || long.includes("whitespace-normal"),
    "long title allows wrapping instead of clipping",
  );
  assert.equal(
    (long.match(/bg-\[#faf5f6\]/g) ?? []).length,
    1,
    "no duplicate pill for a single subcategory",
  );

  const vegetarianOnly = render({ dietaryFilter: "vegetarian" });
  assert.ok(
    vegetarianOnly.includes("دمنوش و چایی"),
    "keeps subcategory with matching items",
  );
  assert.ok(
    !vegetarianOnly.includes("برپایه شیر"),
    "hides empty subcategory under dietary filter",
  );
  assert.equal(
    (vegetarianOnly.match(/bg-\[#faf5f6\]/g) ?? []).length,
    1,
    "only one heading remains after filter",
  );

  assert.equal(
    typeof getSubcategoryHeadingNote(10),
    "undefined",
    "no invented note without mapped category Id",
  );
  assert.deepEqual(
    SUBCATEGORY_HEADING_NOTES,
    {},
    "notes map stays empty until a valid API Id is documented",
  );

  console.log(
    "MENU-012: sequential pill headings, dividers, filter hide, long title, no dietary confusion.",
  );
} finally {
  await server.close();
}
