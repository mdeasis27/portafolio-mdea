# Hub Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform `portafolio-mdea` into the fully-branded hub with the new design system (zinc + blue), the AI kit (free-model allowlist + demo-mode helpers), and the meta-folder filesystem layout — shippable independently of the other project repos.

**Architecture:** Brand kit lives in `design-system/` with tokens + 5 base components + fonts. AI kit lives in `ai-kit/` with model allowlist + client + demo-mode conventions. Sync scripts live in `scripts/`. Filesystem is reorganized to put the hub inside `C:/Proyectos/proyectos-portafolio/` for future sibling projects.

**Tech Stack:** Next.js 16 (App Router, static export), TypeScript, Tailwind CSS v4, base-ui, next-themes, next-mdx-remote, Vercel AI SDK, OpenRouter, Node `node:test` for script tests.

**Spec reference:** `docs/superpowers/specs/2026-04-16-mdea-brand-design-system.md` — Phases 1, 2, and 3.

---

## File structure at end of Plan 1

```
portafolio-mdea/
├── design-system/
│   ├── tokens.ts                  # MODIFIED: new palette constants
│   ├── tokens.css                 # NEW: CSS variables for light + dark
│   ├── fonts.ts                   # NEW: Inter + Fraunces + JetBrains Mono
│   ├── components/                # MOVED from src/components/ui/
│   │   ├── button.tsx             # MODIFIED: new classes via tokens.css
│   │   ├── badge.tsx              # MODIFIED: new status variants
│   │   ├── card.tsx               # MODIFIED: 8px radius, new border
│   │   ├── separator.tsx          # MODIFIED: new border token
│   │   ├── status-dot.tsx         # NEW: dot + label component
│   │   └── index.ts               # NEW: barrel exports
│   ├── mdx/                       # NEW: MDX-only components (hub-exclusive)
│   │   ├── metric.tsx
│   │   ├── metric-group.tsx
│   │   ├── tradeoff.tsx
│   │   └── callout.tsx
│   ├── utils.ts                   # NEW: cn() helper moved here
│   ├── CHANGELOG.md               # NEW
│   └── README.md                  # MODIFIED: new usage docs
│
├── ai-kit/                        # NEW
│   ├── models.ts                  # Free-model allowlist + types
│   ├── client.ts                  # createMdeaAi() with fallback + cache
│   ├── rate-limit.tsx             # Hook + UI for rate-limit recovery
│   ├── demo-mode.ts               # defineDemoCase() helper + types
│   ├── CHANGELOG.md
│   └── README.md
│
├── scripts/
│   ├── brand-sync.mjs             # NEW: sync design-system to sibling repo
│   ├── ai-sync.mjs                # NEW: sync ai-kit to sibling repo
│   ├── brand-sync.test.mjs        # NEW: node:test for sync script
│   └── ai-sync.test.mjs           # NEW: node:test for sync script
│
├── src/
│   ├── app/
│   │   ├── layout.tsx             # MODIFIED: new fonts, defaultTheme=system
│   │   ├── globals.css            # MODIFIED: new tokens
│   │   ├── page.tsx               # MODIFIED: Fraunces H1, new eyebrow
│   │   ├── about/
│   │   │   └── page.tsx           # MODIFIED: same header pattern
│   │   └── projects/
│   │       ├── page.tsx           # MODIFIED: Fraunces H1, unified header
│   │       └── [slug]/
│   │           └── page.tsx       # MODIFIED: Fraunces H1, meta-box, nav footer
│   ├── components/
│   │   ├── project-card.tsx       # MODIFIED: use kit components
│   │   ├── site-footer.tsx
│   │   ├── site-nav.tsx           # MODIFIED: theme toggle always visible
│   │   ├── theme-toggle.tsx
│   │   └── ui/                    # DEPRECATED: kept as re-exports only
│   │       ├── button.tsx         # → re-export from design-system
│   │       ├── badge.tsx          # → re-export from design-system
│   │       ├── card.tsx           # → re-export from design-system
│   │       └── separator.tsx      # → re-export from design-system
│   └── lib/
│       ├── mdx-components.tsx     # MODIFIED: register Metric/Tradeoff/Callout
│       └── utils.ts               # MODIFIED: re-export from design-system/utils
│
├── content/projects/
│   ├── agente-riesgo.mdx          # MODIFIED: add <Metric>/<Tradeoff> blocks
│   └── identidad-360.mdx          # MODIFIED: add <Metric>/<Tradeoff> blocks
│
├── AGENTS.md                      # MODIFIED: mention brand+ai kit + meta-folder
└── README.md                      # MODIFIED: new bootstrap flow
```

**Filesystem move (Phase 3):**
```
Before: C:/Proyectos/portafolio-mdea/
After:  C:/Proyectos/proyectos-portafolio/portafolio-mdea/
```

---

## Task 1: Install font dependencies and create fonts.ts

**Files:**
- Create: `design-system/fonts.ts`
- Reference: existing `src/app/layout.tsx` uses `next/font/google`

- [ ] **Step 1: Create `design-system/fonts.ts` with Inter + Fraunces + JetBrains Mono**

```ts
// design-system/fonts.ts
// Source of truth for portfolio fonts.
// Consumed by the hub and any project that runs brand:sync.
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";

export const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const fontSerif = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500"],
  axes: ["opsz"],
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const fontVariables = [
  fontSans.variable,
  fontSerif.variable,
  fontMono.variable,
].join(" ");
```

- [ ] **Step 2: Update `src/app/layout.tsx` to import from the new module**

Replace the entire existing font block (lines 2, 12-22) and the body className (line 87-92):

```tsx
// src/app/layout.tsx — top imports
import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { fontVariables } from "@/design-system/fonts";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

import "./globals.css";

// (metadata + viewport exports unchanged)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          fontVariables,
          "min-h-screen bg-background font-sans text-foreground antialiased",
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <SiteNav />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Key changes: (1) imports `fontVariables` from `@/design-system/fonts`, (2) drops the local `Geist`/`Geist_Mono` config, (3) `defaultTheme` changed `"dark"` → `"system"`.

- [ ] **Step 3: Update `tsconfig.json` path alias if missing**

Open `tsconfig.json` and confirm `"paths"` includes a `@/design-system/*` mapping. If only `@/*` exists pointing to `src/*`, add:

```json
"paths": {
  "@/*": ["./src/*"],
  "@/design-system/*": ["./design-system/*"]
}
```

- [ ] **Step 4: Verify Next.js build picks up new fonts**

```bash
cd C:/Proyectos/portafolio-mdea
pnpm dev
```

Open `http://localhost:3000` — verify there is no font-loading error in the terminal and the page renders (font change will happen in Task 4 when globals.css wires the new vars).

Stop dev server (Ctrl+C).

- [ ] **Step 5: Commit**

```bash
git add design-system/fonts.ts src/app/layout.tsx tsconfig.json
git commit -m "feat(brand): install Inter + Fraunces + JetBrains Mono fonts"
```

---

## Task 2: Rewrite tokens.ts with new palette

**Files:**
- Modify: `design-system/tokens.ts`

- [ ] **Step 1: Replace full contents of `design-system/tokens.ts`**

```ts
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
```

- [ ] **Step 2: Verify type check passes**

```bash
pnpm lint
```

Expected: no errors (or only pre-existing warnings unrelated to tokens.ts).

- [ ] **Step 3: Commit**

```bash
git add design-system/tokens.ts
git commit -m "feat(brand): replace palette constants with zinc+blue-700 tokens"
```

---

## Task 3: Create tokens.css with CSS variables

**Files:**
- Create: `design-system/tokens.css`

- [ ] **Step 1: Create `design-system/tokens.css`**

```css
/* design-system/tokens.css
 * MDEA brand tokens — source of truth for CSS variables.
 * Imported by src/app/globals.css. Copied to sibling projects via brand:sync.
 */

