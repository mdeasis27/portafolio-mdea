# Project Story Pages — Pilot: Compuerta

## Purpose and audience

Turn each project's demo into a single page that a recruiter or hiring manager can understand without technical background: what the project is (through an everyday analogy), what happens when you use it, where it is useful in a business, and what it proves about Manuel.

Reference for page organization and interaction (not colors): arjaythedev.com tool pages — one page per tool, numbered sections, each section with its own small experiment, a live diagram, and a closing "when to use / when not" guide.

Scope of this spec: **one pilot project (`compuerta`)** plus the shared components in the hub and the hub card link. Rolling the template out to the other 20 projects is a separate decision after the pilot is reviewed.

Success means a non-technical visitor can, in about two minutes: explain the project in one sentence using the analogy, make a prediction, run the simulation, read the outcome from the 30-square tape, and name one business situation where it applies and one where it does not.

## Decisions taken

| Decision | Choice |
|---|---|
| Primary reader | Recruiter / hiring manager |
| Where the page lives | Inside each project's demo (`/[lang]/app`); the hub card links straight to it (approach A) |
| Section order | Story first: hook → analogy → try it → compare → where it fits → what it proves → engineers (layout A) |
| Simulation visual | Hybrid: system diagram with analogy labels under each node + 30-square outcome tape (style C) |
| Pilot | `compuerta` |

## Page structure (Compuerta)

| # | Section | Content |
|---|---|---|
| 00 | Hook | Project name, a one-line description, chips (category · ~2 min · live demo). |
| 01 | The analogy | Short analogy paragraph + "dictionary" mapping each analogy element to the real component. |
| — | Why I built it | First-person note from Manuel. **Rendered only when the text exists.** |
| 02 | Try it | Prediction question → controls (outage end, backup on/off) → Simulate → hybrid diagram animates and the 30-square tape fills. |
| 03 | Compare | Backup on vs backup off, side by side, with real numbers from the simulation and one human sentence about the difference. |
| 04 | Where it fits | "Worth it when" / "Not needed when", with business situations, no company names. |
| 05 | What it proves | Short first-person paragraph on transferable skills. |
| ▸ | For engineers | Native `<details>`, collapsed: circuit breaker, failover, hedging, deterministic simulation with shared TS/Python math pinned by fixtures, tests, stack, repo link. Absorbs the technical content of the current case study. |

### Draft copy (ES; EN equivalent required)

- **00:** "Compuerta. Un desvío automático para cuando el servicio de IA del que depende tu empresa deja de contestar."
- **01:** "Piensa en tu ruta al trabajo. Un día hay un choque en la autopista y la app de mapas del celular te saca por la lateral antes de que llegues al tráfico. Llegas cinco minutos tarde, pero llegas. Compuerta hace lo mismo con un asistente de IA: cuando el proveedor principal falla, manda las solicitudes a uno de respaldo, y cuando el principal se recupera, regresa." Dictionary: cada coche = un cliente · la autopista = el proveedor principal · el choque = la caída · la lateral = el respaldo · la app de mapas = Compuerta.
- **02 prompt:** "Antes de correrlo, apuesta: con una caída de la solicitud 8 a la 20, ¿se atiende a 24 de 30 clientes o no?"
- **03:** "Con respaldo se atendió a {on} clientes. Sin respaldo, a {off}. Son {diff} personas que se quedaron viendo un 'intenta más tarde'." Numbers come from `runMission`'s `comparison.enabled` / `comparison.disabled`, which run the same `simulate` with only `failover` toggled (not `simulateBaseline`), so 02 and 03 always agree. Never hard-coded.
- **04 worth it:** "Cuando hay alguien esperando la respuesta del otro lado. Pienso en el chat de soporte de un banco a las once de la noche, o en una compra en línea que se queda girando mientras el cliente decide si mejor se va." **Not needed:** "Si el trabajo puede esperar a mañana, como un reporte que corre de madrugada."
- **05:** "Empecé por la pregunta incómoda: ¿qué pasa el día que el proveedor se cae? Luego lo medí en clientes atendidos, porque así lo mide un director de operaciones cuando le preguntan cómo le fue al servicio."
- **Why I built it:** provided by Manuel. Not drafted or invented.

## Writing rules (all story copy)

1. First person, Manuel's voice. Sentence length varies. No slogans.
2. Forbidden: triads with bold lead-ins; "not X but Y" constructions; em dashes; filler words ("potenciar", "robusto", "de un vistazo", "seamless", "leverage", "en tiempo real" unless literally true).
3. At least one concrete detail per section: a number, a place, or a recognizable situation.
4. No company or brand names anywhere in public copy, analogies included (consistent with `DESIGN.md`). Use the generic thing ("la app de mapas del celular"). Changing this requires amending `DESIGN.md` first.
5. The analogy must map piece by piece (3–5 dictionary entries). If it cannot, choose another analogy.
6. "Why I built it" comes from Manuel; the assistant only edits it.
7. Every copy change passes the AI-tell checklist (rule 2 + read-aloud test) before publishing.
8. EN is the default locale; ES is equivalent and complete.

