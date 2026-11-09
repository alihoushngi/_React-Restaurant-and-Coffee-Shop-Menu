// Run with Node 22.18+ (native TypeScript stripping): node scripts/verify-menu-logic.mjs
import {
  isTruthyApiFlag, readItemFeatureFlags, resolveCategoryDisplayType,
  resolveFoodImageLayout, matchesDietaryFilter, filterFoodsByDietary,
  filterFoodsForSearchSheet, collectUniqueFlaggedFoods, filterMenuTreeByDietary,
} from "../src/lib/menu/itemFlags.ts";
import { getContractedDisplayType } from "../src/constants/categoryDisplayTypes.ts";
import {
  getCartItemLabels,
  resolveFavoriteEntryMenuMode,
  resolveOrderSelections,
} from "../src/lib/menu/orderSelections.ts";

let failed = 0;
const assert = (condition, message) => {
  if (!condition) {
    failed += 1;
    console.error(`FAIL: ${message}`);
  } else {
    console.log(`PASS: ${message}`);
  }
};

// Eight combinations of three badge flags (true vs absent/false)
const combos = [
  [false, false, false],
  [true, false, false],
  [false, true, false],
  [false, false, true],
  [true, true, false],
  [true, false, true],
  [false, true, true],
  [true, true, true],
];

for (const [forTwo, dietary, vegetarian] of combos) {
  const flags = readItemFeatureFlags({ IsForTwo: forTwo, IsDietary: dietary, IsVegetarian: vegetarian });
  assert(
    (flags.isForTwo === true) === forTwo &&
      (flags.isDietary === true) === dietary &&
      (flags.isVegetarian === true) === vegetarian,
    `badge combo forTwo=${forTwo} dietary=${dietary} veg=${vegetarian}`,
  );
}

assert(isTruthyApiFlag("false") === false, `Boolean("false") must not activate`);
assert(isTruthyApiFlag(null) === false, "null flag inactive");
assert(isTruthyApiFlag(undefined) === false, "absent flag inactive");
assert(isTruthyApiFlag(1) === false, "truthy non-boolean inactive");

assert(resolveCategoryDisplayType(undefined) === "LargeImage", "DisplayType absent → LargeImage");
assert(resolveCategoryDisplayType("bogus") === "LargeImage", "DisplayType invalid → LargeImage");
assert(resolveCategoryDisplayType("NoImage") === "NoImage", "DisplayType NoImage");
assert(
  resolveCategoryDisplayType(undefined, "SmallImageLeft") === "SmallImageLeft",
  "missing child DisplayType inherits parent",
);
assert(
  resolveCategoryDisplayType(null, "SmallImageLeft") === "SmallImageLeft",
  "null child DisplayType inherits parent",
);
assert(
  resolveCategoryDisplayType("bogus", "SmallImageLeft") === "LargeImage",
  "invalid child DisplayType does not inherit",
);
assert(
  resolveCategoryDisplayType("NoImage", "SmallImageLeft") === "NoImage",
  "explicit child DisplayType wins over parent",
);
assert(resolveFoodImageLayout("FirstItemImage", 0) === "large", "FirstItemImage index 0 large");
assert(resolveFoodImageLayout("FirstItemImage", 1) === "none", "FirstItemImage index 1 none");
assert(resolveFoodImageLayout("SmallImageLeft", 0) === "small-left", "SmallImageLeft layout");
assert(resolveFoodImageLayout("LargeImage", 0) === "large", "LargeImage always shows an image");
assert(getContractedDisplayType(20) === "FirstItemImage", "hookah Id=20 contracts FirstItemImage");
assert(getContractedDisplayType(25) === "SmallImageLeft", "coffee Id=25 contracts SmallImageLeft");
assert(getContractedDisplayType(21) === "SmallImageLeft", "espresso-cold Id=21 contracts SmallImageLeft");
assert(getContractedDisplayType(24) === "SmallImageLeft", "hot drinks Id=24 contracts SmallImageLeft");
assert(getContractedDisplayType(26) === "SmallImageLeft", "shake Id=26 contracts SmallImageLeft");
assert(getContractedDisplayType(11) === "SmallImageLeft", "mocktail/soda Id=11 contracts SmallImageLeft (EC-1=B)");
assert(getContractedDisplayType(9) === undefined, "hot child Id=9 has no own contract (inherits parent)");
assert(getContractedDisplayType(10) === undefined, "hot child Id=10 has no own contract (inherits parent)");
assert(getContractedDisplayType(15) === undefined, "dessert Id=15 has no compact contract");
assert(getContractedDisplayType(19) === undefined, "breakfast Id=19 has no compact contract");
assert(getContractedDisplayType(1) === undefined, "unlisted category has no display contract");
assert(
  resolveCategoryDisplayType(undefined, getContractedDisplayType(20)) === "FirstItemImage",
  "missing API DisplayType falls back to category contract",
);
assert(
  resolveCategoryDisplayType("LargeImage", getContractedDisplayType(20)) === "LargeImage",
  "explicit API DisplayType wins over category contract",
);
assert(
  resolveCategoryDisplayType(undefined, getContractedDisplayType(25)) === "SmallImageLeft",
  "missing API DisplayType falls back to coffee contract",
);
assert(
  resolveCategoryDisplayType("LargeImage", getContractedDisplayType(26)) === "LargeImage",
  "explicit API DisplayType wins over shake contract",
);
assert(
  resolveCategoryDisplayType(undefined, getContractedDisplayType(24)) === "SmallImageLeft",
  "hot parent contract available for child inheritance",
);

