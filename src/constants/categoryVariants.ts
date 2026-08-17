export interface CategoryVariantDefinition {
  categoryId: number;
  key: string;
  label: string;
  description: string;
  pairingIgnoredTokens?: string[];
}

export interface CategoryVariantConfig {
  enabled: boolean;
  variants: CategoryVariantDefinition[];
}

export const CATEGORY_VARIANT_CONFIG: Record<number, CategoryVariantConfig> = {
  28: {
    enabled: true,
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
};

export const getCategoryVariantConfig = (categoryId: number) => {
  const config = CATEGORY_VARIANT_CONFIG[categoryId];
  return config?.enabled ? config : undefined;
};

export const isVariantCategory = (categoryId: number) =>
  Boolean(getCategoryVariantConfig(categoryId));
