# Rayo Cafe Menu

Persian RTL cafe and restaurant menu built with React 19, TypeScript, Vite 8, and Tailwind CSS 4. Current version: **3.3.1**.

## Getting started

Use Node.js 22.18+ (also required for the menu logic check).

```sh
npm ci
npm run dev
```

Development requests to `/api/data` are proxied to `https://rayocafe.ir` through Vite. Menu data comes from the backend API, not local JSON fixtures.

## Build and deployment

Set the production API base before building, for example in a local `.env` file:

```dotenv
VITE_API_BASE=https://rayocafe.ir/api/data
```

```sh
npm run build
npm run preview
```

The production files are generated in `dist/`. Configure the host to serve `index.html` for client-side routes. The production API must allow requests from the deployed frontend origin when hosted on a different origin. Vite's development proxy does not run in production.

## Features

- Separate dine-in and delivery menus, category navigation, and availability rules.
- Persian RTL layout, responsive cards, square large images, and sticky menu navigation positioned 5px from the top after scrolling.
- Two-person, dietary, and vegetarian badges; dietary and vegetarian filters.
- Weekly popular items and recommended drinks, shown only when matching API items exist.
- Search bottom sheet with suggested items, search across all items, no result prices, and no automatic keyboard opening.
- Item details, variants, and local favorites/order quantities separated by menu mode.
- Recommended drinks inside item details, controlled by the item's category.

Favorites and quantities persist locally. They do not submit an order or process payment. The survey navigation control is currently disabled because no destination has been configured.

## API contract

Menu endpoints relative to the API base:

- `DineInCategory`
- `DineInItems`
- `DeliveryCategory`
- `DeliveryItems`

Feature flags activate only for the boolean value `true`; missing, null, and string values do not activate them.

| Field | Entity | Behavior |
| --- | --- | --- |
| `IsForTwo` | Item | Show the two-person badge. |
| `IsDietary` | Item | Show the dietary badge and include the item in the dietary filter. |
| `IsVegetarian` | Item | Show the vegetarian badge and include the item in the vegetarian filter. |
| `IsPopular` | Item | Include the item in the weekly popular section. |
| `IsRecommendedDrink` | Item | Include the item among recommended drinks. |
| `ShowInSearch` | Item | Suggest the item when the search query is empty. Typed queries search all items. |
| `SuggestDrink` | Category | Allow recommended drinks in details of items belonging to this category. |
| `DisplayType` | Category | Select the card layout described below. |

Category `DisplayType` values:

- `LargeImage`: large square image (also the fallback for missing or unknown values).
- `SmallImageLeft`: small image on the physical left.
- `NoImage`: no image.
- `FirstItemImage`: large image for the first item; remaining items have no image.

The detail recommendation section requires both `SuggestDrink === true` on the selected item's category and items with `IsRecommendedDrink === true` in the same menu mode. The selected item itself is excluded. Empty sections are omitted entirely. Per-food drink ID associations are not implemented.

## Project layout

```text
src/
  components/features/  Menu cards, filters, search, featured rails, item details
  components/layout/    Shared navigation
  components/ui/        Shared UI and category tabs
  hooks/                API queries, favorites, availability, modal behavior
  lib/menu/             Menu mapping, flag handling, layout helpers
  pages/                Application screens
  services/menu/        Menu API services
  types/                API and frontend menu types
scripts/
  verify-menu-logic.mjs  Runnable menu logic assertions
```

Local customer briefs, screenshots, and browser QA evidence live in `task/`, which is excluded from Git.

## Validation

```sh
npm run lint
npm run build
node scripts/verify-menu-logic.mjs
```

The logic check covers strict flags, badges, display types, filters, variants, featured-item deduplication, and search suggestions. It does not replace browser or live API testing.

## 3.3.1

Documents the API-backed menu, refreshed card/header/navigation design, search and dietary filters, conditional featured sections, and category-controlled detail drink recommendations. Synchronizes the package and lockfile versions.
