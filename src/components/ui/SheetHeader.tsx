import type { ReactNode, Ref } from "react";
import { HiXMark } from "react-icons/hi2";
import {
  SHEET_CLOSE_CLASS,
  SHEET_HANDLE_CLASS,
  SHEET_HEAD_CLASS,
  SHEET_TITLE_CLASS,
} from "../../lib/ui/sheetMotion";

interface SheetHeaderProps {
  titleId: string;
  title: ReactNode;
  onClose: () => void;
  closeLabel: string;
  closeRef?: Ref<HTMLButtonElement>;
  subtitle?: ReactNode;
  trailing?: ReactNode;
}

const SheetHeader = ({
  titleId,
  title,
  onClose,
  closeLabel,
  closeRef,
  subtitle,
  trailing,
}: SheetHeaderProps) => (
  <div className={SHEET_HEAD_CLASS}>
    <span aria-hidden="true" className={SHEET_HANDLE_CLASS} />
    <header className="mt-1 flex items-start justify-between gap-2.5">
      <div className="min-w-0 flex-1">
        <h2 id={titleId} className={SHEET_TITLE_CLASS}>
          {title}
        </h2>
        {subtitle}
      </div>
      {trailing}
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className={SHEET_CLOSE_CLASS}
        aria-label={closeLabel}
      >
        <HiXMark className="h-5 w-5" />
      </button>
    </header>
  </div>
);

export default SheetHeader;
