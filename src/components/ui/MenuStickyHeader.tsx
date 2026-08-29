import Logo from "@/assets/logo/LogoNew.svg";
import { TABLE_TIME_NOTICE } from "../../constants/menu";
import type { MenuCategory } from "../../types/menu";
import type { Ref } from "react";
import CategoryTabs from "./CategoryTabs";

interface MenuStickyHeaderProps {
  categories: MenuCategory[];
  activeCategoryId: string;
  onSelect: (id: string) => void;
  stickyRef?: Ref<HTMLDivElement>;
}

const MenuStickyHeader = ({
  categories,
  activeCategoryId,
  onSelect,
  stickyRef,
}: MenuStickyHeaderProps) => {
  return (
    <div
      ref={stickyRef}
      className="sticky top-0 z-40 -mx-3 mb-6 bg-white px-3 pb-5 pt-3 backdrop-blur-md"
    >
      <div className="mb-5 flex flex-col items-center gap-5">
        <img
          src={Logo}
          alt="کافه رایو"
          width={78}
          height={56}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="h-16 w-auto object-contain"
        />
        <p className="menu-greeting max-w-md text-center text-sm font-medium leading-5 sm:text-sm">
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
