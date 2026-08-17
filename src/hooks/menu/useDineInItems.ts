import { useQuery } from "@tanstack/react-query";
import { getDineInItems } from "../../services/menu/dine-in-items.service";

export const useDineInItems = (enabled = true) => {
  return useQuery({
    queryKey: ["dine-in-items"],
    queryFn: ({ signal }) => getDineInItems(signal),
    enabled,
  });
};
