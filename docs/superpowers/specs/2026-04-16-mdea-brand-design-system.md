# MDEA Portfolio — Brand + AI System Spec

**Fecha:** 2026-04-16 (v2 con meta-folder y AI kit)
**Autor:** Manuel De Asís (con Claude Code)
**Estado:** Aprobado — listo para implementación

## Objetivo

Unificar la experiencia del portafolio (`manueldeasis.com`) y de cada proyecto individual publicado (hoy: `agente-riesgo`, `identidad-360`; futuros: ~1 por mes) bajo un sistema coherente con tres planos:

1. **Identidad visual** — misma paleta, tipografía, componentes entre hub y proyectos.
2. **Capa de AI** — mismos modelos free, misma lógica de fallback, mismo modo demo obligatorio.
3. **Ergonomía operativa** — una sola sesión de Claude Code controla todos los proyectos desde una carpeta madre `proyectos-portafolio/`.

El reclutador que abra tres URLs distintas debe percibir inmediatamente que vienen de la misma persona y del mismo estándar, **y debe poder probar cualquiera de ellas sin API key y sin bloqueos**.

## Problema

1. Cada proyecto desplegado (`agente-riesgo`, `identidad-360`) tiene su propia paleta, sus propios botones y su propio tono visual — resultado de haber sido generado con distintos templates de shadcn/v0.
2. El `design-system/` actual del hub define tokens, pero los proyectos individuales no los consumen; existen en islas separadas.
3. Los case studies en MDX no tienen estructura obligatoria — cada uno puede decorarse diferente.
4. La paleta actual (`indigo #6366f1 + cyan #22d3ee`) está visualmente "AI-startup genérica": se pierde entre portafolios tech idénticos.
5. Cada proyecto con AI reimplementa su propia lógica de modelos OpenRouter, fallbacks, y manejo de rate limits — con riesgo de que una demo pública se rompa justo cuando llega un reclutador.
6. Los proyectos del portafolio viven dispersos en el filesystem; no hay un "centro de control" desde donde gestionarlos coherentemente.

## No-objetivos

- No construir un sistema de diseño extenso (accordion, tabs, modal, etc.). El kit cubre solo lo que ≥2 de los 3 repos usan.
- No publicar un paquete npm ni montar un registry privado (overkill para un portafolio de un solo autor).
- No montar un monorepo real con `pnpm workspaces`, Turbo, o Nx. Los proyectos del portafolio son deliberadamente independientes; el overhead no se justifica con volumen de 1 case study/mes.
- No rediseñar la arquitectura de información del portafolio (estructura de páginas queda igual).
- No incluir el proyecto `career-ops` (herramienta interna de búsqueda de empleo; no es case study público — ver memoria `feedback_career_ops_scope`).
- No convertir la capa AI en un producto SDK reusable por terceros. El `ai-kit` es solo para proyectos del portafolio.

## Estructura de trabajo — Meta-folder `proyectos-portafolio/`

### Convención del filesystem

```
C:/Proyectos/
├── proyectos-portafolio/              ← carpeta madre (NO es git repo)
│   ├── portafolio-mdea/               ← hub (git repo propio + Vercel propio)
│   ├── agente-riesgo/                 ← proyecto (git propio + Vercel propio)
│   ├── identidad-360/                 ← proyecto (git propio + Vercel propio)
│   └── [futuros proyectos]/
└── experimentos/                      ← proyectos en rough, fuera del portafolio
```

### Reglas de la carpeta madre

1. **Un proyecto solo entra a `proyectos-portafolio/` cuando está listo para mostrar.** Mientras es prototipo, vive en `experimentos/` u otra ubicación. Entrar a la carpeta madre = decisión consciente de "esto es parte de mi portafolio público".
2. **La carpeta madre NO es un git repo.** Cada subproyecto mantiene su propio git, su propio deploy, su propia historia. Esto preserva autonomía y evita los problemas de un monorepo improvisado.
3. **Claude Code se abre al nivel de la carpeta madre** (`C:/Proyectos/proyectos-portafolio/`), no al nivel del subproyecto. Desde ahí una sola sesión puede leer, editar, commitear y deployar en cualquier subproyecto.
4. **Los subproyectos son hermanos en el filesystem.** Esto garantiza que `pnpm brand:sync --from=../portafolio-mdea` funciona sin configuración adicional.

