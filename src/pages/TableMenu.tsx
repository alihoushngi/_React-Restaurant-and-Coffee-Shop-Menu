import { useMemo } from "react";
import { useDineInCategory } from "../hooks/menu/useDineInCategory";
import { useDineInItems } from "../hooks/menu/useDineInItems";
import type { MenuCategory, MenuItem } from "../types/menu";
import { extractArrayData } from "../lib/menu/utils";
import PageShell from "../components/layout/PageShell";
import MenuPage from "../components/features/MenuPage";

export default function TableMenu() {
  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useDineInCategory();
  const {
    data: itemsResponse,
    isLoading: itemsLoading,
    isError: itemsError,
  } = useDineInItems();
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
      <PageShell menuMode="dineIn">
        <div className="py-20 text-center">در حال بارگذاری منو...</div>
      </PageShell>
    );
  }

  if (categoriesError || itemsError) {
    return (
      <PageShell menuMode="dineIn">
        <div className="py-20 text-center text-red-500">
          خطا در دریافت اطلاعات منو. لطفاً دوباره تلاش کنید.
        </div>
      </PageShell>
    );
  }

  return <MenuPage menuMode="dineIn" categories={categories} items={items} />;
}
