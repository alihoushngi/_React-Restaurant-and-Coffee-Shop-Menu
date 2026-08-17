import getRequest from "../../lib/base/get/get-request";
import type { BaseResponse } from "../../lib/base/requestBase.types";
import { getAPIRoute } from "../../lib/base/routes";
import type { MenuItem } from "../../types/menu-item.type";

const { menu } = getAPIRoute();

export const getDineInItems = async (signal?: AbortSignal) => {
  const response = await getRequest<
    BaseResponse<MenuItem[]>,
    Record<string, never>
  >({
    url: menu.DineInItems.path,
    sendAuthorization: false,
    signal,
  });

  if ("error" in response) {
    throw new Error("Failed to fetch dine in items");
  }

  return response.data;
};
