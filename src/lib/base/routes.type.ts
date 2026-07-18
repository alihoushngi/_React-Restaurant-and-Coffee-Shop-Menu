/* eslint-disable no-unused-vars */
// Interface for a route with a path and a getter function
interface Route {
  path: string;
  get?: (slug: string) => string;
}

// Interface for a collection of routes
interface MenuRoutes {
  DineInCategory: Route;
  DineInItems: Route;
  DeliveryCategory: Route;
  DeliveryItems: Route;
}

// Main interface for the full route object
export interface APIRoutes {
  menu: MenuRoutes;
}
