import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Food, MenuMode } from "../../types/menu";
import { getOrderSelection, isFoodAvailable } from "../../lib/menu/utils";
import {
  SHEET_BODY_CLASS,
  SHEET_OVERLAY_CLASS,
  SHEET_PANEL_CLASS,
  sheetOverlayMotion,
  sheetPanelMotion,
} from "../../lib/ui/sheetMotion";
import { useModalBehavior } from "../../hooks/useModalBehavior";
import { useResolvedOrderSelections } from "../../hooks/useResolvedOrderSelections";
import SheetHeader from "../ui/SheetHeader";
import OrderSelectionContent from "./OrderSelectionContent";
import OrderClearConfirmationSheet from "./OrderClearConfirmationSheet";
import FoodModal from "./FoodModal";

interface OrderSelectionSheetProps {
  isOpen: boolean;
  menuMode: MenuMode;
  onClose: () => void;
}

const OrderSelectionSheet = ({
  isOpen,
  menuMode,
  onClose,
}: OrderSelectionSheetProps) => {
  const reduceMotion = useReducedMotion() === true;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const overlayMotion = sheetOverlayMotion(reduceMotion);
  const panelMotion = sheetPanelMotion(reduceMotion);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isClearConfirmationOpen, setIsClearConfirmationOpen] = useState(false);
  const {
    selections,
    categories,
    recommendedDrinks,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    clearOrderList,
  } = useResolvedOrderSelections(menuMode);

  const resetNestedState = useCallback(() => {
    setSelectedFood(null);
    setIsClearConfirmationOpen(false);
  }, []);

  const handleCloseSheet = useCallback(() => {
    resetNestedState();
    onClose();
  }, [onClose, resetNestedState]);

  const handleSheetClose = useCallback(() => {
    if (selectedFood !== null || isClearConfirmationOpen) return;
    handleCloseSheet();
  }, [handleCloseSheet, isClearConfirmationOpen, selectedFood]);

  useModalBehavior({
    isOpen,
    onClose: handleSheetClose,
    dialogRef,
    initialFocusRef: closeButtonRef,
  });

  const handleIncrement = useCallback(
    (food: Food) => {
      if (
        !isFoodAvailable(food.enabled, food.availability ?? { type: "always" })
      ) {
        return;
      }
      const selection = getOrderSelection(food);
      if (selection) addToFavorites(selection);
    },
    [addToFavorites],
  );

  const handleDecrement = useCallback(
    (food: Food) => removeFromFavorites(food.orderKey),
    [removeFromFavorites],
  );

  const handleRemoveLine = useCallback(
    (food: Food, quantity: number) =>
      removeFromFavorites(food.orderKey, quantity),
    [removeFromFavorites],
  );

  const handleConfirmClear = useCallback(() => {
    clearOrderList(menuMode);
    setSelectedFood(null);
    setIsClearConfirmationOpen(false);
  }, [clearOrderList, menuMode]);

  const selectedQuantity = selectedFood
    ? (selections.find(
        (entry) => entry.food.orderKey === selectedFood.orderKey,
      )?.quantity ?? 0)
    : 0;

  const overlays =
    typeof document === "undefined"
      ? null
      : createPortal(
          <>
            <FoodModal
              food={selectedFood}
              suggestDrink={
                categories.find(
                  (category) =>
                    category.Id === Number(selectedFood?.categoryId),
                )?.SuggestDrink === true
              }
              recommendedDrinks={recommendedDrinks}
              onAddRecommendedDrink={handleIncrement}
              quantity={selectedQuantity}
              onClose={() => setSelectedFood(null)}
              onAddToOrder={() => {
                if (!selectedFood) return;
                handleIncrement(selectedFood);
              }}
              onRemoveFromOrder={() => {
                if (selectedFood) handleDecrement(selectedFood);
              }}
            />
            <AnimatePresence>
              {isClearConfirmationOpen && selections.length > 0 ? (
                <OrderClearConfirmationSheet
                  onCancel={() => setIsClearConfirmationOpen(false)}
                  onConfirm={handleConfirmClear}
                />
              ) : null}
            </AnimatePresence>
          </>,
          document.body,
        );

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="order-selection-sheet"
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
              aria-labelledby="order-selection-sheet-title"
            >
              <SheetHeader
                titleId="order-selection-sheet-title"
                title="لیست انتخاب‌های شما"
                onClose={handleCloseSheet}
                closeLabel="بستن لیست انتخاب‌ها"
                closeRef={closeButtonRef}
              />

              <div className={SHEET_BODY_CLASS}>
                <OrderSelectionContent
                  selections={selections}
                  isLoading={isLoading}
                  onClose={handleCloseSheet}
                  onOpenFood={setSelectedFood}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  onRemoveLine={handleRemoveLine}
                  onRequestClear={
                    selections.length > 0
                      ? () => setIsClearConfirmationOpen(true)
                      : undefined
                  }
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {isOpen ? overlays : null}
    </>
  );
};

export default OrderSelectionSheet;
