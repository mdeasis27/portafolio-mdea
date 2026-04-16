# Design System Changelog

## v1.0.0 — 2026-04-16

### Palette established
- **Primary**: Indigo `#6366f1` — identidad principal MDEA
- **Accent**: Cyan `#22d3ee` — highlights y CTAs secundarios
- **Dark surfaces**: Slate 900/800/700 (`#0f172a`, `#1e293b`, `#334155`)
- **Text**: Slate 100/400 (`#f1f5f9`, `#94a3b8`)

### Applied to
- `src/app/globals.css` — `--primary` y `--brand-*` tokens actualizados
- `design-system/tokens.ts` — fuente de verdad TS

---

When the palette changes, update `tokens.ts` → add an entry here → notify all
`project/*` branches to apply the diff to their own `globals.css`.
