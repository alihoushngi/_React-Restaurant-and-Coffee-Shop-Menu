import { createBrowserRouter } from "react-router-dom";
import RouteLoadingFallback from "../components/ui/RouteLoadingFallback";

export const router = createBrowserRouter([
  {
    path: "/",
    HydrateFallback: RouteLoadingFallback,
    lazy: async () => {
      const { default: Component } = await import("../pages/Home");
      return { Component };
    },
  },
  {
    path: "/deliverymenu",
    HydrateFallback: RouteLoadingFallback,
    lazy: async () => {
      const { default: Component } = await import("../pages/DeliveryMenu");
      return { Component };
    },
  },
  {
    path: "/favorites",
    HydrateFallback: RouteLoadingFallback,
    lazy: async () => {
      const { default: Component } = await import("../pages/Favorites");
      return { Component };
    },
  },
  {
    path: "/search",
    HydrateFallback: RouteLoadingFallback,
    lazy: async () => {
      const { default: Component } = await import("../pages/Search");
      return { Component };
    },
  },
  {
    path: "/tablemenu",
    HydrateFallback: RouteLoadingFallback,
    lazy: async () => {
      const { default: Component } = await import("../pages/TableMenu");
      return { Component };
    },
  },
]);
