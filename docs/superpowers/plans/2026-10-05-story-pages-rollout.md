# Story Pages Rollout — Master Plan

> **For agentic workers:** This is a master plan. It does not carry code for the 20 projects. Wave 0 is executable as written. Each later wave gets its own bite-sized plan (`docs/superpowers/plans/YYYY-MM-DD-story-wave-N.md`), written only after Manuel approves that wave's analogies. Use superpowers:executing-plans or superpowers:subagent-driven-development per wave plan.

**Goal:** Move the 20 remaining portfolio projects to the story-page format piloted on Compuerta, in four themed waves, without breaking any live demo.

**Architecture:** The hub owns every shared piece (story components, outcome tape, a generic flow diagram, the copy lint) and syncs them with `pnpm brand:sync`. Each project only adds its own `lib/experience/story.ts` (EN/ES copy as typed data), a scene, and a page composed from the shared pieces. Simulation math changes only where a project needs per-item results for the tape, and then identically in TS and Python, pinned by the shared fixture.

**Tech Stack:** Next.js 16, TypeScript strict, Tailwind v4, Vitest, pytest, node:test (hub), Vercel previews.

**Spec:** `docs/superpowers/specs/2026-10-04-project-story-pages-design.md`. Reference implementation: Compuerta, PR mdeasis27/compuerta#2. Pilot plan: `docs/superpowers/plans/2026-10-04-project-story-pilot.md`.

## Global Constraints

- Page order: 00 hook · 01 analogy (with dictionary) · Why I built it (hidden while empty) · 02 try it (bet first) · 03 compare · 04 where it fits · 05 what it proves · For engineers (folded `<details>`).
- Copy in EN and ES, same shape; EN is the default locale.
- Writing rules from the spec: first person, varied sentence length, no "not X but Y", no em dash, no bold-led triads, no filler words (the `FORBIDDEN` list), one concrete detail per section.
- Public copy names no companies or brands, analogies included (`DESIGN.md`).
- "Why I built it" text comes from Manuel only. Never drafted by an agent and published.
- Money in integer cents. TypeScript strict, no `any`, no `@ts-ignore`.
- Demo mode works without API keys.
- Branch per wave per repo: `feat/story-page`. Never edit `main`. `git push origin main` is run by Manuel.
- A classifier deny is a wall, for subagents too: stop and report BLOCKED.

## Review Focus

1. **Bet that can't lose:** a default setting where the bet always resolves the same way (Compuerta had backup-on = always 30/30). Each wave plan must include a sweep test over the slider range proving both answers are reachable from the defaults.
2. **Question text out of sync with controls:** the bet's wording must be a function of the controls the grade uses (pilot Important 2).
3. **Mobile diagram:** key nodes must be visible at 390px, or a visible scroll hint must say where they are (pilot Important 1).
4. **Color-only status:** every tape or diagram status needs a non-color mark.
5. **Comparison sentence lying at the edges:** tie, a difference of one, and the reverse case (the "better" option doing worse) each get a test.

---

## Wave 0 — Shared preparation (hub + backups)

**Prerequisite:** Manuel merges mdeasis27/compuerta#1 → #2 and mdeasis27/portafolio-mdea#3 → #4 (in that order; #2 and #4 are stacked).

### Task 0.1: Back up the 20 repos

Each repo has 33–44 uncommitted files of the bilingual/mission work on a stale branch (`feat/memorable-decision-labs`, `feat/decision-mission-pilot` or `feat/evaluation-agent-policy-missions`, all at 0 commits ahead of `main`).

- [ ] For each repo: `git switch -c feat/i18n-decision-missions` (carries the working tree), then run `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm build`, and `cd backend && python -m pytest -q` where `backend/` exists.
- [ ] All green → `git add -A`, review `git diff --cached --stat` for anything outside the i18n/mission work (secrets, local paths, `.component-labs/`), commit `feat: bilingual EN/ES routes and decision missions`, push, open a PR against `main`.
- [ ] Any failure → stop on that repo, record it in the ledger, report to Manuel. Do not fix silently.
- [ ] Note in the ledger the extra changes known beyond i18n: `compuerta` (done), `grafo` fixture `resolution.json`, large diffs in `kyc-antifraude`, `agente-riesgo`, `radar-proveedores`.

