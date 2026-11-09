/**
 * Optional note under a subcategory pill heading.
 * Decorative / instructional only — never derived from dietary product flags.
 * Keys must be valid live category Ids from DineInCategory / DeliveryCategory.
 *
 * Reference pair (not active until API exposes the Id):
 *   قهوه‌های دمی → «روش دم‌آوری دلخواهتان را انتخاب کنید.»
 */
export const SUBCATEGORY_HEADING_NOTES: Readonly<Record<number, string>> = {
  // Empty on 2026-11-09: live trees have no «قهوه‌های دمی» subcategory Id.
};

export const getSubcategoryHeadingNote = (
  categoryId: number,
): string | undefined => SUBCATEGORY_HEADING_NOTES[categoryId];
