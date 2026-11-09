import assert from "node:assert/strict";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const server = await createServer({ server: { middlewareMode: true } });

try {
  const [
    { default: FoodCard },
    { default: FoodModal },
    { default: ProductPrice },
    { default: ProductOrderRow },
  ] = await Promise.all([
    server.ssrLoadModule("/src/components/features/FoodCard.tsx"),
    server.ssrLoadModule("/src/components/features/FoodModal.tsx"),
    server.ssrLoadModule("/src/components/ui/ProductPrice.tsx"),
    server.ssrLoadModule("/src/components/ui/ProductOrderRow.tsx"),
  ]);

  const availableFood = {
    orderKey: "a1",
    name: "سیب زمینی رایو",
    image: "https://example.com/2.jpg",
    hasRealImage: true,
    enabled: true,
    price: 1380,
    shortDescription:
      "سیب‌زمینی سرخ‌کرده با بیکن گوساله، دیپ گودا و پارمزان؛ ترکیبی پنیری و پرطعم.",
    summary:
      "سیب‌زمینی سرخ‌کرده با بیکن گوساله، دیپ گودا و پارمزان؛ ترکیبی پنیری و پرطعم.",
    availability: { type: "always" },
    categoryId: 1,
    categoryTitle: "پیش‌غذا",
    menuMode: "dine-in",
    searchText: "سیب",
    isVegetarian: true,
    isForTwo: true,
    sourceItemId: 2,
  };

  const variantFood = {
    ...availableFood,
    orderKey: "pizza-1",
    name: "پیتزا مارگاریتا",
    price: 980,
    variants: [
      {
        key: "junior",
        label: "جونیور",
        description: "۲۳ سانت",
        categoryId: 4,
        itemId: 201,
        orderKey: "dine-in:item:201",
        price: 980,
        enabled: true,
        image: availableFood.image,
        hasRealImage: true,
      },
      {
        key: "large",
        label: "بزرگ",
        description: "۳۰ سانت",
        categoryId: 4,
        itemId: 202,
        orderKey: "dine-in:item:202",
        price: 1280,
        enabled: true,
        image: availableFood.image,
        hasRealImage: true,
      },
    ],
    variantPresentation: {
      style: "paired",
      actionLabel: "انتخاب سایز",
      sheetTitle: "انتخاب سایز",
      sheetSubtitle: "انتخاب گزینه",
      optionLabel: "سایز",
    },
  };

  const noop = () => {};

  const largeCard = renderToStaticMarkup(
    React.createElement(FoodCard, {
      food: availableFood,
      quantity: 0,
      onAddToOrder: noop,
      onRemoveFromOrder: noop,
      onOpen: noop,
    }),
  );

  assert.ok(
    largeCard.includes("aspect-square"),
    "available large card keeps square image",
  );
  assert.ok(
    largeCard.includes("rounded-[24px]") &&
      largeCard.includes("border-[#e4e4e7]"),
    "available card uses reference radius and border",
  );
  assert.ok(
    largeCard.includes("قابل سفارش") && largeCard.includes("افزودن"),
    "available card shows availability and green add label",
  );
  assert.ok(
    largeCard.includes("گیاهی") && largeCard.includes("دونفره"),
    "available card shows real badges",
  );
  assert.ok(
    !largeCard.includes("hover:-translate-y-1"),
    "available card does not use lift hover that reference omits",
  );
  assert.ok(
    !largeCard.includes("عدد در لیست سفارش"),
    "available card omits extra order count caption",
  );

  const variantCard = renderToStaticMarkup(
    React.createElement(FoodCard, {
      food: variantFood,
      quantity: 0,
      onAddToOrder: noop,
      onRemoveFromOrder: noop,
      onOpen: noop,
    }),
  );
  assert.ok(
    variantCard.includes("جونیور / بزرگ") ||
      (variantCard.includes("جونیور") && variantCard.includes("بزرگ")),
    "variant card lists real option labels",
  );
  assert.ok(variantCard.includes("از"), "variant card price uses از prefix");

  const qtyCard = renderToStaticMarkup(
    React.createElement(FoodCard, {
      food: availableFood,
      quantity: 2,
      onAddToOrder: noop,
      onRemoveFromOrder: noop,
      onOpen: noop,
    }),
  );
  assert.ok(
    qtyCard.includes("کم کردن") && qtyCard.includes("افزودن سیب زمینی رایو"),
    "quantity stepper remains usable on available card",
  );

  const priceMarkup = renderToStaticMarkup(
    React.createElement(ProductPrice, {
      food: availableFood,
      appearance: "card",
    }),
  );
  assert.ok(
    priceMarkup.includes("تومان") && priceMarkup.includes("<small"),
    "price renders تومان as secondary small text",
  );

  const detail = renderToStaticMarkup(
    React.createElement(FoodModal, {
      food: availableFood,
      quantity: 0,
      recommendedDrinks: [],
      suggestDrink: false,
      onAddRecommendedDrink: noop,
      onClose: noop,
      onAddToOrder: noop,
      onRemoveFromOrder: noop,
    }),
  );
  assert.ok(
    detail.includes("جزئیات انتخاب"),
    "detail sheet uses reference header title",
  );
  assert.ok(
    detail.includes("rounded-[18px]") && detail.includes("aspect-square"),
    "detail media is square with reference radius",
  );
  assert.ok(
    detail.includes("bg-[#211016]/70") && detail.includes("backdrop-blur-[3px]"),
    "detail backdrop matches reference tint/blur",
  );
  assert.ok(
    detail.includes("افزودن") && detail.includes("قابل سفارش"),
    "detail footer keeps price/availability/add controls",
  );
  assert.ok(
    !detail.includes("bg-[#faf7f8]"),
    "detail description is not wrapped in legacy tinted box",
  );

  const longNameFood = {
    ...availableFood,
    name: "نام بسیار بسیار طولانی محصول برای بررسی شکست خط و overflow موبایل",
    shortDescription:
      "توضیح بسیار طولانی که باید در کارت clamp شود و در شیت جزئیات کامل دیده شود برای بررسی خوانایی و فاصله‌ها در عرض باریک موبایل.",
    hideImage: true,
    hasRealImage: false,
  };
  const noImageDetail = renderToStaticMarkup(
    React.createElement(FoodModal, {
      food: longNameFood,
      quantity: 1,
      recommendedDrinks: [],
      suggestDrink: false,
      onAddRecommendedDrink: noop,
      onClose: noop,
      onAddToOrder: noop,
      onRemoveFromOrder: noop,
    }),
  );
  assert.ok(
    noImageDetail.includes(longNameFood.name),
    "long name remains visible without image",
  );
  assert.ok(
    noImageDetail.includes("کم کردن") && noImageDetail.includes("افزودن"),
    "qty stepper and add remain usable without image",
  );

  const variantDetail = renderToStaticMarkup(
    React.createElement(FoodModal, {
      food: variantFood,
      quantity: 0,
      recommendedDrinks: [],
      suggestDrink: false,
      onAddRecommendedDrink: noop,
      onClose: noop,
      onAddToOrder: noop,
      onRemoveFromOrder: noop,
    }),
  );
  assert.ok(
    variantDetail.includes("جونیور") && variantDetail.includes("بزرگ"),
    "detail lists real API variant options",
  );
  assert.ok(
    !variantDetail.includes("گزینه ساختگی"),
    "detail does not invent option copy",
  );

  const detailsRow = renderToStaticMarkup(
    React.createElement(ProductOrderRow, {
      productName: availableFood.name,
      enabled: true,
      availability: { type: "always" },
      isAvailable: true,
      hasVariants: false,
      quantity: 3,
      appearance: "details",
      price: React.createElement(ProductPrice, {
        food: availableFood,
        appearance: "details",
      }),
      onAddToOrder: noop,
      onRemoveFromOrder: noop,
    }),
  );
  assert.ok(
    detailsRow.includes("۳") && detailsRow.includes("افزودن"),
    "details footer shows persian qty and add together",
  );

  console.log(
    "MENU-010: available card, detail sheet chrome, price/options, and qty edge cases passed.",
  );
} finally {
  await server.close();
}