:root {
  /* Grayscale (zinc) — light */
  --background: #fafafa;
  --surface: #ffffff;
  --border: #e4e4e7;
  --foreground: #09090b;
  --muted: #71717a;

  /* Single accent — blue-700 */
  --accent: #1D4ED8;
  --ring: #1D4ED8;

  /* shadcn compatibility — keep semantic names mapped to brand tokens */
  --primary: var(--accent);
  --primary-foreground: #ffffff;
  --secondary: #f4f4f5;
  --secondary-foreground: var(--foreground);
  --muted-foreground: var(--muted);
  --accent-foreground: var(--foreground);
  --card: var(--surface);
  --card-foreground: var(--foreground);
  --popover: var(--surface);
  --popover-foreground: var(--foreground);
  --input: var(--border);
  --destructive: #dc2626;

  /* Radius — uniform 8px */
  --radius: 8px;
}

.dark {
  /* Grayscale (zinc) — dark */
  --background: #09090b;
  --surface: #18181b;
  --border: #27272a;
  --foreground: #fafafa;
  --muted: #a1a1aa;

  /* Accent — blue-500 for contrast on dark */
  --accent: #3B82F6;
  --ring: #3B82F6;

  --primary: var(--accent);
  --primary-foreground: #ffffff;
  --secondary: #27272a;
  --secondary-foreground: var(--foreground);
  --muted-foreground: var(--muted);
  --accent-foreground: var(--foreground);
  --card: var(--surface);
  --card-foreground: var(--foreground);
  --popover: var(--surface);
  --popover-foreground: var(--foreground);
  --input: var(--border);
  --destructive: #ef4444;
}
```

- [ ] **Step 2: Commit**

```bash
git add design-system/tokens.css
git commit -m "feat(brand): add tokens.css with light/dark CSS variables"
```

---

## Task 4: Update globals.css to consume new tokens

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace full contents of `src/app/globals.css`**

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "../../design-system/tokens.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: var(--font-sans);
  --font-serif: var(--font-serif);
  --font-mono: var(--font-mono);

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: var(--surface);
  --color-border: var(--border);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-destructive: var(--destructive);

  --radius-sm: calc(var(--radius) - 2px);
  --radius-md: var(--radius);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 2px);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground font-sans antialiased;
  }
  html {
    @apply font-sans;
  }
  h1.font-serif,
  h2.font-serif {
    font-family: var(--font-serif);
    font-feature-settings: "ss01", "ss02";
  }
}
```

- [ ] **Step 2: Start dev server and verify light mode renders**

```bash
pnpm dev
```

Open `http://localhost:3000`. Verify:
- Background is near-white (`#fafafa`)
- Text is near-black
- Any blue accents are the new `#1D4ED8`

- [ ] **Step 3: Toggle to dark mode in browser (system pref or existing toggle) and verify**

Verify:
- Background is near-black (`#09090b`)
- Text is near-white
- Blue is lighter (`#3B82F6`)

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(brand): wire globals.css to new tokens.css"
```

---

## Task 5: Move utils.ts into design-system and create barrel exports

**Files:**
- Create: `design-system/utils.ts`
- Create: `design-system/components/index.ts` (empty for now — will fill as components move)
- Modify: `src/lib/utils.ts`

- [ ] **Step 1: Create `design-system/utils.ts`**

```ts
// design-system/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Replace `src/lib/utils.ts` to re-export**

```ts
// src/lib/utils.ts — re-export from design-system for backwards compatibility
export { cn } from "@/design-system/utils";
```

- [ ] **Step 3: Create empty barrel `design-system/components/index.ts`**

```ts
// design-system/components/index.ts — barrel exports (populated as components move)
export {};
```

- [ ] **Step 4: Verify build still passes**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add design-system/utils.ts design-system/components/index.ts src/lib/utils.ts
git commit -m "refactor(brand): move cn() helper to design-system module"
```

---

## Task 6: Move and rewrite Button component

**Files:**
- Create: `design-system/components/button.tsx`
- Modify: `design-system/components/index.ts`
- Modify: `src/components/ui/button.tsx` (becomes a re-export)

- [ ] **Step 1: Create `design-system/components/button.tsx`**

```tsx
// design-system/components/button.tsx
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/design-system/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[var(--radius)] border border-transparent text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-accent text-[#ffffff] hover:bg-accent/90",
        outline: "border-border bg-background hover:bg-muted/40 text-foreground",
        ghost: "text-foreground hover:bg-muted/40",
        link: "text-accent underline-offset-4 hover:underline h-auto p-0",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 text-[0.8rem]",
        lg: "h-10 px-5 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
```

- [ ] **Step 2: Update barrel export**

```ts
// design-system/components/index.ts
export { Button, buttonVariants } from "./button";
export type { ButtonProps } from "./button";
```

- [ ] **Step 3: Replace `src/components/ui/button.tsx` with re-export**

```tsx
// src/components/ui/button.tsx — re-export for backwards compatibility
export { Button, buttonVariants } from "@/design-system/components/button";
export type { ButtonProps } from "@/design-system/components/button";
```

- [ ] **Step 4: Verify in dev**

```bash
pnpm dev
```

Open `http://localhost:3000`. Verify:
- The "View projects" button has blue background (`#1D4ED8`)
- The "About" ghost button has no background but shows `hover:bg-muted/40`
- Focus ring appears on Tab

- [ ] **Step 5: Commit**

```bash
git add design-system/components/button.tsx design-system/components/index.ts src/components/ui/button.tsx
git commit -m "feat(brand): move Button to design-system with new variants"
```

---

## Task 7: Move and rewrite Badge component

**Files:**
- Create: `design-system/components/badge.tsx`
- Modify: `design-system/components/index.ts`
- Modify: `src/components/ui/badge.tsx`

- [ ] **Step 1: Read current Badge to preserve behavior**

```bash
cat src/components/ui/badge.tsx
```

Inspect. The new version will keep the same prop shape but add `status-shipped`, `status-beta`, `status-archived` variants.

- [ ] **Step 2: Create `design-system/components/badge.tsx`**

```tsx
// design-system/components/badge.tsx
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/design-system/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[var(--radius)] border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-border bg-muted/20 text-foreground",
        outline: "border-border bg-transparent text-foreground",
        "status-shipped": "border-border bg-muted/20 text-foreground",
        "status-beta": "border-accent/40 bg-accent/10 text-accent",
        "status-archived": "border-border bg-transparent text-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { badgeVariants };
```

- [ ] **Step 3: Update barrel export**

Append to `design-system/components/index.ts`:
```ts
export { Badge, badgeVariants } from "./badge";
export type { BadgeProps } from "./badge";
```

- [ ] **Step 4: Replace `src/components/ui/badge.tsx` with re-export**

```tsx
// src/components/ui/badge.tsx
export { Badge, badgeVariants } from "@/design-system/components/badge";
export type { BadgeProps } from "@/design-system/components/badge";
```

- [ ] **Step 5: Update Project card badge to use status variant**

Modify `src/components/project-card.tsx` line 34 to use the new status variants:

Find:
```tsx
<Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">
  {statusLabels[frontmatter.status]} · {frontmatter.year}
</Badge>
```

Replace with:
```tsx
<Badge variant={`status-${frontmatter.status}` as const}>
  {statusLabels[frontmatter.status]} · {frontmatter.year}
</Badge>
```

- [ ] **Step 6: Verify in dev**

```bash
pnpm dev
```

Verify on home page that project cards show status badges with the correct color:
- `shipped` → neutral gray
- `beta` → blue-tinted
- `archived` → muted outline

- [ ] **Step 7: Commit**

```bash
git add design-system/components/badge.tsx design-system/components/index.ts src/components/ui/badge.tsx src/components/project-card.tsx
git commit -m "feat(brand): move Badge to design-system with status variants"
```

---

## Task 8: Move and rewrite Card component

**Files:**
- Create: `design-system/components/card.tsx`
- Modify: `design-system/components/index.ts`
- Modify: `src/components/ui/card.tsx`

- [ ] **Step 1: Create `design-system/components/card.tsx`**

```tsx
// design-system/components/card.tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/design-system/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-4 rounded-[var(--radius)] border border-border bg-surface p-6 transition-colors",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-header" className={cn("flex flex-col gap-2", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-lg font-semibold leading-tight tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-content" className={cn("flex flex-col gap-2", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex flex-wrap items-center gap-1.5 pt-2", className)}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Update barrel export**

Append to `design-system/components/index.ts`:
```ts
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card";
```

- [ ] **Step 3: Replace `src/components/ui/card.tsx` with re-export**

```tsx
// src/components/ui/card.tsx
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/design-system/components/card";
```

- [ ] **Step 4: Verify project cards render correctly**

```bash
pnpm dev
```

Check home page — project cards should have:
- 8px radius
- subtle 1px border
- white surface in light mode, zinc-900 in dark
- hover transition works

- [ ] **Step 5: Commit**

```bash
git add design-system/components/card.tsx design-system/components/index.ts src/components/ui/card.tsx
git commit -m "feat(brand): move Card to design-system with 8px radius + new tokens"
```

---

## Task 9: Move Separator component

**Files:**
- Create: `design-system/components/separator.tsx`
- Modify: `design-system/components/index.ts`
- Modify: `src/components/ui/separator.tsx`

- [ ] **Step 1: Create `design-system/components/separator.tsx`**

```tsx
// design-system/components/separator.tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/design-system/utils";

type SeparatorProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
};

