import type { MouseEvent } from "react";
import { HiPlus } from "react-icons/hi2";

interface FavoriteButtonProps {
  active: boolean;
  onToggle: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const FavoriteButton = ({
  active,
  onToggle,
  disabled = false,
}: FavoriteButtonProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold shadow-sm transition ${
        active
          ? "bg-[#496a65] text-white"
          : "bg-white/90 text-zinc-700 hover:bg-[#f6f0e8]"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      aria-label={active ? "حذف از لیست سفارش" : "افزودن به لیست سفارش"}
    >
      <HiPlus className="h-4 w-4" />
      <span>{active ? "حذف از لیست" : "افزودن"}</span>
    </button>
  );
};

export default FavoriteButton;
