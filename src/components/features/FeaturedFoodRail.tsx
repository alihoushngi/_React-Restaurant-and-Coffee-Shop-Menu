import type { Food } from "../../types/menu";
import { formatMenuPrice } from "../../lib/menu/utils";
import ProductImage from "../ui/ProductImage";

interface FeaturedFoodRailProps {
  title: string;
  foods: Food[];
  onOpen: (food: Food) => void;
  showTopDivider?: boolean;
  drinkPreview?: boolean;
}

const FeaturedFoodRail = ({
  title,
  foods,
  onOpen,
  showTopDivider = false,
  drinkPreview = false,
}: FeaturedFoodRailProps) => {
  if (foods.length === 0) return null;

  return (
    <section
      className={showTopDivider ? "mt-[17px] border-t border-[#ead8dd] pt-[13px]" : undefined}
      aria-label={title}
    >
      <h3 className={`mb-3 text-right font-bold text-[#6d1e39] ${drinkPreview ? "text-sm" : "text-base"}`}>
        {title}
      </h3>
      <div className={drinkPreview ? "grid grid-cols-3 items-start gap-2" : "flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"}>
        {(drinkPreview ? foods.slice(0, 3) : foods).map((food) => (
          <button
            key={food.orderKey}
            type="button"
            onClick={() => onOpen(food)}
            className={`flex ${drinkPreview ? "w-full rounded-[15px] border-[#eee4e7]" : "w-[calc((100%_-_1rem)/3)] rounded-[14px] border-[#ebe5e8]"} min-w-0 shrink-0 flex-col overflow-hidden border bg-white text-right transition hover:border-[#c58d96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a394a]`}
            aria-label={`مشاهده جزئیات ${food.name}`}
          >
            <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-[#f5f3f2]">
              <ProductImage
                src={food.image}
                hasRealImage={food.hasRealImage}
                alt={food.name}
                style={{ objectFit: drinkPreview ? "cover" : "contain" }}
                className="absolute inset-0 h-full w-full"
                logoClassName="p-6"
                width={240}
                height={240}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className={drinkPreview ? "w-full p-[6px]" : "min-h-16 w-full space-y-1 p-2"}>
              <p className={drinkPreview ? "text-[13px] leading-[1.8] font-bold text-zinc-900" : "line-clamp-2 text-xs leading-5 font-bold text-zinc-900"}>
                {food.name}
              </p>
              <p className={`text-[11px] leading-4 text-[#78876f] ${drinkPreview ? "mt-[6px] font-bold" : "font-medium"}`}>
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