### Task 0.2: Generic flow diagram in the hub

Lift the hybrid diagram out of `compuerta/lib/experience/compuerta-scene.tsx` into `design-system/demo/flow-diagram.tsx` now that wave 1 needs it in five more places.

- Interface: `FlowDiagram({ nodes, edges, ariaLabel, scrollHint })` where `nodes: { id: string; x: number; y: number; name: string; sub: string; analogy: string; tone: "idle" | "active" | "danger" | "success" }[]` and `edges: { from: string; to: string; active?: boolean }[]`.
- Under `sm`, stack nodes vertically instead of horizontal scroll (fixes pilot Important 1 at the root); keep `scrollHint` only as fallback.
- Tone carries a non-color mark (icon or dashed stroke for `danger`).
- Test (`story.node-test.mjs`): renders one `data-flow-node` per node, the `= analogy` line, and a non-color marker on `danger`.
- Migrate Compuerta to it in the same task (its existing tests must stay green).

### Task 0.3: Pilot follow-ups (hub components)

- `TracePlayer` gets `onComplete?: () => void`; story pages render section 03 only after it fires (or immediately under reduced motion).
- Fix heading levels: TracePlayer's "Computed trace" becomes `h3` when used inside a story section (prop `headingLevel`).
- Project card: `aria-describedby` on the stretched link pointing to the CTA text; same-tab navigation everywhere.
- Test each in `story.node-test.mjs` / existing card test.

### Task 0.4: Shared copy lint

Move `FORBIDDEN` and the `strings()` walker from `compuerta/lib/experience/story.test.ts` into `design-system/demo/copy-lint.ts` (`export const FORBIDDEN: RegExp[]`, `export function storyStrings(value: unknown): string[]`, `export function lintStory(story: unknown): string[]` returning the violations). Compuerta's test imports it. Every wave's `story.test.ts` calls `expect(lintStory(STORY.en)).toEqual([])`.

### Task 0.5: One-liner single source

The one-liner lives in the hub MDX (`oneLiner`) and in `story.ts`. Add a check to the hub's `scripts/check-public-presentation.mjs`: for each project with `oneLiner`, fetch nothing — instead require that the sibling's `story.ts` contains the exact string when the sibling folder exists locally. Skips when the sibling is absent (CI).

---

## Waves 1–4 — Per-project recipe

Every project in every wave follows the Compuerta recipe. The wave plan expands these into bite-sized steps with real code:

1. **Per-item results (only if the tape needs them):** add the per-item field to the simulation in TS and Python, pin it in the shared fixture, test both.
2. **Copy:** `lib/experience/story.ts` with `STORY.en` / `STORY.es` typed against a `<Project>Story` interface; `story.test.ts` checks same shape, no empty strings except `why.text`, `lintStory` clean, comparison sentence at tie / one / reverse, bet text follows controls.
3. **Scene:** `FlowDiagram` (waves 1–2) or a project-specific visual (waves 3–4), plus `OutcomeTape` where items are countable.
4. **Page:** `app/[lang]/app/page.tsx` composed from `StoryHero`, `StorySection`, `AnalogyBlock`, `WhyIBuiltIt`, `MissionPrompt`, `TracePlayer`, `MissionComparison`, `FitGuide`, `ProvesBlock`, `EngineerNotes`. Defaults chosen so the bet is not trivially decided (Review Focus 1).
5. **Hub:** `oneLiner` in `content/projects/{en,es}/<slug>.mdx`.
6. **Verify:** tests, `tsc`, lint, build; browser check at 390px ES / 1440px EN / reduced motion (tape fills, no overflow, no console errors); Vercel preview link to Manuel.

Gate before each wave starts: Manuel approves the wave's analogies (table below) and, when he has them, sends the "Why I built it" lines. Missing lines do not block; the block stays hidden.

