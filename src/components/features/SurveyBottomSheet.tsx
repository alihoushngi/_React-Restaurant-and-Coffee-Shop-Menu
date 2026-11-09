import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { SURVEY_SHEET_TITLE } from "../../lib/survey/constants";
import {
  SHEET_BODY_CLASS,
  SHEET_OVERLAY_CLASS,
  SHEET_PANEL_CLASS,
  sheetOverlayMotion,
  sheetPanelMotion,
} from "../../lib/ui/sheetMotion";
import { useModalBehavior } from "../../hooks/useModalBehavior";
import SheetHeader from "../ui/SheetHeader";
import SurveyForm from "./SurveyForm";

interface SurveyBottomSheetProps {
  isOpen: boolean;
  sessionKey: number;
  onClose: () => void;
}

const SurveyBottomSheet = ({
  isOpen,
  sessionKey,
  onClose,
}: SurveyBottomSheetProps) => {
  const reduceMotion = useReducedMotion() === true;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const overlayMotion = sheetOverlayMotion(reduceMotion);
  const panelMotion = sheetPanelMotion(reduceMotion);
  const [nestedOpen, setNestedOpen] = useState(false);
  const [nestedSessionKey, setNestedSessionKey] = useState(sessionKey);
  const hasNestedModal = nestedSessionKey === sessionKey && nestedOpen;

  const handleNestedOpenChange = useCallback(
    (open: boolean) => {
      setNestedSessionKey(sessionKey);
      setNestedOpen(open);
    },
    [sessionKey],
  );

  const handleSheetClose = useCallback(() => {
    if (hasNestedModal) return;
    onClose();
  }, [hasNestedModal, onClose]);

  useModalBehavior({
    isOpen,
    onClose: handleSheetClose,
    dialogRef,
    initialFocusRef: closeButtonRef,
  });

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          key="survey-bottom-sheet"
          {...overlayMotion}
          className={SHEET_OVERLAY_CLASS}
          onClick={handleSheetClose}
          role="presentation"
        >
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            {...panelMotion}
            className={SHEET_PANEL_CLASS}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="survey-sheet-title"
          >
            <SheetHeader
              titleId="survey-sheet-title"
              title={SURVEY_SHEET_TITLE}
              onClose={handleSheetClose}
              closeLabel="بستن نظرسنجی"
              closeRef={closeButtonRef}
            />

            <div className={SHEET_BODY_CLASS}>
              <SurveyForm
                key={sessionKey}
                onClose={onClose}
                onNestedOpenChange={handleNestedOpenChange}
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default SurveyBottomSheet;
