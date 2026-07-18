import type { APIRoutes } from "./routes.type";

export const getAPIRoute = (): APIRoutes => {
  const routes: APIRoutes = {
    menu: {
      DineInCategory: { path: "DineInCategory" },
      DineInItems: { path: "DineInItems" },
      DeliveryItems: { path: "DeliveryItems" },
      DeliveryCategory: { path: "DeliveryCategory" },
    },
  };
  return routes;
};