const both = { isVegetarian: true, isDietary: true, orderKey: "a", sourceItemId: 1 };
const vegOnly = { isVegetarian: true, orderKey: "b", sourceItemId: 2 };
const dietOnly = { isDietary: true, orderKey: "c", sourceItemId: 3 };
const neither = { orderKey: "d", sourceItemId: 4 };
assert(matchesDietaryFilter(both, "vegetarian"), "shared item in vegetarian");
assert(matchesDietaryFilter(both, "dietary"), "shared item in dietary");
assert(matchesDietaryFilter(vegOnly, "dietary") === false, "veg-only excluded from dietary");
assert(matchesDietaryFilter(neither, "all"), "all keeps unflagged");

const popularPool = [
  { isPopular: true, orderKey: "p1", sourceItemId: 10 },
  { isPopular: true, orderKey: "p1-dup", sourceItemId: 10 },
  { isPopular: false, orderKey: "p2", sourceItemId: 11 },
  { orderKey: "p3", sourceItemId: 12 },
  {
    orderKey: "p4",
    sourceItemId: 13,
    variants: [{ isPopular: true, orderKey: "pv", itemId: 13 }],
  },
];
const popular = collectUniqueFlaggedFoods(popularPool, "isPopular");
assert(popular.length === 2, `popular unique count (got ${popular.length})`);

const emptyPopular = collectUniqueFlaggedFoods(
  [{ orderKey: "x", sourceItemId: 1 }],
  "isPopular",
);
assert(emptyPopular.length === 0, "empty popular set");

const drinksOnly = collectUniqueFlaggedFoods(
  [
    { isRecommendedDrink: true, orderKey: "d1", sourceItemId: 20 },
    { isPopular: true, orderKey: "d2", sourceItemId: 21 },
  ],
  "isRecommendedDrink",
);
assert(drinksOnly.length === 1, "recommended drinks only");

const overlap = [
  {
    isPopular: true,
    isRecommendedDrink: true,
    orderKey: "o1",
    sourceItemId: 30,
  },
];
assert(collectUniqueFlaggedFoods(overlap, "isPopular").length === 1, "overlap popular");
assert(
  collectUniqueFlaggedFoods(overlap, "isRecommendedDrink").length === 1,
  "overlap drink",
);

const searchFoods = [
  { showInSearch: true, searchText: "سالاد رایو", orderKey: "s1" },
  { showInSearch: false, searchText: "برگر مخصوص", orderKey: "s2" },
  { searchText: "پیتزا", orderKey: "s3" },
];
assert(filterFoodsForSearchSheet(searchFoods, "").length === 1, "empty query suggestions");
assert(
  filterFoodsForSearchSheet(searchFoods, "ب").some((f) => f.orderKey === "s2"),
  "one-char finds non-suggestion item",
);
assert(
  filterFoodsForSearchSheet(searchFoods, "پیتزا").length === 1,
  "typed query finds absent ShowInSearch",
);

