import { useQuery } from "@tanstack/react-query";
import { getDeliveryCategory } from "../../services/menu/delivery-category.service";

export const useDeliveryCategory = (enabled = true) => {
  return useQuery({
    queryKey: ["delivery-category"],
    queryFn: ({ signal }) => getDeliveryCategory(signal),
    enabled,
  });
};
