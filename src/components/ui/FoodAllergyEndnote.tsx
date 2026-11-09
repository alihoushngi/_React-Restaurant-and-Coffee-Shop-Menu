import { FOOD_ALLERGY_ENDNOTE } from "../../constants/menu";

/** Static food-allergy notice matching reference `.endnote` (MENU-014). */
const FoodAllergyEndnote = () => (
  <footer className="px-3 pt-2.5 pb-10 text-center text-[12px] leading-[2] text-[#71717a]">
    {FOOD_ALLERGY_ENDNOTE}
  </footer>
);

export default FoodAllergyEndnote;
