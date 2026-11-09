import type { FC } from "react";
import clsx from "clsx";
import type { MenuAvailability } from "../../types/menu";
import { isAvailabilityActive, toPersianDigits } from "../../lib/menu/utils";

interface AvailabilityIndicatorProps {
  enabled: boolean;
  availability: MenuAvailability;
}

const AvailabilityIndicator: FC<AvailabilityIndicatorProps> = ({
  enabled,
  availability,
}) => {
  const isActive = enabled && isAvailabilityActive(availability);

  return (
    <div
      className={clsx(
        "flex min-w-0 items-center gap-1 text-[10px] whitespace-nowrap text-[#8a8a8a] sm:gap-1.5 sm:text-[11px]",
        !isActive && "unavailable",
      )}
    >
      <span
        className={clsx(
          "inline-flex h-[9px] w-[9px] shrink-0 rounded-full",
          isActive ? "bg-[#10b981]" : "bg-[#a1a1aa]",
        )}
        aria-hidden="true"
      />
      <span className="min-w-0 leading-5">
        {isActive ? "قابل سفارش" : "ناموجود"}
        {!isActive && availability.type === "hours" ? (
          <span className="mt-0.5 block text-[11px] text-[#837660] whitespace-normal">
            {toPersianDigits(
              `${availability.availableFrom} تا ${availability.availableTo}`,
            )}
          </span>
        ) : null}
      </span>
    </div>
  );
};

export default AvailabilityIndicator;
