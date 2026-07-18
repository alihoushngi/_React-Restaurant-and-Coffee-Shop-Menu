import { useQuery } from "@tanstack/react-query";
import { getDeliveryCategory } from "../../services/menu/delivery-category.service";

export const useDeliveryCategory = () => {
  return useQuery({
    queryKey: ["delivery-category"],
    queryFn: getDeliveryCategory,
  });
};
