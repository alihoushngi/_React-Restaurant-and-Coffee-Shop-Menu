export interface CategoryVariantDefinition {
  categoryId: number;
  key: string;
  label: string;
  description: string;
  pairingIgnoredTokens?: string[];
}

interface CategoryVariantConfigBase {
  enabled: boolean;
  mode: "paired" | "collection";
}

export interface PairedCategoryVariantConfig
  extends CategoryVariantConfigBase {
  mode: "paired";
  variants: CategoryVariantDefinition[];
}

export interface CollectionCategoryVariantConfig
  extends CategoryVariantConfigBase {
  mode: "collection";
  standaloneItemTitles?: string[];
}

export type CategoryVariantConfig =
  | PairedCategoryVariantConfig
  | CollectionCategoryVariantConfig;

export const CATEGORY_VARIANT_CONFIG: Record<number, CategoryVariantConfig> = {
  28: {
    enabled: true,
    mode: "paired",
    variants: [
      {
        categoryId: 4,
        key: "large",
        label: "بزرگ",
        description: "30 سانت",
        pairingIgnoredTokens: ["پیتزا"],
      },
      {
        categoryId: 27,
        key: "junior",
        label: "جونیور",
        description: "23 سانت",
        pairingIgnoredTokens: ["پیتزا", "جونیور"],
      },
    ],
  },
  20: {
    enabled: true,
    mode: "collection",
    standaloneItemTitles: ["تعویض سری"],
  },
};

export const getCategoryVariantConfig = (categoryId: number) => {
  const config = CATEGORY_VARIANT_CONFIG[categoryId];
  return config?.enabled ? config : undefined;
};

export const isVariantCategory = (categoryId: number) =>
  Boolean(getCategoryVariantConfig(categoryId));
