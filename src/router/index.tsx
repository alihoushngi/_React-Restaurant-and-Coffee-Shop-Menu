import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home";
import DeliveryMenu from "../pages/DeliveryMenu";
import FavoritesPage from "../pages/Favorites";
import SearchPage from "../pages/Search";
import TableMenu from "../pages/TableMenu";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/deliverymenu",
    element: <DeliveryMenu />,
  },
  {
    path: "/favorites",
    element: <FavoritesPage />,
  },
  {
    path: "/search",
    element: <SearchPage />,
  },
  {
    path: "/tablemenu",
    element: <TableMenu />,
  },
]);
