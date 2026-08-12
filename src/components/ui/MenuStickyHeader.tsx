import Logo from "@/assets/logo/logo.png";
import { TABLE_TIME_NOTICE } from "../../constants/menu";
import type { MenuCategory } from "../../types/menu";
import CategoryTabs from "./CategoryTabs";

interface MenuStickyHeaderProps {
  categories: MenuCategory[];
  activeCategoryId: string;
  onSelect: (id: string) => void;
}

const MenuStickyHeader = ({
  categories,
  activeCategoryId,
  onSelect,
}: MenuStickyHeaderProps) => {
  return (
    <div className="sticky top-0 z-50 -mx-3 mb-4 bg-[#f5f7ff]/95 px-3 pb-2 pt-1 backdrop-blur-md">
      <div className="mb-2 flex flex-col items-center gap-1.5">
        <img
          src={Logo}
          alt="کافه رایو"
          width={56}
          height={56}
          className="h-10 w-10 object-contain"
        />
        <p className="max-w-md text-center text-sm font-medium leading-5 text-[#5f2534] sm:text-sm">
          {TABLE_TIME_NOTICE}
        </p>
      </div>

      <CategoryTabs
        categories={categories}
        activeCategoryId={activeCategoryId}
        onSelect={onSelect}
      />
    </div>
  );
};

export default MenuStickyHeader;
