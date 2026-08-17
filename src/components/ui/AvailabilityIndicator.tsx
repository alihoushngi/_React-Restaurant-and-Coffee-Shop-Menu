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
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`inline-flex h-2.5 w-2.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-rose-500"}`}
      />
      <span className={isActive ? "text-emerald-600" : "text-rose-600"}>
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