const variants = [
  { key: "large", isVegetarian: false, isDietary: true, enabled: true },
  { key: "junior", isVegetarian: true, isDietary: false, enabled: false },
];
const group = { orderKey: "group", variants };
const vegetarianGroup = filterFoodsByDietary([group], "vegetarian")[0];
assert(vegetarianGroup.variants.length === 1 && vegetarianGroup.variants[0].key === "junior", "dietary filter removes nonmatching variants");
assert(vegetarianGroup.isVegetarian === true && vegetarianGroup.isDietary === false, "filtered group badges describe retained sizes");
assert(vegetarianGroup.enabled === false, "filtered group availability comes from retained sizes");
assert(group.variants.length === 2, "variant filtering does not mutate source");
assert(filterFoodsByDietary([group], "all")[0] === group, "all preserves complete group");
assert(filterFoodsByDietary([{ variants: [{ isVegetarian: false }] }], "vegetarian").length === 0, "empty variant group removed");
assert(readItemFeatureFlags({ IsPopular: "true", ShowInSearch: 1 }).isPopular !== true, "nonboolean API flags rejected in mapper");
assert(resolveFoodImageLayout("NoImage", 0) === "none", "NoImage has no image");

const tree = [
  { category: { Id: 1 }, foods: [neither], subcategories: [] },
  { category: { Id: 2 }, foods: [], subcategories: [
    { category: { Id: 3 }, foods: [group], subcategories: [] },
    { category: { Id: 4 }, foods: [dietOnly], subcategories: [] },
  ] },
  { category: { Id: 5 }, foods: [], subcategories: [] },
];
for (const mode of ["dineIn", "delivery"]) {
  const source = tree.map(node => ({ ...node, foods: node.foods.map(food => ({ ...food, menuMode: mode })) }));
  const filtered = filterMenuTreeByDietary(source, "vegetarian");
  assert(filtered.length === 1 && filtered[0].category.Id === 2, `${mode}: empty roots removed, parent retained`);
  assert(filtered[0].subcategories.length === 1 && filtered[0].subcategories[0].category.Id === 3, `${mode}: empty subcategories removed`);
  assert(filtered[0].subcategories[0].foods[0].variants.length === 1, `${mode}: only matching variants retained`);
  assert(filterMenuTreeByDietary(source, "all").length === 2, `${mode}: all restores valid categories`);
}
assert(tree[1].subcategories.length === 2 && group.variants.length === 2, "tree filtering does not mutate source");
assert(filterMenuTreeByDietary([tree[0]], "dietary").length === 0, "no matches produces empty tree");
assert(filterMenuTreeByDietary([{ ...tree[0], foods: [{ isVegetarian: "true" }] }], "vegetarian").length === 0, "string flag cannot retain category");

const dineInFood = {
  orderKey: "dineIn:item:10",
  sourceItemId: 10,
  name: "پاستا",
  variant: { label: "بزرگ", description: "۳۵۰ گرم" },
};
const deliveryFood = {
  orderKey: "delivery:item:10",
  sourceItemId: 10,
  name: "پاستا بیرون‌بر",
};
const favorites = [
  { foodId: "10", orderKey: "dineIn:item:10", menuMode: "dineIn", quantity: 2, addedAt: "2026-01-01" },
  { foodId: "10", orderKey: "delivery:item:10", menuMode: "delivery", quantity: 1, addedAt: "2026-01-01" },
  { foodId: "99", orderKey: "dineIn:item:99", menuMode: "dineIn", quantity: 1, addedAt: "2026-01-01" },
];
const dineInResolved = resolveOrderSelections(favorites, [dineInFood], "dineIn");
assert(dineInResolved.length === 1 && dineInResolved[0].quantity === 2, "dine-in selections ignore delivery rows and missing foods");
assert(resolveOrderSelections(favorites, [deliveryFood], "delivery").length === 1, "delivery selections stay isolated");
assert(resolveFavoriteEntryMenuMode({ orderKey: "delivery:item:1" }) === "delivery", "orderKey prefix resolves menu mode");
assert(getCartItemLabels(dineInFood) === "بزرگ - ۳۵۰ گرم", "cart labels join variant label and description");
assert(getCartItemLabels(deliveryFood) === "", "cart labels empty without variant");

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log("\nAll menu logic assertions passed.");
