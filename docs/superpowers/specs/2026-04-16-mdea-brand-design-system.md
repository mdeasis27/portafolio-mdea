# MDEA Brand — Design System Spec

**Fecha:** 2026-04-16
**Autor:** Manuel De Asís (con Claude Code)
**Estado:** Aprobado — listo para implementación

## Objetivo

Unificar la identidad visual del portafolio (`manueldeasis.com`) y de cada proyecto individual que se publique (hoy: `agente-riesgo`, `identidad-360`; futuros: 1 por mes) bajo una sola marca: simple, limpia, profesional, con buen gusto ejecutivo.

El reclutador que abra tres URLs distintas debe percibir inmediatamente que vienen de la misma persona y del mismo estándar.

## Problema

1. Cada proyecto desplegado (`agente-riesgo`, `identidad-360`) tiene su propia paleta, sus propios botones y su propio tono visual — resultado de haber sido generado con distintos templates de shadcn/v0.
2. El `design-system/` actual del hub define tokens, pero los proyectos individuales no los consumen; existen en islas separadas.
3. Los case studies en MDX no tienen estructura obligatoria — cada uno puede decorarse diferente.
4. La paleta actual (`indigo #6366f1 + cyan #22d3ee`) está visualmente "AI-startup genérica": se pierde entre portafolios tech idénticos.

## No-objetivos

- No construir un sistema de diseño extenso (accordion, tabs, modal, etc.). El kit cubre solo lo que ≥2 de los 3 repos usan.
- No publicar un paquete npm ni montar un registry privado (overkill para un portafolio de un solo autor).
- No rediseñar la arquitectura de información del portafolio (estructura de páginas queda igual).
- No incluir el proyecto `career-ops` (herramienta interna de búsqueda de empleo; no es case study público — ver memoria `feedback_career_ops_scope`).

## Decisiones de diseño

### 1. Paleta — zinc monocromo + 1 acento azul

Un solo acento. El resto del sistema es escala de grises (`zinc`).

**Por qué mono + 1 acento:** Diferencia del 95% de portafolios tech que son indigo/cyan/gradientes. Deja que el contenido (case studies honestos con tradeoffs) sea el protagonista. Máxima disciplina → máxima elegancia. Atemporal.

**Por qué azul `#1D4ED8` (blue-700) y no verde petróleo:** Azul comunica inmediatamente "finance/fintech/serious". Verde petróleo era más original pero implicaba más riesgo interpretativo. Dado el posicionamiento "executive who builds" con track record en Rappi Card y Grupo MAG, azul es congruente y conservador en el sentido correcto.

**Tokens CSS:**

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--background` | zinc-50 `#fafafa` | zinc-950 `#09090b` | Fondo global |
| `--surface` | white | zinc-900 `#18181b` | Cards, panels |
| `--border` | zinc-200 `#e4e4e7` | zinc-800 `#27272a` | Bordes sutiles |
| `--foreground` | zinc-950 | zinc-50 | Texto principal |
| `--muted` | zinc-500 `#71717a` | zinc-400 `#a1a1aa` | Texto secundario, metadata |
| `--accent` | `#1D4ED8` | `#3B82F6` (blue-500) | Links, focus, status dots, un solo acento visual |
| `--success` / `--warning` / `--danger` | Tailwind stock | — | Solo para UI funcional dentro de productos, nunca en chrome |

El accent en dark es más claro (`blue-500`) para mantener contraste WCAG AA sobre `zinc-950`.

### 2. Tipografía — híbrido editorial-ejecutivo

| Fuente | Uso |
|---|---|
| **Inter** (variable, 400/500/600) | Body, UI, nav, cards, metadata |
| **Fraunces** (variable, weight 500, optical size on) | Hero H1 del home + H1 de case studies **únicamente** |
| **JetBrains Mono** (400) | Code blocks, eyebrow labels uppercase, tags de stack |

**Por qué Fraunces en H1:** El serif es el elemento de marca que comunica "esto lo escribió alguien que piensa en fondo, no solo stack técnico." Aparece en 2 lugares específicos; el resto del sitio es Inter limpio. Patrón idéntico al de Stripe Press, Linear Journal, Every.to.

**Implementación:** `next/font/google` — las 3 fuentes se cargan localmente vía Next.js, sin flash.

### 3. Layout — 3 plantillas rígidas

**3.1 Home (`/`)**
- Nav fino (56px alto) con logo "MDEA" + links
- Hero: eyebrow mono → H1 Fraunces 56px → subhead Inter 18px → CTAs
- Separator fino
- Selected work: grid 3-col de `ProjectCard` (featured)
- Max-width 1040px

