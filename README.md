# Rayo Cafe Menu

Modern mobile-first Persian digital menu for cafes.

---

# Overview

Rayo is a frontend-only digital menu system designed for cafes and restaurants.

Users can browse categories, view food details, save favorites, and check food availability.

No backend is used.

All data is stored locally using JSON files.

---

# Features

✅ Mobile-first design
✅ Persian RTL layout
✅ Light theme UI
✅ SnappFood inspired design
✅ Food categories
✅ Category filtering
✅ Food detail modal
✅ Favorite foods
✅ localStorage persistence
✅ Search system
✅ Time-based availability
✅ Category availability rules
✅ Food availability rules
✅ Smooth animations
✅ Responsive design

---

# Tech Stack

- React / Next.js
- TypeScript
- TailwindCSS
- Framer Motion
- LocalStorage
- Static JSON architecture

---

# Folder Structure

src/

components/

CategoryTabs.tsx

FoodCard.tsx

FoodModal.tsx

FavoriteButton.tsx

AvailabilityBadge.tsx

Header.tsx

BottomNavigation.tsx

hooks/

useFavorites.ts

useAvailability.ts

useMenuFilter.ts

data/

categories.json

foods.json

food-details.json

utils/

time-utils.ts

storage.ts

types/

menu.types.ts

---

# Data Structure

## categories.json

[
{
"id": "coffee",
"title": "قهوه",
"icon": "coffee",
"alwaysAvailable": true
}
]

## foods.json

[
{
"id": "espresso",
"categoryId": "coffee",
"name": "اسپرسو",
"price": 90000,
"isPopular": true
}
]

## food-details.json

[
{
"foodId": "espresso",
"description": "...",
"ingredients": ["Coffee Beans"],
"preparationTime": 5
}
]

---

# Main Screens

- Home Menu
- Food Category List
- Food Cards
- Food Details Modal
- Favorite Foods Page

---

# UX Principles

- Fast interactions
- Minimal clicks
- Easy navigation
- Smooth scrolling
- Sticky category navigation
- Large touch areas
- Optimized for mobile devices

---

# Design Inspiration

Inspired by SnappFood menu experience.

Design principles:

- clean cards
- large images
- rounded corners
- soft shadows
- white background
- Persian typography

---

# Development Rules

- No hardcoded data inside components
- Strong TypeScript everywhere
- Reusable components only
- Avoid duplicated logic
- Clean architecture
- Scalable structure

---

# Future Expansion

Possible future features:

- Online ordering
- Payment system
- Backend API
- Admin dashboard
- QR code menu access
- Multi-language support
