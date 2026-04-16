// design-system/tokens.ts
// Source of truth for the MDEA brand palette.
// CSS variables live in tokens.css; this file mirrors them for TS consumption.

export const brand = {
  // Grayscale (zinc)
  background:   { light: "#fafafa", dark: "#09090b" },
  surface:      { light: "#ffffff", dark: "#18181b" },
  border:       { light: "#e4e4e7", dark: "#27272a" },
  foreground:   { light: "#09090b", dark: "#fafafa" },
  muted:        { light: "#71717a", dark: "#a1a1aa" },

  // Single accent (blue-700 on light, blue-500 on dark for WCAG AA)
  accent:       { light: "#1D4ED8", dark: "#3B82F6" },
} as const;

export const radius = {
  base: "8px", // uniform across all components
} as const;

export type BrandToken = keyof typeof brand;
