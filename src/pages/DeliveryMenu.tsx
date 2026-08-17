import { useMemo } from "react";
import { useDeliveryCategory } from "../hooks/menu/useDeliveryCategory";
import { useDeliveryItems } from "../hooks/menu/useDeliveryItems";
import type { MenuCategory, MenuItem } from "../types/menu";
import { extractArrayData } from "../lib/menu/utils";
import PageShell from "../components/layout/PageShell";
import MenuPage from "../components/features/MenuPage";

export default function DeliveryMenu() {
  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useDeliveryCategory();
  const {
    data: itemsResponse,
    isLoading: itemsLoading,
    isError: itemsError,
  } = useDeliveryItems();
  const categories = useMemo(
    () => extractArrayData<MenuCategory>(categoriesResponse),
    [categoriesResponse],
  );
  const items = useMemo(
    () => extractArrayData<MenuItem>(itemsResponse),
    [itemsResponse],
  );

  if (categoriesLoading || itemsLoading) {
    return (
      <PageShell menuMode="delivery">
        <div className="py-20 text-center">در حال بارگذاری منو...</div>
      </PageShell>
    );
  }

  if (categoriesError || itemsError) {
    return (
      <PageShell menuMode="delivery">
        <div className="py-20 text-center text-red-500">
          خطا در دریافت اطلاعات منو. لطفاً دوباره تلاش کنید.
        </div>
      </PageShell>
    );
  }

  return <MenuPage menuMode="delivery" categories={categories} items={items} />;
}