**3.2 Projects index (`/projects`)**
- Mismo patrón de header (eyebrow → título Fraunces → descripción)
- Grid completo de `ProjectCard`
- Max-width 1040px

**3.3 Case study (`/projects/[slug]`)**
- Breadcrumb "← All projects"
- Badges fila: `[STATUS] [YEAR] [Published date]`
- H1 Fraunces 48px (título)
- Subhead Inter 20px (summary)
- Meta box con borde: `ROLE / STACK / LINKS (Live + Source)`
- Separator
- **MDX content con 5 secciones H2 obligatorias** (ver §4)
- Separator
- Navegación inferior: ← Back + Next project →
- Max-width 720px para prose

### 4. Convención de estructura para case studies

Cada `content/projects/*.mdx` **debe** tener estas 5 secciones H2 exactas, en este orden:

1. `## El problema`
2. `## El enfoque`
3. `## Decisiones de diseño`
4. `## Estado actual`
5. `## Lo que demuestra`

Los 2 case studies actuales (`agente-riesgo.mdx`, `identidad-360.mdx`) ya cumplen esta convención. Formalizarla como regla significa: un reclutador que leyó uno sabe dónde buscar en el siguiente. **Consistencia del contenido = consistencia de marca.**

### 5. Componentes base — 5 piezas

Viven en `design-system/components/` (kit portable):

| Componente | Variantes |
|---|---|
| `Button` | `default`, `outline`, `ghost`, `link` |
| `Badge` | `default`, `outline`, `status-shipped`, `status-beta`, `status-archived` |
| `Card` | `default` (borde `--border`, radio 8px, hover lift sutil) |
| `Separator` | horizontal line `--border` |
| `StatusDot` | `live`, `beta`, `archived` (6px dot + label) |

**Regla de oro del kit:** *"Si no aparece en ≥2 de los 3 repos, no pertenece al kit."*

### 6. Componentes MDX — 4 piezas (solo hub)

Viven en `src/lib/mdx-components.tsx`. No se distribuyen al kit portable; son exclusivos de case studies del hub.

| Componente | Prop shape | Uso |
|---|---|---|
| `<Metric>` | `value: string; label: string; description?: string` | Número destacado dentro de prose |
| `<MetricGroup>` | children: `<Metric>[]` | Grid 2–4 cols de Metrics |
| `<Tradeoff>` | `title: string; children` | Caja con borde-izquierdo azul (`--accent`) para decisiones de diseño |
| `<Callout>` | `type: "note" \| "warn"; children` | Avisos al margen |

### 7. Radio y espaciado

- **Radio uniforme:** `8px` (todas las esquinas, todos los componentes). Un solo valor — no 4 escalas.
- **Espaciado:** múltiplos de `4px` (Tailwind default).
- **Max-widths:** `720px` (artículos / case study prose), `1040px` (listados / home).

### 8. Modos claro/oscuro

- Ambos modos soportados vía `next-themes`.
- Default: `system` — respeta la preferencia del OS del usuario.
- Toggle visible en el nav (icono sun/moon).
- Todos los tokens tienen valor light y dark; no hay hardcoded colors fuera del sistema.

## Arquitectura — Kit portable con sync

### Estructura del kit

Vive en el hub (`portafolio-mdea/design-system/`) como fuente de verdad:

```
design-system/
├── tokens.css          # Variables CSS (paleta, radio, etc.)
├── tokens.ts           # Tipos TS y mirror de tokens para consumo programático
├── fonts.ts            # Configuración de next/font (Inter + Fraunces + JetBrains Mono)
├── components/
│   ├── button.tsx
│   ├── badge.tsx
│   ├── card.tsx
│   ├── separator.tsx
│   ├── status-dot.tsx
│   └── index.ts
├── utils.ts            # cn() helper
├── CHANGELOG.md        # Historial de cambios de versión
└── README.md           # Guía de uso y sync
```

### Script de sync

Archivo: `scripts/brand-sync.mjs` en el hub.

```
Uso desde otro repo:
  pnpm brand:sync --from=../portafolio-mdea

Efecto:
  Copia design-system/ del hub hacia design-system/ del repo actual,
  preservando permisos y borrando archivos obsoletos.
```

Cada proyecto que consume el kit agrega un script `brand:sync` en su `package.json` que invoca el script del hub (o replica la lógica).

**Trade-off aceptado:** el usuario debe correr el sync manualmente en cada proyecto cuando la marca cambie. Es aceptable dado el volumen bajo de cambios esperados (≤1/año tras el setup inicial) y evita la complejidad de publicar un paquete npm.

### CHANGELOG y versionado

