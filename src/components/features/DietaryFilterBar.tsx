import clsx from "clsx";
import type { DietaryFilter } from "../../types/menu";

interface DietaryFilterBarProps {
  value: DietaryFilter;
  onChange: (value: DietaryFilter) => void;
}

const OPTIONS: { value: DietaryFilter; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "vegetarian", label: "گیاهی" },
  { value: "dietary", label: "رژیمی" },
];

const DietaryFilterBar = ({ value, onChange }: DietaryFilterBarProps) => {
  return (
    <div
      className="mb-4 flex flex-wrap items-center justify-start gap-2"
      role="group"
      aria-label="فیلتر نوع غذا"
    >
      {OPTIONS.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={clsx(
              "min-h-11 rounded-full border px-4 py-1.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a394a]",
              isActive
                ? "border-[#6d1e39] bg-[#6d1e39] text-white"
                : "border-zinc-200 bg-white text-zinc-700",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default DietaryFilterBar;
