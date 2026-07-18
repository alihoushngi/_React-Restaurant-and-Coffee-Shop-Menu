import type { FC } from "react";

interface BadgePopularProps {
  isPopular?: boolean;
}

const BadgePopular: FC<BadgePopularProps> = ({ isPopular = false }) => {
  if (!isPopular) return null;

  return (
    <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
      محبوب
    </span>
  );
};

export default BadgePopular;
