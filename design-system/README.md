# MDEA Design System

Source of truth for brand tokens used across all projects in this repo.

## Paleta de marca

| Token         | Hex       | Uso                            |
|---------------|-----------|--------------------------------|
| `primary`     | `#6366f1` | Botones, links, identidad      |
| `accent`      | `#22d3ee` | Highlights, CTAs secundarios   |
| `dark`        | `#0f172a` | Fondos oscuros, texto principal|
| `surface`     | `#1e293b` | Cards, componentes             |
| `muted`       | `#334155` | Bordes, separadores            |
| `textPrimary` | `#f1f5f9` | Texto sobre fondo oscuro       |
| `textSecondary`| `#94a3b8`| Texto secundario / subtítulos  |

## Cómo usar

Import en JS/TS:
```ts
import { brand } from '@/design-system/tokens'
// brand.primary === '#6366f1'
```

En CSS (Tailwind 4 — ya configurado en globals.css):
```css
/* Variables disponibles en toda la app */
--brand-primary  /* #6366f1 indigo */
--brand-accent   /* #22d3ee cyan   */
--primary        /* mismo indigo — conectado al sistema de componentes */
```

En Tailwind classes:
```html
<div class="bg-brand-primary text-white">...</div>
<span class="text-brand-accent">...</span>
```

## Crear un proyecto nuevo

```bash
# 1. Crear rama desde la plantilla
git checkout -b project/nombre-proyecto project/template

# 2. Abrir en worktree para desarrollo paralelo
git worktree add ../mdea-nombre-proyecto project/nombre-proyecto
```

La rama `project/template` ya tiene los tokens copiados y Next.js configurado.

## Actualizar la paleta

1. Editar `design-system/tokens.ts`
2. Actualizar `src/app/globals.css` (variables CSS)
3. Agregar entrada en `design-system/CHANGELOG.md`
4. Notificar a las ramas `project/*` para que apliquen el diff en su propio `globals.css`

## Componentes UI

Los componentes atómicos viven en `src/components/ui/` (Badge, Button, Card, Separator).
Están construidos con base-ui y usan los tokens de `globals.css` automáticamente.
