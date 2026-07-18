import type { ReactNode } from "react";
import BottomNavigation from "./BottomNavigation";

interface PageShellProps {
  children: ReactNode;
  className?: string;
  showBottomNav?: boolean;
}

const PageShell = ({
  children,
  className = "",
  showBottomNav = true,
}: PageShellProps) => {
  return (
    <main className="min-h-screen bg-[#f5f7ff] px-3 pb-28 pt-3 text-right">
      <div
        className={`mx-auto flex max-w-5xl flex-col gap-2 ${className}`.trim()}
      >
        {children}
      </div>
      {showBottomNav && <BottomNavigation />}
    </main>
  );
};

export default PageShell;
