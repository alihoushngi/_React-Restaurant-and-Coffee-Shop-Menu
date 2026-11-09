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

  const baseFood = {
    orderKey: "drink-1",
    name: "اسپرسو دبل",
    image: "https://example.com/espresso.jpg",
    hasRealImage: true,
    enabled: true,
    price: 180,
    shortDescription: "عصاره دبل قهوه",
  };

  const renderSection = (displayType, foods = [baseFood, { ...baseFood, orderKey: "drink-2", name: "لاته" }]) =>
    renderToStaticMarkup(
      React.createElement(Section, {
        category: { Id: 25, Title: "قهوه ها", DisplayType: displayType },
        foods,
        subcategories: [],
        index: 0,
        sectionRef() {},
        scrollMarginTop: 0,
        dietaryFilter: "all",
        getQuantity: () => 0,
        onAddToOrder() {},
        onRemoveFromOrder() {},
        onOpen() {},
      }),
    );

  const renderCard = (props = {}) =>
    renderToStaticMarkup(
      React.createElement(FoodCard, {
        food: baseFood,
        quantity: 0,
        onAddToOrder() {},
        onRemoveFromOrder() {},
        onOpen() {},
        ...props,
      }),
    );

  const small = renderSection("SmallImageLeft");
  assert.equal((small.match(/<img /g) ?? []).length, 2, "SmallImageLeft shows per-item images");
  assert.ok(small.includes("rounded-[18px]"), "SmallImageLeft uses compact-card radius");
  assert.ok(small.includes("w-[76px]") || small.includes("h-[76px]"), "SmallImageLeft uses 76px thumb");
  assert.ok(small.includes("grid-cols-[minmax(0,1fr)_76px]"), "SmallImageLeft uses compact grid");
  assert.ok(small.includes("عصاره دبل قهوه"), "SmallImageLeft keeps description");
  assert.ok(small.includes("افزودن"), "SmallImageLeft keeps add control");
  assert.ok(small.includes("gap-4"), "SmallImageLeft stack uses 16px gap");

  const noImage = renderSection("NoImage");
  assert.equal((noImage.match(/<img /g) ?? []).length, 0, "NoImage has no product images");
  assert.ok(!noImage.includes("عصاره دبل قهوه"), "NoImage hides description");
  assert.ok(noImage.includes("rounded-2xl"), "NoImage uses text-only radius");
  assert.ok(noImage.includes("text-[15px]"), "NoImage title is 15px");
  assert.ok(noImage.includes("افزودن"), "NoImage keeps add control");
  assert.ok(noImage.includes("gap-4"), "NoImage stack uses 16px gap");

  const large = renderSection("LargeImage");
  assert.equal((large.match(/<img /g) ?? []).length, 2, "LargeImage keeps full images");
  assert.ok(large.includes("rounded-[24px]"), "LargeImage keeps large card radius");
  assert.ok(!large.includes("grid-cols-[minmax(0,1fr)_76px]"), "LargeImage is not compact grid");
  assert.ok(large.includes("gap-3"), "LargeImage stack gap unchanged");

  const missing = renderSection(undefined);
  assert.ok(missing.includes("rounded-[24px]"), "missing DisplayType defaults to LargeImage");

  const dessert = renderToStaticMarkup(
    React.createElement(Section, {
      category: { Id: 15, Title: "کیک و دسر" },
      foods: [{ ...baseFood, orderKey: "cake", name: "تیرامیسو", shortDescription: "لایه‌های اسفنج" }],
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
  assert.ok(dessert.includes("rounded-[24px]"), "dessert without DisplayType stays large");
  assert.ok(dessert.includes("لایه‌های اسفنج"), "dessert description preserved");

  const compactCard = renderCard({ imageLayout: "small-left" });
  assert.ok(compactCard.includes("rounded-[18px]"), "FoodCard small-left radius");
  assert.ok(
    compactCard.includes("rounded-[12px]") || compactCard.includes("rounded-xl"),
    "FoodCard small-left thumb radius 12px",
  );
  assert.ok(compactCard.includes("text-[15px]"), "FoodCard small-left title size");
  assert.ok(compactCard.includes("text-xs leading-[1.8]"), "FoodCard small-left description size");

  const textOnlyUnavailable = renderCard({
    imageLayout: "none",
    food: { ...baseFood, enabled: false },
  });
  assert.ok(textOnlyUnavailable.includes("opacity-60"), "NoImage unavailable uses opacity");
  assert.ok(textOnlyUnavailable.includes("ناموجود"), "NoImage unavailable shows ناموجود");
  assert.ok(!textOnlyUnavailable.includes("<img "), "NoImage unavailable still has no image");

  const firstItem = renderSection("FirstItemImage");
  assert.equal((firstItem.match(/<img /g) ?? []).length, 1, "FirstItemImage still shares one image");
  assert.ok(firstItem.includes("rounded-[13px]"), "FirstItemImage rows stay title-price style");
  assert.ok(!firstItem.includes("عصاره دبل قهوه"), "FirstItemImage rows hide description");

  console.log(
    "MENU-011: SmallImageLeft compact-card, NoImage text-only, LargeImage/dessert preserved, FirstItemImage unchanged.",
  );
} finally {
  await server.close();
}
