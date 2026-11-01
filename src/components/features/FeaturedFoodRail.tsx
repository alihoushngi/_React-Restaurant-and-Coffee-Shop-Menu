import type { Food } from "../../types/menu";
import { formatMenuPrice } from "../../lib/menu/utils";
import ProductImage from "../ui/ProductImage";

interface FeaturedFoodRailProps {
  title: string;
  foods: Food[];
  onOpen: (food: Food) => void;
  showTopDivider?: boolean;
}

const FeaturedFoodRail = ({
  title,
  foods,
  onOpen,
  showTopDivider = false,
}: FeaturedFoodRailProps) => {
  if (foods.length === 0) return null;

  return (
    <section
      className={showTopDivider ? "mb-4 border-t border-[#e8dfe3] pt-4 last:mb-0" : "mb-4 last:mb-0"}
      aria-label={title}
    >
      <h3 className="mb-3 text-right text-base font-bold text-[#6d1e39]">
        {title}
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {foods.map((food) => (
          <button
            key={food.orderKey}
            type="button"
            onClick={() => onOpen(food)}
            className="flex w-[calc((100%_-_1rem)/3)] min-w-0 shrink-0 flex-col overflow-hidden rounded-[14px] border border-[#ebe5e8] bg-white text-right transition hover:border-[#c58d96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a394a]"
            aria-label={`مشاهده جزئیات ${food.name}`}
          >
            <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-[#f5f3f2]">
              <ProductImage
                src={food.image}
                hasRealImage={food.hasRealImage}
                alt={food.name}
                style={{ objectFit: "contain" }}
                className="absolute inset-0 h-full w-full"
                logoClassName="p-6"
                width={240}
                height={240}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="min-h-16 w-full space-y-1 p-2">
              <p className="line-clamp-2 text-xs leading-5 font-bold text-zinc-900">
                {food.name}
              </p>
              <p className="text-[11px] leading-4 font-medium text-[#78876f]">
                {formatMenuPrice(food.price)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default FeaturedFoodRail;
