import clsx from "clsx";

interface SubcategoryHeadingProps {
  title: string;
  note?: string;
  isFirst?: boolean;
}

/**
 * Reference `.subheading` pill with hairline dividers on both sides.
 * Title comes from the API category; note is optional decorative copy only.
 */
export default function SubcategoryHeading({
  title,
  note,
  isFirst = false,
}: SubcategoryHeadingProps) {
  return (
    <div className={clsx(isFirst ? "mt-1.5" : "mt-[26px]", note ? "mb-0" : "mb-[15px]")}>
      <div className="flex scroll-mt-[95px] items-center justify-center gap-3 text-sm font-bold text-[#7a394a]">
        <span aria-hidden="true" className="h-px min-w-0 flex-1 bg-[#dcc5ca]" />
        <span className="max-w-[min(100%,18rem)] shrink-0 rounded-[30px] bg-[#faf5f6] px-[14px] py-[5px] text-center leading-snug break-words whitespace-normal">
          {title}
        </span>
        <span aria-hidden="true" className="h-px min-w-0 flex-1 bg-[#dcc5ca]" />
      </div>
      {note ? (
        <p className="-mt-2 mb-3.5 text-center text-[11px] text-[#888888]">
          {note}
        </p>
      ) : null}
    </div>
  );
}
