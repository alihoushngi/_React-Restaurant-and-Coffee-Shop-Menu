import assert from "node:assert/strict";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const server = await createServer({ server: { middlewareMode: true } });

try {
  const { default: Section } = await server.ssrLoadModule(
    "/src/components/features/CategoryMenuSection.tsx",
  );
  const { getContractedDisplayType } = await server.ssrLoadModule(
    "/src/constants/categoryDisplayTypes.ts",
  );

  const food = (overrides = {}) => ({
    orderKey: "item-1",
    name: "آیتم نمونه",
    image: "https://example.com/drink.jpg",
    hasRealImage: true,
    enabled: true,
    price: 220,
    shortDescription: "توضیح کوتاه",
    ...overrides,
  });

  const render = (category, props = {}) =>
    renderToStaticMarkup(
      React.createElement(Section, {
        category,
        foods: [
          food(),
          food({ orderKey: "item-2", name: "آیتم دوم" }),
        ],
        subcategories: [],
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

  const assertCompact = (html, label) => {
    assert.ok(
      html.includes("grid-cols-[minmax(0,1fr)_76px]"),
      `${label}: compact grid`,
    );
    assert.ok(html.includes("rounded-[18px]"), `${label}: compact radius`);
    assert.ok(
      html.includes("w-[76px]") || html.includes("h-[76px]"),
      `${label}: 76px thumb`,
    );
    assert.equal((html.match(/<img /g) ?? []).length, 2, `${label}: per-item images`);
  };

  assert.equal(getContractedDisplayType(25), "SmallImageLeft");
  assert.equal(getContractedDisplayType(21), "SmallImageLeft");
  assert.equal(getContractedDisplayType(24), "SmallImageLeft");
  assert.equal(getContractedDisplayType(26), "SmallImageLeft");
  assert.equal(getContractedDisplayType(11), "SmallImageLeft");
  assert.equal(getContractedDisplayType(20), "FirstItemImage");
  assert.equal(getContractedDisplayType(15), undefined);
  assert.equal(getContractedDisplayType(19), undefined);

  assertCompact(render({ Id: 25, Title: "قهوه ها" }), "coffee Id=25");
  assertCompact(render({ Id: 21, Title: "پایه اسپرسو (سرد)" }), "espresso-cold Id=21");
  assertCompact(render({ Id: 26, Title: "شیک" }), "shake Id=26");
  assertCompact(
    render({ Id: 11, Title: "ماکتیل و سرد نوش" }),
    "mocktail/soda Id=11 EC-1=B",
  );

  // Hot parent contract + children 9/10 inherit when API omits DisplayType
  const hotWithChildren = render(
    { Id: 24, Title: "نوشیدنی های گرم" },
    {
      foods: [],
      subcategories: [
        {
          category: { Id: 9, Title: "دمنوش و چایی" },
          foods: [food({ orderKey: "tea", name: "چای" })],
          subcategories: [],
        },
        {
          category: { Id: 10, Title: "برپایه شیر" },
          foods: [food({ orderKey: "milk", name: "هات چاکلت" })],
          subcategories: [],
        },
      ],
    },
  );
  assert.ok(hotWithChildren.includes("دمنوش و چایی"), "hot child heading 9");
  assert.ok(hotWithChildren.includes("برپایه شیر"), "hot child heading 10");
  assert.ok(
    hotWithChildren.includes("grid-cols-[minmax(0,1fr)_76px]"),
    "hot children inherit SmallImageLeft from parent contract",
  );
  assert.equal(
    (hotWithChildren.match(/<img /g) ?? []).length,
    2,
    "both hot children render compact images",
  );

  // Child under non-contracted parent still uses own Id contract (21 under 23)
  const coldParentWithEspresso = render(
    { Id: 23, Title: "نوشیدنی های سرد" },
    {
      foods: [],
      subcategories: [
        {
          category: { Id: 21, Title: "پایه اسپرسو (سرد)" },
          foods: [food({ orderKey: "cold-espresso", name: "آیس لاته" })],
          subcategories: [],
        },
        {
          category: { Id: 11, Title: "ماکتیل و سرد نوش" },
          foods: [food({ orderKey: "soda", name: "کوکا" })],
          subcategories: [],
        },
      ],
    },
  );
  assert.ok(
    coldParentWithEspresso.includes("grid-cols-[minmax(0,1fr)_76px]"),
    "child contracts 21/11 activate under LargeImage parent 23",
  );
  assert.equal(
    (coldParentWithEspresso.match(/<img /g) ?? []).length,
    2,
    "contracted cold children each show images",
  );

  // API DisplayType still wins over contract
  const apiOverride = render({
    Id: 25,
    Title: "قهوه ها",
    DisplayType: "LargeImage",
  });
  assert.ok(apiOverride.includes("rounded-[24px]"), "API LargeImage wins over coffee contract");
  assert.ok(
    !apiOverride.includes("grid-cols-[minmax(0,1fr)_76px]"),
    "API override is not compact",
  );

  // Non-target categories unchanged
  const dessert = render({ Id: 15, Title: "کیک و دسر" });
  assert.ok(dessert.includes("rounded-[24px]"), "dessert stays LargeImage");
  assert.ok(
    !dessert.includes("grid-cols-[minmax(0,1fr)_76px]"),
    "dessert is not compact",
  );

  const breakfast = render({ Id: 19, Title: "صبحانه" });
  assert.ok(breakfast.includes("rounded-[24px]"), "breakfast stays LargeImage");

  const hookah = render({ Id: 20, Title: "قلیان" });
  assert.equal((hookah.match(/<img /g) ?? []).length, 1, "hookah FirstItemImage preserved");
  assert.ok(hookah.includes("rounded-[13px]"), "hookah compact rows preserved");

  console.log(
    "MENU-016: contracts 25/21/24/26/11 SmallImageLeft, hot child inheritance, cold child contracts, API override, non-targets preserved.",
  );
} finally {
  await server.close();
}
