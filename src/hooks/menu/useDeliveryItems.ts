import { useQuery } from "@tanstack/react-query";
import { getDeliveryItems } from "../../services/menu/delivery-items.service";

export const useDeliveryItems = (enabled = true) => {
  return useQuery({
    queryKey: ["delivery-items"],
    queryFn: ({ signal }) => getDeliveryItems(signal),
    enabled,
  });
};
