import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "vite";

const read = (relativePath) =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

const sheetFiles = [
  "../src/components/features/SearchBottomSheet.tsx",
  "../src/components/features/InformationSheet.tsx",
  "../src/components/features/OrderSelectionSheet.tsx",
  "../src/components/features/SurveyBottomSheet.tsx",
  "../src/components/features/FoodModal.tsx",
  "../src/components/features/VariantSelectionSheet.tsx",
  "../src/components/features/OrderClearConfirmationSheet.tsx",
  "../src/components/ui/CategoryTabs.tsx",
];

const server = await createServer({ server: { middlewareMode: true } });

try {
  const motion = await server.ssrLoadModule("/src/lib/ui/sheetMotion.ts");

  assert.equal(
    motion.SHEET_OVERLAY_CLASS.includes("bg-[#211016]/70"),
    true,
    "overlay uses reference #21101670 tint",
  );
  assert.equal(
    motion.SHEET_OVERLAY_CLASS.includes("backdrop-blur-[3px]"),
    true,
    "overlay uses 3px blur",
  );
  assert.equal(
    motion.SHEET_PANEL_CLASS.includes("rounded-t-[26px]"),
    true,
    "panel radius 26 matches reference",
  );
  assert.equal(
    motion.SHEET_PANEL_CLASS.includes("max-h-[94dvh]"),
    true,
    "panel max-height 94dvh",
  );
  assert.equal(
    motion.SHEET_PANEL_CLASS.includes("shadow-[0_-10px_60px_#0002]"),
    true,
    "panel shadow matches reference",
  );
  assert.equal(
    motion.SHEET_HANDLE_CLASS.includes("w-9") &&
      motion.SHEET_HANDLE_CLASS.includes("h-[3px]"),
    true,
    "handle is 36×3",
  );
  assert.equal(
    motion.SHEET_CLOSE_CLASS.includes("h-11") &&
      motion.SHEET_CLOSE_CLASS.includes("w-11"),
    true,
    "close control meets 44px target",
  );
  assert.equal(
    motion.SHEET_BODY_CLASS.includes("env(safe-area-inset-bottom)"),
    true,
    "body padding includes safe-area",
  );
  assert.equal(
    motion.SHEET_FOOTER_CLASS.includes("env(safe-area-inset-bottom)"),
    true,
    "footer padding includes safe-area",
  );

  const reduced = motion.sheetOverlayMotion(true);
  const animated = motion.sheetOverlayMotion(false);
  assert.equal(reduced.transition.duration, 0, "reduced motion zeros overlay");
  assert.equal(animated.initial.opacity, 0, "overlay fades in when motion ok");
  assert.equal(
    motion.sheetPanelMotion(true).transition.duration,
    0,
    "reduced motion zeros panel slide",
  );
  assert.equal(
    motion.sheetPanelMotion(false).transition.type,
    "spring",
    "panel uses shared spring",
  );
  assert.equal(
    motion.sheetPanelMotion(false).transition.stiffness,
    220,
    "shared spring stiffness 220",
  );

  for (const file of sheetFiles) {
    const source = read(file);
    assert.ok(
      source.includes("sheetOverlayMotion") ||
        source.includes("SHEET_OVERLAY"),
      `${file} uses shared overlay tokens`,
    );
    assert.ok(
      source.includes("sheetPanelMotion") || source.includes("SHEET_PANEL"),
      `${file} uses shared panel tokens`,
    );
    assert.ok(
      source.includes("SheetHeader") ||
        source.includes("SHEET_HANDLE_CLASS") ||
        source.includes("SHEET_HEAD_CLASS"),
      `${file} uses shared header/handle chrome`,
    );
    assert.equal(
      /bg-zinc-950\/(?:55|60)/.test(source),
      false,
      `${file} no longer uses divergent zinc overlay`,
    );
    assert.equal(
      /rounded-t-\[30px\]/.test(source),
      false,
      `${file} no longer uses 30px top radius`,
    );
    assert.equal(
      /stiffness:\s*240/.test(source),
      false,
      `${file} no longer uses divergent spring`,
    );
  }

  const menuPage = read("../src/components/features/MenuPage.tsx");
  assert.ok(
    /if\s*\(\s*variantFood\s*\)\s*return/.test(menuPage),
    "FoodModal Escape/backdrop guarded while variant sheet is open",
  );
  assert.ok(
    menuPage.includes("setVariantFood(null)") &&
      menuPage.includes("setIsSearchOpen(true)"),
    "opening search clears stacked product sheets",
  );

  const header = read("../src/components/ui/SheetHeader.tsx");
  assert.ok(header.includes("SHEET_HANDLE_CLASS"), "SheetHeader renders handle");
  assert.ok(header.includes("SHEET_CLOSE_CLASS"), "SheetHeader renders 44px close");

  console.log(`verify-menu-015: ${12 + sheetFiles.length * 6 + 4} assertions passed`);
} finally {
  await server.close();
}