### Trade-off aceptado

No se puede hacer un commit atómico cross-repo. Un cambio que toque la marca y los 3 proyectos requiere: 1 commit en el hub + 1 commit por proyecto afectado. Este costo se mitiga con el script `brand:propagate` (Fase 4) que automatiza el loop.

### Ergonomía para Claude Code

Al abrir Claude Code en la carpeta madre:
- `CLAUDE.md` del hub se sigue cargando (al entrar al subdirectorio del hub).
- Para trabajar en un proyecto específico, Claude corre comandos con `cd <subproyecto> && <comando>` o usa rutas absolutas.
- Memoria personal (`.claude/`) sigue siendo compartida; los pointers en `MEMORY.md` referencian rutas por proyecto cuando aplica.

## Decisiones de diseño — Identidad visual

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

## Decisiones de diseño — AI Kit

### 9. Modo demo obligatorio

**Regla (al mismo nivel que las 5 secciones H2):** *Todo proyecto del portafolio que usa LLM debe tener dos modos claramente separados:*

| Modo | Qué hace | Cuándo aparece |
|---|---|---|
| **Demo** (default) | Casos pre-computados reproducibles, cero API calls, siempre funciona | Por defecto en producción pública, sin API key. Primero que ve el reclutador. |
| **Live** | Corre contra OpenRouter con los free models compartidos | Un botón opt-in "Try with real AI". El UI maneja rate limits gracefully y sugiere volver al modo demo si falla. |

**Por qué obligatorio:** OpenRouter free tier tiene rate limits por IP (~50 requests/día). Un case study que reciba 200 visitas en un día se rompería para el visitante #51+. El modo demo garantiza que la demo nunca está rota, lo cual es la diferencia entre "otro tech bro con API keys" y "alguien que pensó el producto para el mundo real".

**Implementación obligatoria:** cada caso demo produce un resultado determinista (mismo input → mismo output) usando hash del input + datos pre-computados.

### 10. Modelos OpenRouter compartidos

Lista priorizada viviendo en `ai-kit/models.ts` del hub:

```ts
export const FREE_MODELS_PRIORITY = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'deepseek/deepseek-chat-v3:free',
  // ordenados por calidad de razonamiento
]
```

**Flujo runtime:**
1. `client.ts` consulta OpenRouter `/api/v1/models` para saber qué está disponible.
2. Cruza con la allowlist priorizada.
3. Toma el primero disponible.
4. Cachea la decisión 10 minutos (no consultar en cada request).
5. Si todos fallan, el cliente devuelve un error estructurado que la UI traduce a "modelo no disponible — prueba el modo demo".

**Cuando un modelo se deprecia:** se actualiza `FREE_MODELS_PRIORITY` en el hub, se corre `pnpm ai:sync` en cada proyecto afectado, commit, deploy. No hay lógica dispersa que actualizar.

### 11. Variables de entorno convencionales

Idénticas en todos los proyectos:

| Var | Propósito | Default |
|---|---|---|
| `OPENROUTER_API_KEY` | Tu key para modo live | (opcional — sin ella, solo demo funciona) |
| `NEXT_PUBLIC_MDEA_DEMO_DEFAULT` | Forzar demo como modo inicial | `true` en producción pública |
| `MDEA_AI_CACHE_TTL_MS` | Cache de discovery de modelos | `600000` (10 min) |

## Arquitectura — Dos kits portables con sync

### Estructura en el hub

Ambos kits viven en `portafolio-mdea/` como fuente de verdad:

```
portafolio-mdea/
├── design-system/           # Kit visual (siempre sincronizado a todos los proyectos)
│   ├── tokens.css           # Variables CSS (paleta, radio, etc.)
│   ├── tokens.ts            # Tipos TS y mirror de tokens
│   ├── fonts.ts             # next/font (Inter + Fraunces + JetBrains Mono)
│   ├── components/
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── separator.tsx
│   │   ├── status-dot.tsx
│   │   └── index.ts
│   ├── utils.ts             # cn() helper
│   ├── CHANGELOG.md
│   └── README.md
│
├── ai-kit/                  # Kit AI (opcional — solo proyectos con LLM)
│   ├── models.ts            # Allowlist priorizada de free models
│   ├── client.ts            # createMdeaAi() con fallback dinámico y cache
│   ├── rate-limit.tsx       # Hook + componente UI para rate limits
│   ├── demo-mode.ts         # Types y helpers del patrón demo-vs-live
│   ├── CHANGELOG.md
│   └── README.md
│
└── scripts/
    ├── brand-sync.mjs       # Copia design-system/ a otro repo
    ├── ai-sync.mjs          # Copia ai-kit/ a otro repo
    └── brand-propagate.mjs  # Corre sync + commit + push en todos los hermanos
```