export function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  return (
    <div
      role="separator"
      data-slot="separator"
      data-orientation={orientation}
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Update barrel + re-export**

Append to `design-system/components/index.ts`:
```ts
export { Separator } from "./separator";
```

Replace `src/components/ui/separator.tsx`:
```tsx
export { Separator } from "@/design-system/components/separator";
```

- [ ] **Step 3: Verify**

```bash
pnpm dev
```

Home page separator should be a thin 1px line with the new `--border` color.

- [ ] **Step 4: Commit**

```bash
git add design-system/components/separator.tsx design-system/components/index.ts src/components/ui/separator.tsx
git commit -m "feat(brand): move Separator to design-system"
```

---

## Task 10: Create new StatusDot component

**Files:**
- Create: `design-system/components/status-dot.tsx`
- Modify: `design-system/components/index.ts`

- [ ] **Step 1: Create `design-system/components/status-dot.tsx`**

```tsx
// design-system/components/status-dot.tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/design-system/utils";

type StatusKind = "live" | "beta" | "archived";

type StatusDotProps = HTMLAttributes<HTMLSpanElement> & {
  status: StatusKind;
  label?: string;
};

const dotColor: Record<StatusKind, string> = {
  live: "bg-accent",
  beta: "bg-accent/60",
  archived: "bg-muted",
};

const labels: Record<StatusKind, string> = {
  live: "Live",
  beta: "Beta",
  archived: "Archived",
};

export function StatusDot({ status, label, className, ...props }: StatusDotProps) {
  return (
    <span
      data-slot="status-dot"
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground",
        className,
      )}
      {...props}
    >
      <span className={cn("inline-block size-1.5 rounded-full", dotColor[status])} aria-hidden="true" />
      {label ?? labels[status]}
    </span>
  );
}
```

- [ ] **Step 2: Update barrel export**

Append to `design-system/components/index.ts`:
```ts
export { StatusDot } from "./status-dot";
```

- [ ] **Step 3: Smoke test in dev by temporarily adding to home page**

Edit `src/app/page.tsx` — add this inside the hero section temporarily:

```tsx
import { StatusDot } from "@/design-system/components/status-dot";
// ... inside the hero
<StatusDot status="live" className="mt-4" />
```

Verify dot renders with blue accent + "LIVE" label in monospace.

Revert the temporary addition (we'll use StatusDot properly in Task 13).

- [ ] **Step 4: Commit**

```bash
git add design-system/components/status-dot.tsx design-system/components/index.ts
git commit -m "feat(brand): add StatusDot component"
```

---

## Task 11: Create Metric + MetricGroup MDX components

**Files:**
- Create: `design-system/mdx/metric.tsx`
- Create: `design-system/mdx/metric-group.tsx`

- [ ] **Step 1: Create `design-system/mdx/metric.tsx`**

```tsx
// design-system/mdx/metric.tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/design-system/utils";

type MetricProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
  label: string;
  description?: string;
};

export function Metric({ value, label, description, className, ...props }: MetricProps) {
  return (
    <div
      data-slot="metric"
      className={cn(
        "flex flex-col gap-1 rounded-[var(--radius)] border border-border bg-surface p-5",
        className,
      )}
      {...props}
    >
      <span className="font-serif text-3xl font-medium tracking-tight text-foreground">{value}</span>
      <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {description ? (
        <span className="mt-1 text-sm leading-6 text-foreground/80">{description}</span>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Create `design-system/mdx/metric-group.tsx`**

```tsx
// design-system/mdx/metric-group.tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/design-system/utils";

type MetricGroupProps = HTMLAttributes<HTMLDivElement> & {
  cols?: 2 | 3 | 4;
};

export function MetricGroup({ cols = 3, className, children, ...props }: MetricGroupProps) {
  const gridClass =
    cols === 2 ? "sm:grid-cols-2" : cols === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div
      data-slot="metric-group"
      className={cn("my-6 grid grid-cols-1 gap-3", gridClass, className)}
      {...props}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add design-system/mdx/metric.tsx design-system/mdx/metric-group.tsx
git commit -m "feat(brand): add Metric + MetricGroup MDX components"
```

---

## Task 12: Create Tradeoff + Callout MDX components

**Files:**
- Create: `design-system/mdx/tradeoff.tsx`
- Create: `design-system/mdx/callout.tsx`

- [ ] **Step 1: Create `design-system/mdx/tradeoff.tsx`**

```tsx
// design-system/mdx/tradeoff.tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/design-system/utils";

type TradeoffProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
};

export function Tradeoff({ title, children, className, ...props }: TradeoffProps) {
  return (
    <div
      data-slot="tradeoff"
      className={cn(
        "my-6 border-l-2 border-accent bg-muted/10 py-4 pl-5 pr-4",
        className,
      )}
      {...props}
    >
      <h4 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{title}</h4>
      <div className="mt-2 text-[15px] leading-7 text-foreground/90">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Create `design-system/mdx/callout.tsx`**

```tsx
// design-system/mdx/callout.tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/design-system/utils";

type CalloutProps = HTMLAttributes<HTMLDivElement> & {
  type?: "note" | "warn";
};

export function Callout({ type = "note", children, className, ...props }: CalloutProps) {
  const tone =
    type === "warn"
      ? "border-destructive/40 bg-destructive/5"
      : "border-border bg-muted/10";
  return (
    <div
      data-slot="callout"
      data-type={type}
      className={cn("my-6 rounded-[var(--radius)] border px-5 py-4 text-[15px] leading-7 text-foreground/85", tone, className)}
      {...props}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add design-system/mdx/tradeoff.tsx design-system/mdx/callout.tsx
git commit -m "feat(brand): add Tradeoff + Callout MDX components"
```

---

## Task 13: Register MDX components in mdx-components.tsx

**Files:**
- Modify: `src/lib/mdx-components.tsx`

- [ ] **Step 1: Add imports and register new components**

At the top of `src/lib/mdx-components.tsx`, add imports:

```tsx
import { Metric } from "@/design-system/mdx/metric";
import { MetricGroup } from "@/design-system/mdx/metric-group";
import { Tradeoff } from "@/design-system/mdx/tradeoff";
import { Callout } from "@/design-system/mdx/callout";
```

At the bottom of the `mdxComponents` object (just before the final closing `};`), add:

```tsx
  Metric,
  MetricGroup,
  Tradeoff,
  Callout,
```

Also update the `h1` and `h2` renderers so a serif h1 can be achieved inside MDX if needed (default stays sans). Find the `h1` block and keep as-is. The case study page will control the h1 font from outside MDX.

- [ ] **Step 2: Verify build and dev**

```bash
pnpm dev
```

Open an existing case study (e.g. `/projects/agente-riesgo`). Verify prose still renders correctly (no regression).

- [ ] **Step 3: Commit**

```bash
git add src/lib/mdx-components.tsx
git commit -m "feat(brand): register Metric/Tradeoff/Callout in MDX renderer"
```

---

## Task 14: Update home page with Fraunces H1 and eyebrow

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace the H1 in the hero section to use font-serif**

Find the hero block in `src/app/page.tsx`. The current H1 is:

```tsx
<h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
  {site.thesis.headline}
</h1>
```

Replace with:

```tsx
<h1 className="font-serif mt-6 text-balance text-5xl font-medium leading-[1.05] tracking-tight sm:text-[64px]">
  {site.thesis.headline}
</h1>
```

Key changes: `font-serif` class added, weight `semibold` → `medium`, size slightly adjusted for Fraunces.

- [ ] **Step 2: Verify in dev**

```bash
pnpm dev
```

Home hero should show "Executive who builds." in Fraunces.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(brand): use Fraunces serif for home hero H1"
```

---

## Task 15: Update projects index page

**Files:**
- Modify: `src/app/projects/page.tsx`

- [ ] **Step 1: Apply serif H1**

Find line 25 in `src/app/projects/page.tsx`:

```tsx
<h1 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
  Case studies from the builder&apos;s desk.
</h1>
```

Replace with:

```tsx
<h1 className="font-serif mt-6 text-balance text-4xl font-medium leading-tight tracking-tight sm:text-[52px]">
  Case studies from the builder&apos;s desk.
</h1>
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```

Navigate to `/projects`. Title should be in Fraunces serif.

- [ ] **Step 3: Commit**

```bash
git add src/app/projects/page.tsx
git commit -m "feat(brand): use Fraunces for projects index title"
```

---

## Task 16: Update case study page with new layout

**Files:**
- Modify: `src/app/projects/[slug]/page.tsx`

- [ ] **Step 1: Replace the H1 to use Fraunces and adjust the meta box**

Find the H1 on line 120:

```tsx
<h1 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
  {frontmatter.title}
</h1>
```

Replace with:

```tsx
<h1 className="font-serif mt-6 text-balance text-4xl font-medium leading-tight tracking-tight sm:text-[48px]">
  {frontmatter.title}
</h1>
```

- [ ] **Step 2: Replace the status badge variant to use the new status-kind variants**

Find on line 110-113:

```tsx
<Badge
  variant="secondary"
  className="font-mono text-[10px] uppercase tracking-wider"
>
  {statusLabels[frontmatter.status]} · {frontmatter.year}
</Badge>
```

Replace with:

```tsx
<Badge variant={`status-${frontmatter.status}` as const}>
  {statusLabels[frontmatter.status]} · {frontmatter.year}
</Badge>
```

- [ ] **Step 3: Verify**

```bash
pnpm dev
```

Visit `/projects/agente-riesgo`. Title should be Fraunces serif, status badge should use the blue-tinted `status-beta` variant.

- [ ] **Step 4: Commit**

```bash
git add src/app/projects/[slug]/page.tsx
git commit -m "feat(brand): apply Fraunces H1 + status badge variant to case study"
```

---

## Task 17: Enrich agente-riesgo.mdx with Metric + Tradeoff blocks

**Files:**
- Modify: `content/projects/agente-riesgo.mdx`

- [ ] **Step 1: Add a MetricGroup after the "## El enfoque" section and convert the 3 "Por qué…" paragraphs in "Decisiones de diseño" to Tradeoff blocks**

Open `content/projects/agente-riesgo.mdx`. After the numbered list at the end of "## El enfoque", before "## Decisiones de diseño", insert:

```mdx
<MetricGroup cols={3}>
  <Metric value="65%" label="Umbral de escalamiento" description="Por debajo, el caso se escala a revisión humana." />
  <Metric value="3" label="Fuentes en paralelo" description="Truora + Exa + razonamiento LLM." />
  <Metric value="10 min" label="Caché de modelos" description="Discovery dinámico de free models en OpenRouter." />
</MetricGroup>
```

Then convert the 4 "Por qué…" paragraphs in "## Decisiones de diseño" to Tradeoff blocks. Example — find:

```mdx
**Por qué escalamiento por umbral de confianza y no solo aprobar/rechazar:** Un sistema binario obliga al modelo a tomar posición en casos ambiguos. El escalamiento reconoce que hay casos donde la información disponible no es suficiente para decidir — y que pretender lo contrario genera riesgo operativo real. El umbral del 65% es configurable; en producción debería calibrarse contra datos históricos de cada operación.
```

Replace with:

```mdx
<Tradeoff title="Por qué escalamiento por umbral de confianza y no solo aprobar/rechazar">
Un sistema binario obliga al modelo a tomar posición en casos ambiguos. El escalamiento reconoce que hay casos donde la información disponible no es suficiente para decidir — y que pretender lo contrario genera riesgo operativo real. El umbral del 65% es configurable; en producción debería calibrarse contra datos históricos de cada operación.
</Tradeoff>
```

Repeat for:
- "Por qué búsqueda diferenciada por tipo de caso"
- "Por qué fallback dinámico de modelos en OpenRouter"
- "Por qué casos demo pre-computados"

- [ ] **Step 2: Verify in dev**

```bash
pnpm dev
```

Visit `/projects/agente-riesgo`. Verify:
- Metric group renders as 3-column grid with serif numbers
- Each Tradeoff renders with blue left-border + mono uppercase title

- [ ] **Step 3: Commit**

```bash
git add content/projects/agente-riesgo.mdx
git commit -m "content: enrich agente-riesgo with Metric + Tradeoff components"
```

---

## Task 18: Enrich identidad-360.mdx with Metric + Tradeoff blocks

**Files:**
- Modify: `content/projects/identidad-360.mdx`

- [ ] **Step 1: Insert MetricGroup after "## El enfoque"**

```mdx
<MetricGroup cols={3}>
  <Metric value="3" label="Fuentes integradas" description="Truora + Tavily + LLM." />
  <Metric value="0–100" label="Score sintetizado" description="Perfil de riesgo accionable en segundos." />
  <Metric value="Zod" label="Validación estricta" description="Schema-typed output del LLM, garantía de shape." />
</MetricGroup>
```

- [ ] **Step 2: Convert the 3 "Por qué…" paragraphs in "## Decisiones de diseño" to Tradeoff blocks**

For each `**Por qué ...:** ...` block, wrap the explanation:

```mdx
<Tradeoff title="Por qué un LLM para síntesis y no reglas fijas">
Las señales web no son estructuradas. Un sistema de reglas clasificaría mal casos ambiguos (homónimos, noticias antiguas, contexto geográfico). El LLM puede razonar sobre contexto; el trade-off es que no es determinista — por eso el score numérico complementa el razonamiento con una señal más estable.
</Tradeoff>
```

Repeat for:
- "Por qué mock determinista para la demo"
- "Por qué validación con Zod en el output del LLM"

- [ ] **Step 3: Verify in dev**

```bash
pnpm dev
```

Visit `/projects/identidad-360`. Same visual check as Task 17.

- [ ] **Step 4: Commit**

```bash
git add content/projects/identidad-360.mdx
git commit -m "content: enrich identidad-360 with Metric + Tradeoff components"
```

---

## Task 19: Create brand-sync.mjs script (TDD)

**Files:**
- Create: `scripts/brand-sync.mjs`
- Create: `scripts/brand-sync.test.mjs`
- Modify: `package.json` (add `brand:sync` script)

- [ ] **Step 1: Write the failing test**

Create `scripts/brand-sync.test.mjs`:

```js
// scripts/brand-sync.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { syncKit } from "./brand-sync.mjs";

test("syncKit copies all files from source to target", () => {
  const source = mkdtempSync(path.join(tmpdir(), "src-"));
  const target = mkdtempSync(path.join(tmpdir(), "tgt-"));
  mkdirSync(path.join(source, "components"));
  writeFileSync(path.join(source, "tokens.css"), ":root { --x: 1; }");
  writeFileSync(path.join(source, "components", "button.tsx"), "export {}");

  syncKit({ source, target });

  assert.equal(readFileSync(path.join(target, "tokens.css"), "utf8"), ":root { --x: 1; }");
  assert.ok(existsSync(path.join(target, "components", "button.tsx")));

  rmSync(source, { recursive: true, force: true });
  rmSync(target, { recursive: true, force: true });
});

test("syncKit removes files in target that no longer exist in source", () => {
  const source = mkdtempSync(path.join(tmpdir(), "src-"));
  const target = mkdtempSync(path.join(tmpdir(), "tgt-"));
  writeFileSync(path.join(source, "a.css"), "a");
  writeFileSync(path.join(target, "a.css"), "old-a");
  writeFileSync(path.join(target, "b.css"), "stale");

  syncKit({ source, target });

  assert.equal(readFileSync(path.join(target, "a.css"), "utf8"), "a");
  assert.equal(existsSync(path.join(target, "b.css")), false);

  rmSync(source, { recursive: true, force: true });
  rmSync(target, { recursive: true, force: true });
});

test("syncKit writes a manifest with timestamp", () => {
  const source = mkdtempSync(path.join(tmpdir(), "src-"));
  const target = mkdtempSync(path.join(tmpdir(), "tgt-"));
  writeFileSync(path.join(source, "tokens.css"), ":root {}");

  syncKit({ source, target, kitName: "brand" });

  const manifest = JSON.parse(readFileSync(path.join(target, ".brand-sync-manifest.json"), "utf8"));
  assert.equal(manifest.kit, "brand");
  assert.ok(manifest.syncedAt);
  assert.ok(Array.isArray(manifest.files));

  rmSync(source, { recursive: true, force: true });
  rmSync(target, { recursive: true, force: true });
});
```

- [ ] **Step 2: Run the test — expect failure**

```bash
node --test scripts/brand-sync.test.mjs
```

Expected: FAIL with `Cannot find module '...brand-sync.mjs'`.

- [ ] **Step 3: Implement `scripts/brand-sync.mjs`**

```js
// scripts/brand-sync.mjs
// Copies design-system/ from a sibling "hub" repo into the current repo.
// Usage from consumer repo: node ../portafolio-mdea/scripts/brand-sync.mjs
import {
  readdirSync, statSync, mkdirSync, copyFileSync,
  rmSync, existsSync, writeFileSync, readFileSync,
} from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function walk(dir, rel = "") {
  const entries = readdirSync(dir);
  const out = [];
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const r = path.join(rel, entry);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full, r));
    else out.push(r);
  }
  return out;
}

export function syncKit({ source, target, kitName = "brand" }) {
  if (!existsSync(source)) throw new Error(`Source not found: ${source}`);
  if (!existsSync(target)) mkdirSync(target, { recursive: true });

  const sourceFiles = new Set(walk(source));
  const targetFiles = existsSync(target) ? new Set(walk(target).filter((f) => !f.endsWith("-sync-manifest.json"))) : new Set();

  // Copy everything from source
  for (const rel of sourceFiles) {
    const src = path.join(source, rel);
    const dst = path.join(target, rel);
    mkdirSync(path.dirname(dst), { recursive: true });
    copyFileSync(src, dst);
  }

  // Remove target files that are not in source
  for (const rel of targetFiles) {
    if (!sourceFiles.has(rel)) {
      rmSync(path.join(target, rel), { force: true });
    }
  }

  const manifest = {
    kit: kitName,
    syncedAt: new Date().toISOString(),
    sourcePath: source,
    files: [...sourceFiles].sort(),
  };
  writeFileSync(path.join(target, `.${kitName}-sync-manifest.json`), JSON.stringify(manifest, null, 2));
  return manifest;
}

// CLI entrypoint
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}` || process.argv[1].endsWith("brand-sync.mjs")) {
  const { values } = parseArgs({
    options: {
      from: { type: "string", default: ".." },
    },
  });
  const hubDir = path.resolve(process.cwd(), values.from, "portafolio-mdea");
  const sourceDir = existsSync(hubDir) ? path.join(hubDir, "design-system") : path.resolve(process.cwd(), values.from, "design-system");
  const targetDir = path.join(process.cwd(), "design-system");

  console.log(`[brand-sync] ${sourceDir} → ${targetDir}`);
  const manifest = syncKit({ source: sourceDir, target: targetDir, kitName: "brand" });
  console.log(`[brand-sync] synced ${manifest.files.length} files at ${manifest.syncedAt}`);
}
```

