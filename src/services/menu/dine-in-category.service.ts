import getRequest from "../../lib/base/get/get-request";
import type { BaseResponse } from "../../lib/base/requestBase.types";
import { getAPIRoute } from "../../lib/base/routes";
import type { MenuCategory } from "../../types/menu-category.type";

const { menu } = getAPIRoute();

export const getDineInCategory = async () => {
  const response = await getRequest<
    BaseResponse<MenuCategory[]>,
    Record<string, never>
  >({
    url: menu.DineInCategory.path,
    sendAuthorization: false,
  });

  if ("error" in response) {
    throw new Error("Failed to fetch dine in category");
  }

  return response.data;
};