### Scripts de sync

```bash
# Desde un proyecto hermano (ej. agente-riesgo):
pnpm brand:sync               # Copia design-system/ del hub (asume hermano ../portafolio-mdea)
pnpm ai:sync                  # Copia ai-kit/ del hub

# Desde el hub, para propagar un cambio a todos los proyectos:
pnpm brand:propagate          # Corre sync + commit + push en cada hermano que tenga el kit
```

**Cómo funciona el sync:** cada proyecto que consume un kit tiene un script en su `package.json` que invoca el script del hub por ruta relativa (`node ../portafolio-mdea/scripts/brand-sync.mjs`). La implementación es ~40 líneas de Node sin dependencias nuevas: lista archivos, compara hash, copia lo que cambió, elimina lo obsoleto, escribe un `sync-manifest.json` con timestamp y versión.

**Cómo funciona `brand:propagate`:** corre desde el hub, itera sobre los hermanos declarados en `scripts/portfolio-members.json` (lista mantenida manualmente), para cada uno:
1. `cd <hermano> && pnpm brand:sync && pnpm ai:sync` (si aplica)
2. Detecta si hubo cambios con `git status --porcelain`
3. Si hubo: `git add -A && git commit -m "chore: sync brand + ai kit vX.Y.Z from hub"`
4. Pregunta al usuario antes de hacer push (no auto-push — confirmación explícita)

### CHANGELOG y versionado

Cada kit tiene su propio `CHANGELOG.md`. Sin semver estricto — solo historial legible con fecha y lista de cambios. Ejemplo:

```
## 1.1.0 — 2026-04-16
- Paleta reemplazada: indigo+cyan → zinc+blue-700
- Tipografía: Inter + Fraunces + JetBrains Mono
- Nuevo componente: StatusDot
```

## Plan de implementación

### Fase 1 — Hub: identidad visual (~4–6h)

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

### Fase 2 — Hub: AI kit (~2–3h)

1. Crear `ai-kit/models.ts` extrayendo la allowlist y lógica de `agente-riesgo` (ya tiene el patrón implementado).
2. Crear `ai-kit/client.ts` con `createMdeaAi()` que envuelve Vercel AI SDK + OpenRouter + cache + fallback.
3. Crear `ai-kit/rate-limit.tsx` (hook + componente UI "rate limit hit → switch to demo").
4. Crear `ai-kit/demo-mode.ts` con types y helper `defineDemoCase()`.
5. Crear `scripts/ai-sync.mjs` (mismo patrón que brand-sync).
6. Documentar en `ai-kit/README.md` con ejemplo de uso.
7. Commit y push.

### Fase 3 — Reorganizar filesystem al meta-folder (~30min)

1. Crear `C:/Proyectos/proyectos-portafolio/`.
2. Mover `portafolio-mdea/` adentro.
3. Mover `agente-riesgo/` y `identidad-360/` adentro (clonar si no están localmente).
4. Verificar que cada repo mantiene su git intacto (`git status` en cada uno).
5. Abrir Claude Code en el nuevo nivel (`C:/Proyectos/proyectos-portafolio/`) para las siguientes fases.

### Fase 4 — Migrar agente-riesgo (~3h)

1. Correr `pnpm brand:sync` desde agente-riesgo.
2. Reemplazar imports de componentes locales por los del kit.
3. Actualizar `globals.css` con los nuevos tokens.
4. Correr `pnpm ai:sync` y reemplazar la lógica actual de modelos por `createMdeaAi()` del kit.
5. Asegurar que el modo demo (María, Carlos, Ana) sigue funcional con la nueva convención.
6. Verificar visual y funcional en dev.
7. Deploy a Vercel y verificar producción con y sin API key.
8. Commit + push.

### Fase 5 — Migrar identidad-360 (~3h)

Idéntica a Fase 4.

### Fase 6 — Orquestación cross-repo (~1.5h)

