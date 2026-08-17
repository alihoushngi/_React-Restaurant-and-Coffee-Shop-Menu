import { useQuery } from "@tanstack/react-query";
import { getDineInCategory } from "../../services/menu/dine-in-category.service";

export const useDineInCategory = (enabled = true) => {
  return useQuery({
    queryKey: ["dine-in-category"],
    queryFn: ({ signal }) => getDineInCategory(signal),
    enabled,
  });
};
