import assert from "node:assert/strict";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const server = await createServer({ server: { middlewareMode: true } });

try {
  const { default: Section } = await server.ssrLoadModule(
    "/src/components/features/CategoryMenuSection.tsx",
  );
  const { default: FoodCard } = await server.ssrLoadModule(
    "/src/components/features/FoodCard.tsx",
  );
  const { SHOW_SUBCATEGORY_TABS } = await server.ssrLoadModule(
    "/src/constants/menu.ts",
  );

  assert.equal(SHOW_SUBCATEGORY_TABS, false, "sequential subcategory headings");

  const shake = (overrides = {}) => ({
    orderKey: "shake-1",
    name: "شیک لوتوس",
    image: "https://example.com/lotus.jpg",
    hasRealImage: true,
    enabled: true,
    price: 490,
    shortDescription: "بستنی وانیلی با کرم لوتوس",
    ...overrides,
  });

  const renderShake = (props = {}) =>
    renderToStaticMarkup(
      React.createElement(Section, {
        category: {
          Id: 26,
          Title: "شیک",
          DisplayType: "SmallImageLeft",
        },
        foods: [
          shake(),
          shake({
            orderKey: "shake-2",
            name: "دارک اسموت",
            shortDescription: "شیر و بستنی با نارگیل",
          }),
        ],
        subcategories: [],
        index: 2,
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

  // FR-1: shake/smoothie section uses reference compact-card structure
  const compact = renderShake();
  assert.ok(compact.includes("شیک"), "section title from API");
  assert.ok(compact.includes("rounded-[18px]"), "compact-card radius 18px");
  assert.ok(
    compact.includes("grid-cols-[minmax(0,1fr)_76px]"),
    "text + 76px thumb grid",
  );
  assert.ok(compact.includes("rounded-[12px]"), "thumb radius 12px");
  assert.ok(compact.includes("text-[15px]"), "title 15px");
  assert.ok(compact.includes("بستنی وانیلی با کرم لوتوس"), "description kept");
  assert.ok(compact.includes("افزودن"), "add control");
  assert.ok(compact.includes("gap-4"), "16px stack gap");
  assert.equal((compact.match(/<img /g) ?? []).length, 2, "per-item images");

  // Internal subcategory titles keep compact cards via parent DisplayType fallback
  const withSubs = renderShake({
    foods: [],
    subcategories: [
      {
        category: { Id: 261, Title: "شیک‌ها" },
        foods: [shake({ orderKey: "sub-1", name: "شیک وانیل" })],
        subcategories: [],
      },
      {
        category: { Id: 262, Title: "اسموتی‌ها", DisplayType: "SmallImageLeft" },
        foods: [
          shake({
            orderKey: "sub-2",
            name: "دارک اسموت",
            isVegetarian: true,
          }),
        ],
        subcategories: [],
      },
    ],
  });
  assert.ok(withSubs.includes("شیک‌ها"), "internal subcategory heading");
  assert.ok(withSubs.includes("اسموتی‌ها"), "second internal heading");
  assert.ok(
    withSubs.includes("grid-cols-[minmax(0,1fr)_76px]"),
    "child without DisplayType inherits parent compact",
  );
  assert.ok(withSubs.includes("گیاهی"), "dietary badge still renders");

  // FR-2: dessert / breakfast stay large; hookah FirstItemImage untouched
  const dessert = renderToStaticMarkup(
    React.createElement(Section, {
      category: { Id: 15, Title: "کیک و دسر" },
      foods: [shake({ orderKey: "cake", name: "تیرامیسو", shortDescription: "اسفنج" })],
      subcategories: [],
      index: 1,
      sectionRef() {},
      scrollMarginTop: 0,
      dietaryFilter: "all",
      getQuantity: () => 0,
      onAddToOrder() {},
      onRemoveFromOrder() {},
      onOpen() {},
    }),
  );
  assert.ok(dessert.includes("rounded-[24px]"), "dessert stays LargeImage");
  assert.ok(
    !dessert.includes("grid-cols-[minmax(0,1fr)_76px]"),
    "dessert is not compact",
  );

  const breakfast = renderToStaticMarkup(
    React.createElement(Section, {
      category: { Id: 19, Title: "صبحانه" },
      foods: [shake({ orderKey: "egg", name: "املت", shortDescription: "تخم‌مرغ" })],
      subcategories: [],
      index: 3,
      sectionRef() {},
      scrollMarginTop: 0,
      dietaryFilter: "all",
      getQuantity: () => 0,
      onAddToOrder() {},
      onRemoveFromOrder() {},
      onOpen() {},
    }),
  );
  assert.ok(breakfast.includes("rounded-[24px]"), "breakfast stays LargeImage");

  const hookah = renderToStaticMarkup(
    React.createElement(Section, {
      category: { Id: 20, Title: "قلیان", DisplayType: "FirstItemImage" },
      foods: [
        shake({ orderKey: "h1", name: "آلبالو", shortDescription: "" }),
        shake({ orderKey: "h2", name: "نعناع", shortDescription: "" }),
      ],
      subcategories: [],
      index: 4,
      sectionRef() {},
      scrollMarginTop: 0,
      dietaryFilter: "all",
      getQuantity: () => 0,
      onAddToOrder() {},
      onRemoveFromOrder() {},
      onOpen() {},
    }),
  );
  assert.equal((hookah.match(/<img /g) ?? []).length, 1, "hookah shared image");
  assert.ok(hookah.includes("rounded-[13px]"), "hookah compact rows unchanged");

  // FR-3: missing image, unavailable, variable price, variants, filters
  const missingImage = renderToStaticMarkup(
    React.createElement(FoodCard, {
      food: shake({ hasRealImage: false, image: "" }),
      quantity: 0,
      imageLayout: "small-left",
      onAddToOrder() {},
      onRemoveFromOrder() {},
      onOpen() {},
    }),
  );
  assert.ok(missingImage.includes("h-[76px]"), "missing image keeps 76px slot");
  assert.ok(missingImage.includes("rounded-[12px]"), "missing image thumb radius");
  assert.ok(missingImage.includes("<img "), "fallback logo still rendered");

  const unavailable = renderToStaticMarkup(
    React.createElement(FoodCard, {
      food: shake({ enabled: false }),
      quantity: 0,
      imageLayout: "small-left",
      onAddToOrder() {},
      onRemoveFromOrder() {},
      onOpen() {},
    }),
  );
  assert.ok(unavailable.includes("ناموجود"), "unavailable shows ناموجود");
  assert.ok(
    unavailable.includes("فعلاً موجود نیست") || unavailable.includes("opacity"),
    "unavailable visual treatment kept",
  );

  const variants = renderToStaticMarkup(
    React.createElement(FoodCard, {
      food: shake({
        variants: [
          {
            key: "s",
            label: "کوچک",
            description: "",
            categoryId: 26,
            itemId: 1,
            title: "شیک کوچک",
            orderKey: "v1",
            price: 390,
            enabled: true,
            image: "",
            hasRealImage: false,
            shortDescription: "",
            searchText: "",
          },
          {
            key: "l",
            label: "بزرگ",
            description: "",
            categoryId: 26,
            itemId: 2,
            title: "شیک بزرگ",
            orderKey: "v2",
            price: 490,
            enabled: true,
            image: "",
            hasRealImage: false,
            shortDescription: "",
            searchText: "",
          },
        ],
        price: null,
      }),
      quantity: 0,
      imageLayout: "small-left",
      onAddToOrder() {},
      onRemoveFromOrder() {},
      onOpen() {},
    }),
  );
  assert.ok(variants.includes("کوچک") || variants.includes("افزودن"), "variants kept");

  const filteredEmpty = renderShake({
    foods: [shake({ isVegetarian: false, isDietary: false })],
    dietaryFilter: "vegetarian",
  });
  assert.ok(
    filteredEmpty.includes("در حال حاضر آیتمی در این بخش موجود نیست"),
    "empty filter state preserved",
  );

  const filteredSubGone = renderShake({
    foods: [],
    dietaryFilter: "dietary",
    subcategories: [
      {
        category: { Id: 261, Title: "شیک‌ها" },
        foods: [shake({ orderKey: "nv", isDietary: false })],
        subcategories: [],
      },
      {
        category: { Id: 262, Title: "اسموتی رژیمی" },
        foods: [shake({ orderKey: "d1", name: "سبز", isDietary: true })],
        subcategories: [],
      },
    ],
  });
  assert.ok(!filteredSubGone.includes("شیک‌ها"), "empty subcategory heading omitted");
  assert.ok(filteredSubGone.includes("اسموتی رژیمی"), "matching subcategory kept");

  // Missing DisplayType on live API still defaults to large (no name hardcoding)
  const liveDefault = renderShake({
    category: { Id: 26, Title: "شیک" },
  });
  assert.ok(
    liveDefault.includes("rounded-[24px]"),
    "absent DisplayType does not hardcode shake compact",
  );

  console.log(
    "MENU-013: shake compact-card via SmallImageLeft, parent DisplayType fallback for internal titles, dessert/breakfast/hookah preserved, missing/unavailable/filter/variants kept.",
  );
} finally {
  await server.close();
}