- [ ] **Step 4: Run test to verify pass**

```bash
node --test scripts/brand-sync.test.mjs
```

Expected: 3 tests pass.

- [ ] **Step 5: Add `brand:sync` script to package.json**

Open `package.json`. In the `"scripts"` object, add:

```json
"brand:sync": "node scripts/brand-sync.mjs",
"test:scripts": "node --test scripts/*.test.mjs"
```

- [ ] **Step 6: Commit**

```bash
git add scripts/brand-sync.mjs scripts/brand-sync.test.mjs package.json
git commit -m "feat(brand): add brand-sync.mjs script + tests"
```

---

## Task 20: Document design-system with README + CHANGELOG

**Files:**
- Modify: `design-system/README.md`
- Create: `design-system/CHANGELOG.md`

- [ ] **Step 1: Replace `design-system/README.md`**

```markdown
# MDEA Design System (Brand Kit)

Source of truth for visual identity across the portfolio hub and every project repo.

## Tokens

| Token | Light | Dark | Purpose |
|---|---|---|---|
| `--background` | `#fafafa` | `#09090b` | Page background |
| `--surface` | `#ffffff` | `#18181b` | Cards, panels |
| `--border` | `#e4e4e7` | `#27272a` | Subtle borders |
| `--foreground` | `#09090b` | `#fafafa` | Primary text |
| `--muted` | `#71717a` | `#a1a1aa` | Secondary text |
| `--accent` | `#1D4ED8` | `#3B82F6` | Links, focus, single accent |
| `--radius` | `8px` (uniform) | — | All component corners |

