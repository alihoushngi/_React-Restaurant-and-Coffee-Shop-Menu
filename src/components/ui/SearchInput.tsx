import { HiMagnifyingGlass, HiXMark } from "react-icons/hi2";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  showClear?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  compact?: boolean;
  showIcon?: boolean;
}

const SearchInput = ({
  value,
  onChange,
  onClear,
  showClear = false,
  autoFocus = false,
  placeholder = "جستجو در منو...",
  compact = false,
  showIcon = true,
}: SearchInputProps) => {
  return (
    <div
      className={`flex w-full min-w-0 items-center rounded-2xl border border-[#d9d0d5] bg-[#fcf9fa] ${
        compact ? "gap-1.5 px-2 py-2" : "gap-3 px-4 py-3"
      }`}
    >
      {showIcon ? <HiMagnifyingGlass className="h-5 w-5 shrink-0 text-zinc-400" /> : null}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label={placeholder}
        dir="rtl"
        className="min-w-0 flex-1 bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400"
      />
      {showClear ? (
        <button
          type="button"
          onClick={onClear}
          className={`flex shrink-0 items-center gap-1 rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 ${
            compact
              ? "h-8 w-8 justify-center p-0 min-[430px]:w-auto min-[430px]:px-2"
              : "px-2 py-1"
          }`}
          aria-label="پاک کردن جستجو"
        >
          <HiXMark className="h-4 w-4" />
          <span
            className={
              compact
                ? "sr-only min-[430px]:not-sr-only"
                : "hidden min-[360px]:inline"
            }
          >
            پاک کردن جستجو
          </span>
        </button>
      ) : null}
    </div>
  );
};

export default SearchInput;
