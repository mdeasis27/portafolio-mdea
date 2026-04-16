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
