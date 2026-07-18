import { HiMagnifyingGlass } from "react-icons/hi2";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchInput = ({
  value,
  onChange,
  placeholder = "جستجو در منو",
}: SearchInputProps) => {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      <HiMagnifyingGlass className="h-5 w-5 text-zinc-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400"
      />
    </label>
  );
};

export default SearchInput;
