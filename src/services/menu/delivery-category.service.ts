import getRequest from "../../lib/base/get/get-request";
import type { BaseResponse } from "../../lib/base/requestBase.types";
import { getAPIRoute } from "../../lib/base/routes";
import type { MenuCategory } from "../../types/menu-category.type";

const { menu } = getAPIRoute();

export const getDeliveryCategory = async () => {
  const response = await getRequest<
    BaseResponse<MenuCategory[]>,
    Record<string, never>
  >({
    url: menu.DeliveryCategory.path,
    sendAuthorization: false,
  });

  if ("error" in response) {
    throw new Error("Failed to fetch delivery category");
  }

  return response.data;
};