Cada cambio de paleta o componente base se registra en `design-system/CHANGELOG.md` con formato:

```
## 1.1.0 — 2026-04-16
- Paleta reemplazada: indigo+cyan → zinc+blue-700
- Tipografía: Inter + Fraunces + JetBrains Mono (antes: Geist único)
- Nuevo componente: StatusDot
```

No se usa semver estricto. Solo historial legible.

## Plan de implementación

### Fase 1 — Hub (~4–6h)
1. Instalar `next/font` con Inter + Fraunces + JetBrains Mono.
2. Reescribir `design-system/tokens.ts` y crear `tokens.css` con paleta zinc + blue-700.
3. Actualizar `src/app/globals.css` reemplazando los valores oklch indigo/cyan.
4. Reescribir los 5 componentes base (`Button`, `Badge`, `Card`, `Separator`, `StatusDot`).
5. Agregar los 4 componentes MDX (`Metric`, `MetricGroup`, `Tradeoff`, `Callout`) en `src/lib/mdx-components.tsx`.
6. Ajustar los 2 MDX existentes a las convenciones — añadir bloques `<Metric>` y `<Tradeoff>` donde aplique (sin inventar datos).
7. Actualizar páginas (`home`, `projects`, `[slug]`) con las plantillas formales.
8. Crear `scripts/brand-sync.mjs`.
9. Documentar uso en `design-system/README.md`.
10. Verificación local: `pnpm dev` + smoke test visual light/dark.
11. Commit y push.

### Fase 2 — agente-riesgo (~2h)
1. Clonar/checkout repo.
2. Correr `pnpm brand:sync --from=../portafolio-mdea`.
3. Reemplazar imports de componentes locales por los del kit.
4. Actualizar `globals.css` con los nuevos tokens (si difiere).
5. Verificar visual en dev.
6. Deploy a Vercel y verificar producción.
7. Commit + push.

### Fase 3 — identidad-360 (~2h)
Idéntica a Fase 2.

### Fase 4 — Documentación del flujo (~1h)
- Actualizar `design-system/README.md` con instrucciones de uso para proyectos futuros.
- Actualizar `AGENTS.md` con mención del brand kit como fuente de verdad.
- Actualizar `README.md` del hub con comando de bootstrap para nuevos proyectos.

### Total estimado
10–12 horas. Divisible en 2–3 sesiones. Sin bloqueos externos — todo es local + deploy.

## Verificación

Al terminar cada fase:

1. **Visual smoke test manual** en dev (light + dark, móvil + desktop).
2. **Paridad entre repos:** abrir `manueldeasis.com`, `agente-riesgo.vercel.app`, `identidad-360.vercel.app` lado a lado — deben percibirse como la misma casa.
3. **Build pasa:** `pnpm build` sin errores en cada repo.
4. **Lint pasa:** `pnpm lint` sin warnings.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Los proyectos individuales tienen código que depende de clases Tailwind específicas de la paleta anterior | Revisar grep `indigo`/`cyan`/`6366f1` en cada repo antes de migrar; reemplazar sistemáticamente |
| Fraunces como serif agrega ~40kb al bundle | Cargar solo weight 500 + optical sizing variable; se queda bajo 25kb con subsetting. Aceptable para un portafolio |
| Cambiar la paleta del `ring` rompe algún focus state en `base-ui` | Verificar focus visible en todos los componentes interactivos tras migración |
| Los 2 case studies existentes no cumplen exactamente las 5 secciones H2 | Ya cumplen — verificado en brainstorming. Ningún cambio estructural requerido |
| Al sincronizar a otros repos, rutas de import pueden romper | El kit usa imports relativos dentro de `design-system/`; los repos consumidores usan path alias `@/design-system/...` en `tsconfig.json` |

## Success criteria

Al terminar las 4 fases:

- [ ] Hub y los 2 proyectos desplegados comparten paleta, tipografía y componentes base.
- [ ] Un reclutador que abre los 3 sitios lado a lado los identifica como "la misma casa".
- [ ] Crear un proyecto nuevo toma menos de 15 minutos desde `pnpm brand:sync` hasta primer deploy.
- [ ] Cambiar un token (ej. el azul) se propaga a los 3 repos en <30 minutos totales (sync + commit + deploy en cada uno).
- [ ] Cada case study en el hub sigue las 5 secciones H2 obligatorias.

## Referencias

- Memoria: `user_profile.md`, `project_thesis.md`, `project_stack.md`, `feedback_tone.md`
- Inspiración visual: Linear Journal, Stripe Press, Rauno Freiberg, Every.to
- Tipografía: Fraunces (Google Fonts), Inter (Google Fonts), JetBrains Mono (JetBrains)
