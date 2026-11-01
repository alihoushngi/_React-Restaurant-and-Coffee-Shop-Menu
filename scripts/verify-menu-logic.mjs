// Run with Node 22.18+ (native TypeScript stripping): node scripts/verify-menu-logic.mjs
import {
  isTruthyApiFlag, readItemFeatureFlags, resolveCategoryDisplayType,
  resolveFoodImageLayout, matchesDietaryFilter, filterFoodsByDietary,
  filterFoodsForSearchSheet, collectUniqueFlaggedFoods,
} from "../src/lib/menu/itemFlags.ts";

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
assert(resolveFoodImageLayout("FirstItemImage", 0) === "large", "FirstItemImage index 0 large");
assert(resolveFoodImageLayout("FirstItemImage", 1) === "none", "FirstItemImage index 1 none");
assert(resolveFoodImageLayout("SmallImageLeft", 0) === "small-left", "SmallImageLeft layout");
assert(resolveFoodImageLayout("LargeImage", 0) === "large", "LargeImage always shows an image");

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

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log("\nAll menu logic assertions passed.");
