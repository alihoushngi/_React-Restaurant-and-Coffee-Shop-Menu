import { useQuery } from "@tanstack/react-query";
import { getDineInItems } from "../../services/menu/dine-in-items.service";

export const useDineInItems = () => {
  return useQuery({
    queryKey: ["dine-in-items"],
    queryFn: getDineInItems,
  });
};