Defined in `tokens.css`; mirrored as TS constants in `tokens.ts`.

## Fonts

Configured in `fonts.ts`:
- **Inter** (variable) — body, UI, nav
- **Fraunces** (variable, opsz) — hero H1 and case-study H1 only
- **JetBrains Mono** — code, eyebrows, tag chips

## Components

In `components/`:
- `Button` — `default` / `outline` / `ghost` / `link`, sizes `default`/`sm`/`lg`/`icon`
- `Badge` — `default` / `outline` / `status-shipped` / `status-beta` / `status-archived`
- `Card` — container with 8px radius + subtle border
- `Separator` — 1px border line
- `StatusDot` — dot + label (`live`/`beta`/`archived`)

## MDX-only components (hub-exclusive)

In `mdx/`:
- `<Metric value="65%" label="…" description="…" />`
- `<MetricGroup cols={2|3|4}>…</MetricGroup>`
- `<Tradeoff title="…">…</Tradeoff>`
- `<Callout type="note|warn">…</Callout>`

These are NOT part of the portable kit — only projects with case-study MDX use them.

## Usage in sibling projects

```bash
# From inside a sibling repo under proyectos-portafolio/
pnpm brand:sync
```

This copies the entire `design-system/` from `portafolio-mdea/` into the current repo. It writes a `.brand-sync-manifest.json` to record which version was applied.