1. Crear `scripts/brand-propagate.mjs` en el hub.
2. Crear `scripts/portfolio-members.json` con lista actual de hermanos.
3. Documentar uso en `portafolio-mdea/README.md`.
4. Actualizar `AGENTS.md` con mención de la carpeta madre y convenciones.
5. Prueba: hacer un cambio trivial en tokens del hub, correr `brand:propagate`, verificar que los 2 proyectos reciben el cambio y pasan build.

### Total estimado

14–17.5 horas. Divisible en 3–4 sesiones. Sin bloqueos externos — todo es local + deploys.

## Verificación

Al terminar cada fase:

1. **Visual smoke test manual** en dev (light + dark, móvil + desktop).
2. **Paridad entre repos:** abrir los 3 sitios lado a lado — deben percibirse como la misma casa.
3. **Build pasa:** `pnpm build` sin errores en cada repo.
4. **Lint pasa:** `pnpm lint` sin warnings.
5. **Para proyectos AI:** la demo en producción funciona con y sin API key; si OpenRouter está caído, el modo demo sigue viable.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Los proyectos individuales tienen código que depende de clases Tailwind específicas de la paleta anterior | Revisar grep `indigo`/`cyan`/`6366f1` en cada repo antes de migrar; reemplazar sistemáticamente |
| Fraunces como serif agrega ~40kb al bundle | Cargar solo weight 500 + optical sizing variable; se queda bajo 25kb con subsetting. Aceptable para un portafolio |
| Cambiar la paleta del `ring` rompe algún focus state en `base-ui` | Verificar focus visible en todos los componentes interactivos tras migración |
| Los 2 case studies existentes no cumplen exactamente las 5 secciones H2 | Ya cumplen — verificado en brainstorming. Ningún cambio estructural requerido |
| Al sincronizar a otros repos, rutas de import pueden romper | El kit usa imports relativos dentro de `design-system/`; los repos consumidores usan path alias `@/design-system/...` en `tsconfig.json` |
| Free models de OpenRouter se deprecan sin aviso | Allowlist centralizada en `ai-kit/models.ts` + lógica de discovery dinámico: si un modelo desaparece, el siguiente de la lista toma su lugar sin cambios en proyectos |
| Rate limits de OpenRouter rompen demos públicas | Modo demo obligatorio con datos pre-computados — nunca depende de API externa |
| Mover los repos a carpeta madre rompe deploys Vercel | Vercel se conecta por repo, no por ruta local — mover carpetas en el filesystem no afecta los deploys (mientras el `.git` remote siga apuntando al repo correcto) |
| `brand:propagate` podría auto-pushear cambios sin revisión | El script requiere confirmación interactiva antes de push; sync + commit son automáticos pero push es manual |

## Success criteria

Al terminar las 6 fases:

- [ ] `C:/Proyectos/proyectos-portafolio/` existe con los 3 subproyectos adentro.
- [ ] Hub y los 2 proyectos desplegados comparten paleta, tipografía y componentes base.
- [ ] Un reclutador que abre los 3 sitios lado a lado los identifica como "la misma casa".
- [ ] **Un reclutador puede usar cualquier demo en vivo sin API key y obtener un resultado real — siempre.**
- [ ] Crear un proyecto nuevo desde cero toma <30 minutos desde crear la carpeta hasta primer deploy (con brand + ai kit aplicados).
- [ ] Cambiar un token (ej. el azul) se propaga a los 3 repos vía `brand:propagate` en <10 minutos totales incluyendo deploys.
- [ ] Cada case study en el hub sigue las 5 secciones H2 obligatorias.
- [ ] Cada proyecto con AI tiene modo demo funcional cuando se accede sin API key.
- [ ] Una sola sesión de Claude Code abierta en la carpeta madre puede gestionar los 3 repos (edición + commit + deploy por proyecto).

## Referencias

- Memoria: `user_profile.md`, `project_thesis.md`, `project_stack.md`, `feedback_tone.md`
- Inspiración visual: Linear Journal, Stripe Press, Rauno Freiberg, Every.to
- Tipografía: Fraunces (Google Fonts), Inter (Google Fonts), JetBrains Mono (JetBrains)
- Patrón AI demo mode: inspirado en el modo "María/Carlos/Ana" ya implementado en `agente-riesgo`
