import Logo from "@/assets/logo/LogoNew.svg";
import { TABLE_TIME_NOTICE, WELCOME_TITLE } from "../../constants/menu";
import type { MenuCategory } from "../../types/menu";
import { useEffect, useRef, type Ref } from "react";
import CategoryTabs from "./CategoryTabs";

interface MenuStickyHeaderProps {
  categories: Pick<MenuCategory, "Id" | "Title" | "ParentId">[];
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
  const introRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const intro = introRef.current;
    if (!intro) return;
    const updateOpacity = () => {
      intro.style.opacity = String(Math.max(0, 1 - window.scrollY / intro.offsetHeight));
    };
    updateOpacity();
    window.addEventListener("scroll", updateOpacity, { passive: true });
    return () => window.removeEventListener("scroll", updateOpacity);
  }, []);

  return (
    <>
      <div ref={introRef} className="mb-3 flex flex-col items-center gap-3 pt-3">
        <img
          src={Logo}
          alt="Rayo"
          width={120}
          height={72}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="h-[4.5rem] w-auto object-contain"
        />
        <h1 className="text-center text-base font-bold text-[#7a394a]">
          {WELCOME_TITLE}
        </h1>
        <p className="menu-greeting max-w-xl text-center text-sm font-medium leading-6 sm:text-sm">
          {TABLE_TIME_NOTICE}
        </p>
      </div>

      <div
        ref={stickyRef}
        className="sticky top-[5px] z-40 -mx-3 bg-white px-3 pb-2"
      >
        <CategoryTabs
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelect={onSelect}
        />
      </div>
    </>
  );
};

export default MenuStickyHeader;