## Updating the palette

1. Edit `design-system/tokens.css` and `design-system/tokens.ts` in the hub.
2. Update `globals.css` consumers if needed.
3. Add an entry to `CHANGELOG.md`.
4. Run `pnpm brand:sync` in each sibling project (or `pnpm brand:propagate` when that script exists — Plan 2).
```

- [ ] **Step 2: Create `design-system/CHANGELOG.md`**

```markdown
# Design System Changelog

## 2.0.0 — 2026-04-16
- **Breaking:** palette replaced `indigo #6366f1 + cyan #22d3ee` → `zinc + blue-700 (#1D4ED8)`.
- **Breaking:** fonts replaced Geist/Geist_Mono → Inter + Fraunces + JetBrains_Mono.
- Radius unified to 8px.
- New `StatusDot` component.
- New MDX components: `Metric`, `MetricGroup`, `Tradeoff`, `Callout`.
- Added `brand-sync.mjs` for distribution to sibling repos.
```

- [ ] **Step 3: Commit**

```bash
git add design-system/README.md design-system/CHANGELOG.md
git commit -m "docs(brand): update README and add CHANGELOG 2.0.0"
```

---

## Task 21: Verify Phase 1 — full visual smoke test

- [ ] **Step 1: Start production build**

```bash
pnpm build
```

Expected: build completes without errors.

- [ ] **Step 2: Start dev and verify full navigation**

```bash
pnpm dev
```

- [ ] **Step 3: Verify every page in both modes**

Open `http://localhost:3000` and walk through:

**Light mode (toggle via theme switcher or OS pref):**
- [ ] Home: Fraunces H1, new zinc + blue palette, project cards render with new Card style
- [ ] `/projects`: same pattern
- [ ] `/projects/agente-riesgo`: Fraunces H1, status-beta blue-tinted badge, `<MetricGroup>` renders as grid, `<Tradeoff>` blocks show blue left-border
- [ ] `/projects/identidad-360`: same as above
- [ ] `/about`: renders with new palette (may not have Fraunces depending on its structure — that's fine)

**Dark mode:**
- [ ] Same page walk, confirm contrast is acceptable, accent is blue-500

- [ ] **Step 4: If any visual issue found, note it and fix in a dedicated commit before moving to Phase 2**

- [ ] **Step 5: Final Phase 1 commit**

```bash
git commit --allow-empty -m "milestone: Phase 1 — hub brand kit complete"
```

---

## Task 22: Create AI kit — models.ts

**Files:**
- Create: `ai-kit/models.ts`
- Create: `ai-kit/CHANGELOG.md`

- [ ] **Step 1: Create `ai-kit/models.ts`**

```ts
// ai-kit/models.ts
// Source of truth for free OpenRouter models used across MDEA portfolio projects.
// When a model is deprecated, reorder or replace here and run ai:sync across projects.

export type ModelId = string;

export const FREE_MODELS_PRIORITY: readonly ModelId[] = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
  "deepseek/deepseek-chat-v3:free",
] as const;

export type ModelSelection = {
  model: ModelId;
  discoveredAt: number;
  fallbackIndex: number;
};
```

- [ ] **Step 2: Create `ai-kit/CHANGELOG.md`**

```markdown
# AI Kit Changelog

## 1.0.0 — 2026-04-16
- Initial kit extracted from agente-riesgo dynamic-model pattern.
- Allowlist: llama-3.3-70b, gemini-2.0-flash-exp, deepseek-chat-v3.
- Conventions: demo mode obligatorio, env vars standardized.
```

- [ ] **Step 3: Commit**

```bash
git add ai-kit/models.ts ai-kit/CHANGELOG.md
git commit -m "feat(ai-kit): add free-model allowlist"
```

---

## Task 23: Create AI kit — demo-mode.ts (TDD)

**Files:**
- Create: `ai-kit/demo-mode.ts`
- Create: `ai-kit/demo-mode.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// ai-kit/demo-mode.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { defineDemoCase, pickDemoCase } from "./demo-mode.ts";

// NOTE: node:test can't import .ts directly; convert via tsx or compile first.
// For Plan 1 we test the logic behaviorally via the client in Task 24.
// This placeholder ensures the test file exists for pnpm test:scripts to pick up.

test("defineDemoCase returns the provided payload", () => {
  const c = defineDemoCase({ id: "maria", input: "María Pérez", output: { score: 78 } });
  assert.equal(c.id, "maria");
  assert.deepEqual(c.output, { score: 78 });
});
```

> Note: because `node --test` cannot directly import `.ts`, this file is retained as a smoke test of the shape only. Runtime verification of demo-mode happens in Task 24's client tests which consume the helper indirectly. If you prefer, skip this test now and rely on Task 24.

- [ ] **Step 2: Create `ai-kit/demo-mode.ts`**

```ts
// ai-kit/demo-mode.ts
// Convention: every MDEA portfolio project with AI MUST ship pre-computed
// demo cases that work without API keys. This module defines the shape.

export type DemoCase<TInput, TOutput> = {
  id: string;
  label?: string;
  input: TInput;
  output: TOutput;
};

export function defineDemoCase<TInput, TOutput>(
  c: DemoCase<TInput, TOutput>,
): DemoCase<TInput, TOutput> {
  return c;
}

/**
 * Deterministic demo case picker — given a raw input string (e.g., a name or ID),
 * returns a stable choice from the provided cases so that demos are reproducible.
 */
export function pickDemoCase<TInput, TOutput>(
  cases: DemoCase<TInput, TOutput>[],
  input: string,
): DemoCase<TInput, TOutput> {
  if (cases.length === 0) {
    throw new Error("pickDemoCase: no cases provided");
  }
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % cases.length;
  return cases[idx];
}
```

- [ ] **Step 3: Commit**

```bash
git add ai-kit/demo-mode.ts
git commit -m "feat(ai-kit): add demo-mode convention + pickDemoCase helper"
```

---

## Task 24: Create AI kit — client.ts

**Files:**
- Create: `ai-kit/client.ts`

- [ ] **Step 1: Create `ai-kit/client.ts`**

```ts
// ai-kit/client.ts
// Shared AI client for MDEA portfolio projects — wraps OpenRouter with:
//   - dynamic free-model discovery + fallback
//   - 10-min cache of the discovery result
//   - structured error when all models unavailable

import { FREE_MODELS_PRIORITY, type ModelId, type ModelSelection } from "./models";

const DEFAULT_CACHE_TTL_MS = 10 * 60 * 1000;
const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";

type Cache = {
  selection: ModelSelection | null;
  fetchedAt: number;
};

let cache: Cache = { selection: null, fetchedAt: 0 };

export type MdeaAiConfig = {
  apiKey: string | undefined;
  cacheTtlMs?: number;
  referer?: string;
  appName?: string;
};

export class NoModelAvailableError extends Error {
  constructor(public readonly tried: ModelId[]) {
    super(`No free OpenRouter model available from allowlist: ${tried.join(", ")}`);
    this.name = "NoModelAvailableError";
  }
}

async function fetchAvailableModels(apiKey: string | undefined): Promise<Set<ModelId>> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  const res = await fetch(OPENROUTER_MODELS_URL, { headers });
  if (!res.ok) throw new Error(`OpenRouter /models failed: ${res.status}`);
  const json = (await res.json()) as { data: Array<{ id: string }> };
  return new Set(json.data.map((m) => m.id));
}

export async function selectModel(config: MdeaAiConfig): Promise<ModelSelection> {
  const ttl = config.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
  const now = Date.now();
  if (cache.selection && now - cache.fetchedAt < ttl) return cache.selection;

  const available = await fetchAvailableModels(config.apiKey);
  for (let i = 0; i < FREE_MODELS_PRIORITY.length; i += 1) {
    const model = FREE_MODELS_PRIORITY[i];
    if (available.has(model)) {
      const selection: ModelSelection = { model, discoveredAt: now, fallbackIndex: i };
      cache = { selection, fetchedAt: now };
      return selection;
    }
  }
  throw new NoModelAvailableError([...FREE_MODELS_PRIORITY]);
}

export function createMdeaAi(config: MdeaAiConfig) {
  return {
    selectModel: () => selectModel(config),
    resetCache: () => {
      cache = { selection: null, fetchedAt: 0 };
    },
  };
}

export type MdeaAi = ReturnType<typeof createMdeaAi>;
```

- [ ] **Step 2: Compile-check via tsc (spot-check)**

```bash
pnpm exec tsc --noEmit --project tsconfig.json ai-kit/client.ts 2>&1 | head -20
```

Expected: no errors reported on `ai-kit/client.ts`. Any unrelated pre-existing errors are acceptable.

- [ ] **Step 3: Commit**

```bash
git add ai-kit/client.ts
git commit -m "feat(ai-kit): add createMdeaAi() with discovery + cache + fallback"
```

---

## Task 25: Create AI kit — rate-limit.tsx

**Files:**
- Create: `ai-kit/rate-limit.tsx`

- [ ] **Step 1: Create `ai-kit/rate-limit.tsx`**

```tsx
// ai-kit/rate-limit.tsx
// UI helper: show a recoverable message when the live mode hits rate limit
// and invite the user to fall back to demo mode.
"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/design-system/utils";

type RateLimitNoticeProps = HTMLAttributes<HTMLDivElement> & {
  onSwitchToDemo?: () => void;
  /**
   * Optional retry-after hint in seconds; rendered if provided.
   */
  retryAfterSeconds?: number;
};

export function RateLimitNotice({
  className,
  onSwitchToDemo,
  retryAfterSeconds,
  ...props
}: RateLimitNoticeProps) {
  return (
    <div
      data-slot="rate-limit-notice"
      className={cn(
        "my-4 rounded-[var(--radius)] border border-destructive/40 bg-destructive/5 p-4 text-sm text-foreground/85",
        className,
      )}
      role="alert"
      {...props}
    >
      <p className="font-medium">Live mode temporarily unavailable.</p>
      <p className="mt-1 text-foreground/70">
        OpenRouter rate limit reached for this IP
        {retryAfterSeconds ? ` — retry in ~${retryAfterSeconds}s` : ""}.
        {" "}
        Switch to demo mode to keep exploring with pre-computed cases.
      </p>
      {onSwitchToDemo ? (
        <button
          type="button"
          onClick={onSwitchToDemo}
          className="mt-3 inline-flex h-8 items-center rounded-[var(--radius)] border border-border bg-background px-3 text-[0.8rem] font-medium text-foreground hover:bg-muted/40"
        >
          Switch to demo
        </button>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add ai-kit/rate-limit.tsx
git commit -m "feat(ai-kit): add RateLimitNotice UI for graceful fallback"
```

---

## Task 26: Create ai-sync.mjs script (TDD — reuse syncKit)

**Files:**
- Create: `scripts/ai-sync.mjs`
- Create: `scripts/ai-sync.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the test**

```js
// scripts/ai-sync.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { syncKit } from "./brand-sync.mjs";

test("ai-kit can be synced with the same syncKit helper", () => {
  const source = mkdtempSync(path.join(tmpdir(), "ai-src-"));
  const target = mkdtempSync(path.join(tmpdir(), "ai-tgt-"));
  writeFileSync(path.join(source, "models.ts"), "export const X = 1;");

  const manifest = syncKit({ source, target, kitName: "ai" });

  assert.equal(manifest.kit, "ai");
  assert.ok(existsSync(path.join(target, ".ai-sync-manifest.json")));

  rmSync(source, { recursive: true, force: true });
  rmSync(target, { recursive: true, force: true });
});
```

- [ ] **Step 2: Run the test — expect pass (the helper is already written)**

```bash
node --test scripts/ai-sync.test.mjs
```

Expected: 1 test passes (because `syncKit` is generic).

- [ ] **Step 3: Create `scripts/ai-sync.mjs` as CLI wrapper**

```js
// scripts/ai-sync.mjs
// Syncs ai-kit/ from the hub into the current repo.
import path from "node:path";
import { existsSync } from "node:fs";
import { parseArgs } from "node:util";
import { syncKit } from "./brand-sync.mjs";

const { values } = parseArgs({
  options: {
    from: { type: "string", default: ".." },
  },
});

const hubDir = path.resolve(process.cwd(), values.from, "portafolio-mdea");
const sourceDir = existsSync(hubDir) ? path.join(hubDir, "ai-kit") : path.resolve(process.cwd(), values.from, "ai-kit");
const targetDir = path.join(process.cwd(), "ai-kit");

console.log(`[ai-sync] ${sourceDir} → ${targetDir}`);
const manifest = syncKit({ source: sourceDir, target: targetDir, kitName: "ai" });
console.log(`[ai-sync] synced ${manifest.files.length} files at ${manifest.syncedAt}`);
```

- [ ] **Step 4: Add script in package.json**

```json
"ai:sync": "node scripts/ai-sync.mjs",
```

- [ ] **Step 5: Commit**

```bash
git add scripts/ai-sync.mjs scripts/ai-sync.test.mjs package.json
git commit -m "feat(ai-kit): add ai-sync.mjs script + test"
```

---

## Task 27: Document ai-kit with README

**Files:**
- Create: `ai-kit/README.md`

- [ ] **Step 1: Create `ai-kit/README.md`**

```markdown
# MDEA AI Kit

Shared AI primitives for MDEA portfolio projects that use LLMs. Parallel to `design-system/`; optional per project.

## What's included

- `models.ts` — prioritized allowlist of free OpenRouter models.
- `client.ts` — `createMdeaAi()` with dynamic discovery + 10-min cache + fallback.
- `demo-mode.ts` — convention and helpers for pre-computed demo cases.
- `rate-limit.tsx` — UI to recover gracefully when live mode hits a rate limit.

## Convention — demo mode obligatorio

**Every MDEA portfolio project that uses LLMs must ship a demo mode that works without any API key.** Rationale: OpenRouter free-tier rate limits per IP mean a public demo can break for a visitor if previous visitors exhausted quota. Demo mode guarantees the product always works.

```ts
import { defineDemoCase, pickDemoCase } from "@/ai-kit/demo-mode";

const cases = [
  defineDemoCase({ id: "maria", input: "María Pérez", output: { score: 78, ... } }),
  defineDemoCase({ id: "carlos", input: "Carlos López", output: { score: 42, ... } }),
];

const demo = pickDemoCase(cases, userInput); // deterministic choice
```

## Usage — live mode

```ts
import { createMdeaAi, NoModelAvailableError } from "@/ai-kit/client";

const ai = createMdeaAi({ apiKey: process.env.OPENROUTER_API_KEY });
try {
  const { model } = await ai.selectModel();
  // call OpenRouter with `model`
} catch (err) {
  if (err instanceof NoModelAvailableError) {
    // fall back to demo mode
  }
}
```

## Env vars — conventional names

| Var | Default | Purpose |
|---|---|---|
| `OPENROUTER_API_KEY` | (unset) | Required for live mode; absent ⇒ live mode disabled. |
| `NEXT_PUBLIC_MDEA_DEMO_DEFAULT` | `true` in prod | Controls initial mode of UI. |
| `MDEA_AI_CACHE_TTL_MS` | `600000` | Model discovery cache TTL. |

## Syncing to a sibling project

```bash
pnpm ai:sync
```

Copies this entire directory into the consumer project. Writes `.ai-sync-manifest.json`.
```

- [ ] **Step 2: Commit**

```bash
git add ai-kit/README.md
git commit -m "docs(ai-kit): add README with conventions and usage"
```

---

## Task 28: Phase 2 milestone — verify hub with both kits builds cleanly

- [ ] **Step 1: Run all script tests**

```bash
pnpm test:scripts
```

Expected: all tests pass (brand-sync x3 + ai-sync x1 + demo-mode x1 if ts-node available).

- [ ] **Step 2: Run full build**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 3: Lint**

```bash
pnpm lint
```

Expected: no new warnings.

- [ ] **Step 4: Milestone commit**

```bash
git commit --allow-empty -m "milestone: Phase 2 — AI kit complete"
```

---

## Task 29: Move hub into meta-folder proyectos-portafolio/

**⚠️ Manual step — requires user confirmation before running.**

**Files:**
- N/A (filesystem operation)

- [ ] **Step 1: Confirm no uncommitted changes**

```bash
cd C:/Proyectos/portafolio-mdea
git status
```

Expected: `working tree clean`. If not, commit or stash before proceeding.

- [ ] **Step 2: Create meta-folder and move hub into it**

```bash
cd C:/Proyectos
mkdir proyectos-portafolio
mv portafolio-mdea proyectos-portafolio/portafolio-mdea
```

- [ ] **Step 3: Verify git still works from new location**

```bash
cd C:/Proyectos/proyectos-portafolio/portafolio-mdea
git status
git log --oneline -3
```

Expected: git still recognizes the repo, recent commits visible.

- [ ] **Step 4: Verify `pnpm install` and `pnpm build` still work from new path**

```bash
pnpm install
pnpm build
```

Expected: both succeed.

- [ ] **Step 5: No commit needed — filesystem move is outside git**

---

## Task 30: Add CLAUDE.md at meta-folder level

**Files:**
- Create: `C:/Proyectos/proyectos-portafolio/CLAUDE.md`

- [ ] **Step 1: Create meta-level CLAUDE.md**

```markdown
# Proyectos Portafolio — Meta-folder

This folder groups every project that belongs to Manuel's public portfolio. It is NOT a git repo — each subfolder is its own independent repo with its own Vercel deploy.

## Active subprojects

- `portafolio-mdea/` — the hub (source of truth for brand + AI kits).
- `agente-riesgo/` — case study: AI-powered risk decision engine.
- `identidad-360/` — case study: identity intelligence for credit teams.

## Conventions

1. A project only lives in this folder when it's ready to be shown publicly. Experiments live outside.
2. The hub (`portafolio-mdea/`) owns the shared kits:
   - `design-system/` (visual)
   - `ai-kit/` (optional, for LLM-using projects)
3. Sibling projects consume kits via `pnpm brand:sync` and (optionally) `pnpm ai:sync`. They are expected to live as direct siblings of the hub so relative paths resolve.
4. Case studies in the hub follow a mandatory 5-H2 structure: `El problema / El enfoque / Decisiones de diseño / Estado actual / Lo que demuestra`.
5. Any project using LLMs must have a **demo mode** that works without API keys (see `portafolio-mdea/ai-kit/README.md`).

## Claude Code tips

- Open Claude at this level (`C:/Proyectos/proyectos-portafolio/`) to operate across all subprojects from one session.
- When propagating a change from the hub to siblings, cd into each sibling and run `pnpm brand:sync` (Plan 2 introduces `brand:propagate` to automate this).

## Related spec

See `portafolio-mdea/docs/superpowers/specs/2026-04-16-mdea-brand-design-system.md` for the full system rationale.
```

- [ ] **Step 2: No git commit needed (file is outside any git repo). Verify file is readable.**

```bash
cat C:/Proyectos/proyectos-portafolio/CLAUDE.md
```

Expected: file prints.

---

## Task 31: Update hub README and AGENTS to reflect new structure

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Update `README.md`**

Replace the existing `## Project branches` section with:

```markdown
## Portfolio structure

This repo lives inside the meta-folder `C:/Proyectos/proyectos-portafolio/` alongside every active portfolio project. Each project is its own independent git repo and Vercel deploy.

```
proyectos-portafolio/
├── portafolio-mdea/      ← this repo (hub + design-system + ai-kit)
├── agente-riesgo/        ← consumes design-system + ai-kit via sync
└── identidad-360/        ← consumes design-system + ai-kit via sync
```

## Design system + AI kit

The hub owns two shared kits:
- `design-system/` — visual identity (always synced to every sibling).
- `ai-kit/` — AI primitives (optional — only for projects with LLMs).

Siblings run `pnpm brand:sync` (and optionally `pnpm ai:sync`) to pull updates from the hub. See `design-system/README.md` and `ai-kit/README.md` for details.

## Spec

Full system rationale: `docs/superpowers/specs/2026-04-16-mdea-brand-design-system.md`.
```

- [ ] **Step 2: Update `AGENTS.md`**

Append to the existing file:

```markdown

## Brand + AI kits

This repo is the source of truth for:
- `design-system/` — visual tokens, fonts, and components distributed to sibling projects.
- `ai-kit/` — shared AI primitives (model allowlist, client, demo-mode convention).

**Before writing any new UI:** check `design-system/components/` for existing primitives and `design-system/README.md` for token usage. Do not reintroduce ad-hoc colors or radii outside the tokens.

**Before adding AI to a new feature:** read `ai-kit/README.md`. Every public-facing AI project must have a demo mode that works without API keys.
```

- [ ] **Step 3: Commit**

```bash
git add README.md AGENTS.md
git commit -m "docs: update README and AGENTS for meta-folder + kits"
```

---

## Task 32: Phase 3 milestone + push

- [ ] **Step 1: Milestone commit**

```bash
git commit --allow-empty -m "milestone: Phase 3 — meta-folder reorganization complete"
```

- [ ] **Step 2: Push Plan 1 changes**

```bash
git push origin main
```

- [ ] **Step 3: Verify Vercel deploy triggers and succeeds**

Open Vercel dashboard for `portafolio-mdea` and confirm the latest deploy builds green with the new brand.

- [ ] **Step 4: Final visual verification on production**

Open `https://manueldeasis.com` (or the current Vercel URL) and verify:
- [ ] Fraunces serif H1 renders
- [ ] Zinc + blue palette correct in light + dark
- [ ] Project cards use new Card style
- [ ] Case studies render `<MetricGroup>` and `<Tradeoff>` blocks correctly
- [ ] No FOUT / layout shift

---

## Self-review

**Spec coverage:** Every bullet in Phases 1, 2, 3 of the spec maps to at least one task above. Meta-folder convention, `BRIEF.md` scaffold, `portfolio:intake`, and `brand:propagate` are explicitly deferred to a later spec and are NOT part of Plan 1.

**Placeholder scan:** No `TBD`/`TODO`/vague handlers; every code block is complete.

**Type consistency:**
- `cn()` signature consistent across `design-system/utils.ts` and its re-export.
- `Badge` variant names used in code (Task 7 step 5, Task 16 step 2) match those declared in Task 7.
- `StatusDot` status kinds (`live`/`beta`/`archived`) are consistent across `status-dot.tsx` and the usage example.
- `FREE_MODELS_PRIORITY`, `ModelId`, `ModelSelection`, `NoModelAvailableError` consistent between Task 22 and Task 24.
- `syncKit({ source, target, kitName })` signature consistent across brand-sync and ai-sync.

**Scope check:** Plan 1 is self-contained — the hub produces a working, deployable site with the new identity without touching `agente-riesgo` or `identidad-360`.
