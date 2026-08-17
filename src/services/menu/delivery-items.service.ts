import getRequest from "../../lib/base/get/get-request";
import type { BaseResponse } from "../../lib/base/requestBase.types";
import { getAPIRoute } from "../../lib/base/routes";
import type { MenuItem } from "../../types/menu-item.type";

const { menu } = getAPIRoute();

export const getDeliveryItems = async (signal?: AbortSignal) => {
  const response = await getRequest<
    BaseResponse<MenuItem[]>,
    Record<string, never>
  >({
    url: menu.DeliveryItems.path,
    sendAuthorization: false,
    signal,
  });

  if ("error" in response) {
    throw new Error("Failed to fetch delivery items");
  }

  return response.data;
};
