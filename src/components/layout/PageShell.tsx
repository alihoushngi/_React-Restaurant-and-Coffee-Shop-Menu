import type { ReactNode } from "react";
import BottomNavigation from "./BottomNavigation";
import type { MenuSearchControls } from "./BottomNavigation";
import type { MenuMode } from "../../types/menu";

interface PageShellProps {
  children: ReactNode;
  className?: string;
  showBottomNav?: boolean;
  menuMode?: MenuMode;
  searchControls?: MenuSearchControls;
}

const PageShell = ({
  children,
  className = "",
  showBottomNav = true,
  menuMode,
  searchControls,
}: PageShellProps) => {
  return (
    <main className="min-h-screen bg-white text-right">
      <div
        className={`mx-auto flex min-h-screen w-full max-w-[540px] flex-col gap-2 bg-white px-3 pt-3 pb-28 ${className}`.trim()}
      >
        {children}
      </div>
      {showBottomNav ? (
        <BottomNavigation menuMode={menuMode} searchControls={searchControls} />
      ) : null}
    </main>
  );
};

export default PageShell;
