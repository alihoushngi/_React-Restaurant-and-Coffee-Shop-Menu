import assert from "node:assert/strict";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const server = await createServer({ server: { middlewareMode: true } });

try {
  const [{ default: FoodCard }, { isFoodAvailable }, { default: AvailabilityIndicator }] =
    await Promise.all([
      server.ssrLoadModule("/src/components/features/FoodCard.tsx"),
      server.ssrLoadModule("/src/lib/menu/utils.ts"),
      server.ssrLoadModule("/src/components/ui/AvailabilityIndicator.tsx"),
    ]);

  assert.equal(
    isFoodAvailable(true, { type: "always" }),
    true,
    "enabled always-available item is orderable",
  );
  assert.equal(
    isFoodAvailable(false, { type: "always" }),
    false,
    "disabled item is not orderable",
  );
  assert.equal(
    isFoodAvailable(false, {
      type: "hours",
      availableFrom: "00:00",
      availableTo: "23:59",
    }),
    false,
    "disabled item stays unavailable even inside hours",
  );
  assert.equal(
    isFoodAvailable(true, {
      type: "hours",
      availableFrom: "00:00",
      availableTo: "23:59",
    }),
    true,
    "enabled item inside all-day hours window is available",
  );

  const baseFood = {
    orderKey: "unavailable-1",
    name: "میگو پفکی",
    image: "https://example.com/10149.jpg",
    hasRealImage: true,
    enabled: false,
    price: 1100,
    shortDescription: "میگوی پفکی با پوشش ترد",
    availability: { type: "always" },
    categoryId: 1,
    categoryTitle: "پیش‌غذا",
    menuMode: "dine-in",
    searchText: "میگو",
  };

  const calls = { add: 0, open: 0, remove: 0 };
  const renderCard = (overrides = {}, props = {}) =>
    renderToStaticMarkup(
      React.createElement(FoodCard, {
        food: { ...baseFood, ...overrides },
        quantity: 0,
        onAddToOrder: () => {
          calls.add += 1;
        },
        onRemoveFromOrder: () => {
          calls.remove += 1;
        },
        onOpen: () => {
          calls.open += 1;
        },
        ...props,
      }),
    );

  const unavailableLarge = renderCard();
  assert.ok(
    unavailableLarge.includes("فعلاً موجود نیست"),
    "large unavailable card shows photo badge",
  );
  assert.ok(
    unavailableLarge.includes("ناموجود"),
    "large unavailable card shows ناموجود status/button",
  );
  assert.ok(
    unavailableLarge.includes("opacity-50") &&
      unavailableLarge.includes("grayscale"),
    "large unavailable image is grayed out",
  );
  assert.ok(
    unavailableLarge.includes("text-[#666]"),
    "large unavailable title uses muted color",
  );
  assert.ok(
    unavailableLarge.includes('data-order-disabled="true"'),
    "unavailable card marks order disabled",
  );
  assert.ok(
    unavailableLarge.includes("disabled") &&
      unavailableLarge.includes("ناموجود میگو پفکی"),
    "unavailable add control is disabled with ناموجود label",
  );

  const unavailableSmall = renderCard({}, { imageLayout: "small-left" });
  assert.ok(
    unavailableSmall.includes("فعلاً موجود نیست"),
    "small-left unavailable card keeps badge",
  );
  assert.ok(
    unavailableSmall.includes("ناموجود"),
    "small-left unavailable status remains readable",
  );

  const unavailableCompact = renderCard({}, { compact: true });
  assert.ok(
    unavailableCompact.includes("opacity-60"),
    "text-only unavailable row uses reduced opacity",
  );
  assert.ok(
    unavailableCompact.includes("ناموجود"),
    "text-only unavailable row shows ناموجود control",
  );

  const available = renderCard({ enabled: true });
  assert.ok(
    available.includes("قابل سفارش"),
    "available card keeps قابل سفارش label",
  );
  assert.ok(
    !available.includes("فعلاً موجود نیست"),
    "available card does not show unavailable badge",
  );
  assert.ok(
    available.includes("افزودن"),
    "available card shows افزودن button",
  );

  const indicatorUnavailable = renderToStaticMarkup(
    React.createElement(AvailabilityIndicator, {
      enabled: false,
      availability: { type: "always" },
    }),
  );
  assert.ok(
    indicatorUnavailable.includes("bg-[#a1a1aa]"),
    "unavailable availability dot is gray",
  );
  assert.ok(
    indicatorUnavailable.includes("ناموجود"),
    "unavailable availability text is ناموجود",
  );
  assert.ok(
    !indicatorUnavailable.includes("متاسفانه"),
    "legacy long unavailable copy is removed",
  );

  const indicatorAvailable = renderToStaticMarkup(
    React.createElement(AvailabilityIndicator, {
      enabled: true,
      availability: { type: "always" },
    }),
  );
  assert.ok(
    indicatorAvailable.includes("bg-[#10b981]"),
    "available availability dot is green",
  );

  console.log(
    "MENU-009: unavailable card badge, muted title, gray dot, disabled ناموجود control, compact/small layouts, and availability helper passed.",
  );
} finally {
  await server.close();
}