## Architecture

### Shared components (hub, `design-system/demo/project-story.tsx`)

Presentational, locale-agnostic (they receive already-translated strings), synced to siblings with `pnpm brand:sync`.

| Component | Responsibility |
|---|---|
| `StoryHero` | Name, one-liner, chips. |
| `StorySection` | Numbered section wrapper: `01` index, title with one accented word, lead paragraph, children. |
| `AnalogyBlock` | Analogy paragraph + dictionary list (`{ term, means }[]`). |
| `WhyIBuiltIt` | First-person note; renders nothing when text is empty. |
| `OutcomeTape` | N squares with status `served` / `rerouted` / `lost` / `pending`, legend, `revealed` count to fill progressively; static under `prefers-reduced-motion`. |
| `FitGuide` | "Worth it when" / "Not needed when" lists. |
| `ProvesBlock` | "What it proves" paragraph. |
| `EngineerNotes` | Native `<details>/<summary>` wrapper for technical content. |

Reused as-is: `ScenarioPicker`, `MissionPrompt`, `MissionComparison`, `TracePlayer`, `StoryStage`, `useDemoRun`.

### Compuerta (sibling)

- `lib/experience/story.ts` — all page copy as a typed `Record<Locale, CompuertaStory>`; a missing locale or field is a type error.
- `lib/experience/compuerta-scene.tsx` — rebuilt as the hybrid diagram: four nodes (Clients, Compuerta, Provider A, Provider B), each with its analogy label, packets moving per trace frame, Provider A turning to danger state during the outage. Feeds `OutcomeTape` from the simulation's `servedBy` log (see below). Stays local to Compuerta during the pilot; promoted to a generic hub component only when a second project needs it.
- `app/[lang]/app/page.tsx` — composes sections 00 → 05 → engineers in order.
- Simulation output gains `servedBy: (string | null)[]` (one entry per tick: the provider id that served the request, or `null` if lost), added in both `lib/compuerta/sim.ts` and `backend/src/compuerta/sim.py` and pinned in the shared `sim.json` fixture. Tape status: first preference → `served`, any later preference → `rerouted`, `null` → `lost`. The current result only exposes totals and breaker events, so the tape cannot be derived without this. No other math changes.
- Untouched: routing and breaker logic, `/api/*`, Postgres persistence.

### Hub

- Project frontmatter gains `oneLiner` (EN and ES files). The project card shows it and its primary action goes to the demo in the visitor's locale: `{liveUrl origin}/{locale}/app` (Compuerta's `proxy.ts` redirects a locale-less `/app` to `/en/app`, so a Spanish visitor would otherwise land in English). The case study becomes a secondary link.
- Meta-folder `CLAUDE.md` rule 4 (mandatory 5-H2 case study) is updated: projects using a story page keep their technical content under "For engineers" instead.

## Data flow

User picks scenario / moves controls → `useDemoRun.execute(input)` → simulation returns totals, breaker events and the new `servedBy` per-request log, plus the trace → `TracePlayer` steps frames → `CompuertaScene` renders the diagram for the current frame and the tape revealed up to the tick of the current breaker event (trace frames are breaker events, not ticks; all 30 squares are revealed when the frame is complete) → on completion, `MissionComparison` and section 03 read the same result object.

## Error and edge handling

- Simulation error: existing `role="alert"` message stays; tape and diagram are not shown.
- Missing "Why I built it": section omitted, numbering unaffected (it is unnumbered).
- Language switch: restarts the local scenario (existing behavior).
- Reduced motion: no packet animation; tape renders final state immediately.
- Narrow screens: diagram keeps horizontal scroll region (existing pattern); tape wraps to two rows of 15 below 400px.

## Testing and verification

- Node tests for new shared components (pattern: `design-system/demo/foundation.node-test.mjs`): `OutcomeTape` counts/states, `WhyIBuiltIt` empty → null, `EngineerNotes` uses `<details>`.
- Vitest in Compuerta: story completeness for `en` and `es`; tape statuses derived from simulation output match served/rerouted/lost counts; comparison sentence uses computed numbers.
- `servedBy` parity: TS vitest and Python pytest both assert the same `servedBy` from `sim.json`; `servedBy.filter(Boolean).length === success`.
- Existing suites stay green: vitest, node tests, pytest, `tsc --noEmit`, `next build` in both repos.
- Visual: screenshots desktop 1440 and mobile 390, EN and ES, with and without reduced motion.
- Copy: AI-tell checklist applied to all EN/ES strings.
- Vercel **preview** deploy for owner review; no production promotion in this scope.

## Out of scope

- The other 20 projects.
- Committing the uncommitted work in the other 20 sibling repos (tracked separately).
- Visual restyle of colors/typography of the hub.
- Production deploy and `main` merges (owner runs `git push origin main`).

## Open inputs from owner

- "Why I built it" text for Compuerta (1–2 real lines). Non-blocking: the section is hidden until provided.