## Waves and draft analogies (for Manuel's approval)

Drafts in Spanish, the copy's working language. Each needs a 3–4 entry dictionary once approved.

### Wave 1 — Things flowing through a gate (closest to Compuerta; tape reuses directly)

| Project | What it decides | Draft analogy |
|---|---|---|
| warmstart | Reuse a cached answer or invalidate it for a new prompt | El mesero que ya se sabe tu pedido de siempre. Si cambia el menú, tiene que volver a preguntar. |
| doorman | Allow or block an agent's external action | El portero del edificio que revisa la lista antes de dejar subir a un repartidor. |
| asedio | Fix before launch or keep validating | Antes de mudarte, alguien prueba cada cerradura para ver cuál cede. |
| bandera | Advance, hold or kill a rollout | Abres solo unas mesas del restaurante nuevo; si algo sale mal, cierras esas mesas y no el local. |
| mesa | Adjust the process budget or stop at its limit | Una carrera de relevos con tiempo contado: si se acaba, se entrega lo que haya. |

### Wave 2 — Checkpoints that decide continue / review / stop

| Project | What it decides | Draft analogy |
|---|---|---|
| agente-riesgo | Continue, review or stop | El control del aeropuerto: tres filtros, y si uno levanta sospecha pasas a revisión. |
| kyc-antifraude | Let an application continue or hold it for a person | Abrir una cuenta en ventanilla: si la identificación no cuadra, el cajero llama al gerente. |
| identidad-360 | Assemble a profile or send it to review | Armar un rompecabezas con piezas de varias cajas; si dos piezas se contradicen, no lo fuerzas. |
| radar-proveedores | Continue with a supplier or investigate | Pedir referencias antes de contratar a alguien. |
| agente-cobranzas | Standard or priority queue | El recordatorio de pago que sube de tono cuando el atraso cruza cierto día. |

### Wave 3 — Comparing two options with evidence

| Project | What it decides | Draft analogy |
|---|---|---|
| ensayo | Ship, hold or stop a change | Una prueba de sabor a ciegas: ¿la receta nueva gana o fue suerte? |
| destilacion | Pay per use or run it in-house | Rentar coche o comprarlo, según cuántos kilómetros manejas al mes. |
| veredicto | Release or block a search configuration | Varios catadores prueban dos versiones con las mismas preguntas antes de elegir. |
| arbitro | Resolve locally or escalate to a person | Tres jueces califican; si no se ponen de acuerdo, decide el árbitro de video. |
| escaneo | Accept or hold a document | El cajero que revisa un billete a contraluz y aparta el que no pasa. |

### Wave 4 — Finding and citing the right information

| Project | What it decides | Draft analogy |
|---|---|---|
| evidencia | Answer or decline | El alumno que debe citar la página del libro en cada respuesta; si no la encuentra, dice "no sé". |
| grafo | Answer from the graph or decline as out of scope | "El amigo de un amigo": seguir conexiones para saber quién conoce a quién. |
| fabrica | Use a compact evaluation set | Armar el examen final con una pregunta de cada tema, sin repetir. |
| vigia | Apply a reviewed documentation fix | Le cambian el nombre a una calle: hay que encontrar cada letrero y mapa que la menciona. |
| traductor | Use a validated template or reject the request | El bibliotecario que convierte tu pregunta en una búsqueda del catálogo y te avisa si eso no existe. |

## Order and checkpoints

1. Manuel merges the pilot PRs.
2. Wave 0 (one branch per repo for 0.1; hub branch `feat/story-rollout-prep` for 0.2–0.5), then a whole-branch review.
3. Manuel approves wave 1 analogies → write `story-wave-1` plan → build → previews → Manuel reviews → PRs.
4. Repeat for waves 2–4. Analogy feedback from each wave feeds the next wave's drafts.
5. After wave 4: update the meta-folder `CLAUDE.md` subproject list (it still lists 3 projects) and retire the 5-H2 case-study rule once no project uses it.
