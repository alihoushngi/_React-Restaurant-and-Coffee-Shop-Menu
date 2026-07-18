import { useQuery } from "@tanstack/react-query";
import { getDeliveryItems } from "../../services/menu/delivery-items.service";

export const useDeliveryItems = () => {
  return useQuery({
    queryKey: ["delivery-items"],
    queryFn: getDeliveryItems,
  });
};
