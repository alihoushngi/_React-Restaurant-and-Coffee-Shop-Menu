import type { FC } from "react";
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
    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
      <span
        className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${isActive ? "bg-emerald-500" : "bg-rose-500"}`}
      />
      <span
        className={`min-w-0 leading-5 ${isActive ? "order-available-text" : "text-rose-600"}`}
      >
        {isActive ? "قابل سفارش" : "متاسفانه در حال حاضر قابل سفارش نیست"}
      </span>
      {!isActive && availability.type === "hours" && (
        <span className="text-zinc-500">
          {toPersianDigits(
            `${availability.availableFrom} تا ${availability.availableTo}`,
          )}
        </span>
      )}
    </div>
  );
};

export default AvailabilityIndicator;
