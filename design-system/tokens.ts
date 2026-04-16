/**
 * MDEA Brand Design Tokens
 * Source of truth for all projects in this repo.
 * Copy to each project/[name] branch when creating a new project.
 */

export const brand = {
  primary:       '#6366f1',  // Indigo — identidad principal
  accent:        '#22d3ee',  // Cyan   — highlights, CTAs secundarios
  dark:          '#0f172a',  // Slate 900 — fondos oscuros / texto principal
  surface:       '#1e293b',  // Slate 800 — cards, componentes
  muted:         '#334155',  // Slate 700 — bordes, separadores
  textPrimary:   '#f1f5f9',  // Slate 100
  textSecondary: '#94a3b8',  // Slate 400
} as const;

/**
 * OKLCH equivalents for Tailwind 4 (used in globals.css @theme)
 * primary:  oklch(0.5886 0.2397 278.6)
 * accent:   oklch(0.8297 0.1378 208.5)
 */
export const brandOklch = {
  primary: 'oklch(0.5886 0.2397 278.6)',
  accent:  'oklch(0.8297 0.1378 208.5)',
} as const;

export type BrandColor = keyof typeof brand;
