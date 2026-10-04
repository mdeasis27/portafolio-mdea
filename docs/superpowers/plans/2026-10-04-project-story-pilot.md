# Project Story Pilot (Compuerta) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Compuerta's demo page into a recruiter-friendly story page (hook → analogy → try it → compare → where it fits → what it proves → for engineers) with a hybrid diagram and a 30-square outcome tape, built from shared hub components.

**Architecture:** The hub (`portafolio-mdea`) owns presentational components in `design-system/demo/` and syncs them to Compuerta with `pnpm brand:sync`. Compuerta owns its copy (`lib/experience/story.ts`), its diagram (`lib/experience/compuerta-scene.tsx`) and the page. The simulation gains one output field (`servedBy`) in TS and Python so the tape can show each request.

**Tech Stack:** Next.js 16 (App Router, `[lang]` routes), React 19, TypeScript strict, Tailwind v4 tokens from `design-system/tokens.css`, Vitest (Compuerta), `node --test` with `typescript.transpileModule` (shared demo tests), pytest (Compuerta backend), pnpm.

**Spec:** `portafolio-mdea/docs/superpowers/specs/2026-10-04-project-story-pages-design.md`

## Global Constraints

- Repos: hub `C:/Proyectos/proyectos-portafolio/portafolio-mdea`, sibling `C:/Proyectos/proyectos-portafolio/compuerta`. Work only on branch `feat/project-story-pilot` in each.
- Never edit `design-system/` inside Compuerta by hand; edit in the hub and run `pnpm brand:sync` from Compuerta.
- TypeScript strict; no `any`, no `@ts-ignore`. Money stays integer cents (untouched here).
- Use design-system tokens only (`text-accent`, `border-border`, `bg-surface`, `text-muted-foreground`, `bg-success`, `bg-info`, `bg-danger`, `bg-foreground/10`, `text-success`, `text-danger`); no ad-hoc colors.
- Public copy: EN default, ES complete and equivalent. First person, Manuel's voice. No company or brand names (analogy uses "la app de mapas del celular" / "the maps app on your phone").
- Forbidden in copy: em dashes (—); "not X but Y" / "no X, sino Y" / "en lugar de" contrasts; triads with bold lead-ins; filler words: potenciar, robusto, robust, de un vistazo, at a glance, seamless, leverage.
- "Why I built it" text is supplied by Manuel only; ship it empty (section hidden).
- Commits in English, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Do not push to `main`; do not promote to production.
- Classifier denies are walls: if a command is blocked, stop and report BLOCKED; do not retry it with another tool.

## Review Focus

1. Outage too short to trip the breaker (e.g. outage end 10) → trace is empty → tape, diagram and comparison must still render the final result (pinned in Task 2 `revealedTicks` test and Task 5 page fallback test).
2. Backup and no-backup serve the same count, or differ by exactly one → the comparison sentence must stay grammatical and truthful (pinned in Task 4).
3. Spanish visitor clicks a hub card → must land on `/es/app`, not `/en/app` (pinned in Task 6 `demoHref` test).
4. `prefers-reduced-motion: reduce` → `TracePlayer` does not autoplay, so the tape must show the final state immediately instead of freezing at the first event (pinned in Task 5 `sceneReveal` test).
5. 390px-wide phone → the 30-square tape wraps to two rows of 15 and the diagram scrolls horizontally inside its region with no page overflow (checked in Task 7 screenshots).

---

### Task 1: Per-request `servedBy` log in the simulation (TS + Python + fixture)

**Files:**
- Modify: `compuerta/lib/compuerta/types.ts` (interface `SimResult`)
- Modify: `compuerta/lib/compuerta/sim.ts` (main loop and return object of `simulate`)
- Modify: `compuerta/backend/src/compuerta/sim.py` (main loop and return dict of `simulate`)
- Modify: `compuerta/lib/compuerta/fixtures/sim.json` and `compuerta/backend/tests/fixtures/sim.json` (must stay byte-identical; `backend/tests/test_money.py` asserts equality)
- Test: `compuerta/lib/compuerta/fixtures.test.ts`, `compuerta/backend/tests/test_compuerta.py`

**Interfaces:**
- Produces: `SimResult.servedBy: (string | null)[]` with `servedBy.length === nTicks`; entry `i` is the provider id that served tick `i`, or `null` if no provider succeeded. Python dict key `"servedBy"` with the same values.

- [ ] **Step 1: Create the Compuerta branch**

```bash
cd /c/Proyectos/proyectos-portafolio/compuerta
git status --short   # must be empty
git switch feat/i18n-decision-missions
git switch -c feat/project-story-pilot
```

- [ ] **Step 2: Write the failing TS test**

Append inside the existing `describe("pinned fixture: simulation", ...)` block of `lib/compuerta/fixtures.test.ts`, as a new `it`:

```ts
  it("logs which provider served every request", () => {
    const sim = getSimulation();
    expect(sim.servedBy).toHaveLength(sim.nTicks);
    expect(sim.servedBy.filter((p) => p !== null).length).toBe(sim.success);
    expect(sim.servedBy).toEqual((simFixture as { servedBy: (string | null)[] }).servedBy);
  });
```

- [ ] **Step 3: Write the failing Python test**

Append to `backend/tests/test_compuerta.py`:

```python
def test_simulation_logs_served_by_like_typescript():
    fixture = _load("sim.json")
    sim = simulate(_config())
    assert len(sim["servedBy"]) == sim["nTicks"]
    assert sum(1 for p in sim["servedBy"] if p is not None) == sim["success"]
    assert sim["servedBy"] == fixture["servedBy"]
```

- [ ] **Step 4: Run both to verify they fail**

Run: `pnpm vitest run lib/compuerta/fixtures.test.ts` → FAIL (`servedBy` undefined / type error).
Run: `cd backend && python -m pytest -q tests/test_compuerta.py -k served_by` → FAIL (`KeyError: 'servedBy'`).

- [ ] **Step 5: Implement in TS**

In `lib/compuerta/types.ts`, add to `SimResult` after `events: BreakerEvent[];`:

```ts
  /** Provider that served each tick, or null when the request was lost. */
  servedBy: (string | null)[];
```

In `lib/compuerta/sim.ts`, next to `const events: SimResult["events"] = [];` add:

```ts
  const servedBy: (string | null)[] = [];
```

Inside the tick loop, replace `let succeeded = false;` with:

```ts
    let succeeded = false;
    let servedProvider: string | null = null;
```

Inside `if (ok) {`, right after `succeeded = true;` add:

```ts
        servedProvider = providerId;
```

Replace `if (succeeded) success += 1;` with:

```ts
    if (succeeded) success += 1;
    servedBy.push(servedProvider);
```

In the returned object, after `events,` add `servedBy,`.

- [ ] **Step 6: Implement in Python**

In `backend/src/compuerta/sim.py`, after `events: list[dict] = []` add `served_by: list[str | None] = []`. In the tick loop, after `succeeded = False` add `served_provider = None`. After `succeeded = True` add `served_provider = provider_id`. Replace:

```python
        if succeeded:
            success += 1
```

with:

```python
        if succeeded:
            success += 1
        served_by.append(served_provider)
```

In the returned dict, after `"events": events,` add `"servedBy": served_by,`.

- [ ] **Step 7: Pin the value in both fixtures**

Generate from Python and write the same JSON to both files (2-space indent, trailing newline, preserving existing key order):

```bash
cd /c/Proyectos/proyectos-portafolio/compuerta/backend
python - <<'EOF'
import json, pathlib, sys
sys.path.insert(0, "src")
from compuerta.sim import simulate
root = pathlib.Path("..")
config = json.loads((root / "lib/compuerta/data/config.json").read_text())
served = simulate(config)["servedBy"]
for path in [root / "lib/compuerta/fixtures/sim.json", pathlib.Path("tests/fixtures/sim.json")]:
    data = json.loads(path.read_text())
    data["servedBy"] = served
    path.write_text(json.dumps(data, indent=2) + "\n")
print(len(served), sum(p is not None for p in served))
EOF
cmp ../lib/compuerta/fixtures/sim.json tests/fixtures/sim.json && echo SAME
```

Expected: prints `300 300` (fixture availability is 1) and `SAME`.

- [ ] **Step 8: Run all Compuerta suites**

Run: `cd /c/Proyectos/proyectos-portafolio/compuerta && pnpm test && (cd backend && python -m pytest -q) && npx tsc --noEmit`
Expected: all vitest files pass (38 tests), pytest 11 passed, tsc silent.

- [ ] **Step 9: Commit**

```bash
git add lib/compuerta backend/src backend/tests
git commit -m "feat(sim): log which provider served each request

Adds servedBy to the TS and Python simulation, pinned in the shared
fixture, so the demo can show every request instead of only totals.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Outcome tape logic (hub, pure TS)

**Files:**
- Create: `portafolio-mdea/design-system/demo/outcome-tape.ts`
- Create: `portafolio-mdea/design-system/demo/story.node-test.mjs`

**Interfaces:**
- Produces:
  - `type TapeStatus = "served" | "rerouted" | "lost" | "pending"`
  - `tapeCells(servedBy: readonly (string | null)[], primaryId: string, revealed: number): TapeStatus[]`
  - `tapeCounts(cells: readonly TapeStatus[]): Record<TapeStatus, number>`
  - `revealedTicks(frame: { total: number; complete: boolean; event?: { evidenceIds?: string[] } }, nTicks: number, reducedMotion?: boolean): number`

- [ ] **Step 1: Create the hub branch check**

```bash
cd /c/Proyectos/proyectos-portafolio/portafolio-mdea
git branch --show-current   # must print feat/project-story-pilot
git status --short          # must be empty
```

- [ ] **Step 2: Write the failing tests**

Create `design-system/demo/story.node-test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function load(file) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const exports = {};
  new Function('exports', 'require', js)(exports, require);
  return exports;
}

test('tape marks primary as served, other providers as rerouted, null as lost, unrevealed as pending', () => {
  const { tapeCells, tapeCounts } = load('./outcome-tape.ts');
  const cells = tapeCells(['primary', 'backup', null, 'primary'], 'primary', 3);
  assert.deepEqual(cells, ['served', 'rerouted', 'lost', 'pending']);
  assert.deepEqual(tapeCounts(cells), { served: 1, rerouted: 1, lost: 1, pending: 1 });
});

test('tape reveals up to the tick of the current breaker event', () => {
  const { revealedTicks } = load('./outcome-tape.ts');
  const frame = { total: 3, complete: false, event: { evidenceIds: ['primary', 'tick:9'] } };
  assert.equal(revealedTicks(frame, 30), 10);
});

test('tape is fully revealed when playback is complete, when the trace is empty, or under reduced motion', () => {
  const { revealedTicks } = load('./outcome-tape.ts');
  assert.equal(revealedTicks({ total: 3, complete: true, event: { evidenceIds: ['tick:9'] } }, 30), 30);
  assert.equal(revealedTicks({ total: 0, complete: false }, 30), 30);
  assert.equal(revealedTicks({ total: 3, complete: false, event: { evidenceIds: ['tick:2'] } }, 30, true), 30);
});

test('tape reveals nothing when the event carries no tick', () => {
  const { revealedTicks } = load('./outcome-tape.ts');
  assert.equal(revealedTicks({ total: 2, complete: false, event: { evidenceIds: ['primary'] } }, 30), 0);
});
```

- [ ] **Step 3: Run to verify failure**

Run: `node --test design-system/demo/story.node-test.mjs`
Expected: FAIL (`ENOENT ... outcome-tape.ts`).

- [ ] **Step 4: Implement**

Create `design-system/demo/outcome-tape.ts`:

```ts
export type TapeStatus = "served" | "rerouted" | "lost" | "pending";

export function tapeCells(servedBy: readonly (string | null)[], primaryId: string, revealed: number): TapeStatus[] {
  return servedBy.map((provider, i) =>
    i >= revealed ? "pending" : provider === null ? "lost" : provider === primaryId ? "served" : "rerouted",
  );
}

export function tapeCounts(cells: readonly TapeStatus[]): Record<TapeStatus, number> {
  const counts: Record<TapeStatus, number> = { served: 0, rerouted: 0, lost: 0, pending: 0 };
  for (const cell of cells) counts[cell] += 1;
  return counts;
}

/** Trace frames are breaker events, not ticks: reveal up to the current event's tick. */
export function revealedTicks(
  frame: { total: number; complete: boolean; event?: { evidenceIds?: string[] } },
  nTicks: number,
  reducedMotion = false,
): number {
  if (reducedMotion || frame.total === 0 || frame.complete) return nTicks;
  const tag = frame.event?.evidenceIds?.find((id) => id.startsWith("tick:"));
  const tick = tag ? Number(tag.slice("tick:".length)) : Number.NaN;
  return Number.isInteger(tick) ? Math.min(nTicks, Math.max(0, tick + 1)) : 0;
}
```

- [ ] **Step 5: Run to verify pass**

Run: `node --test design-system/demo/story.node-test.mjs`
Expected: 4 pass, 0 fail.

- [ ] **Step 6: Commit**

```bash
git add design-system/demo/outcome-tape.ts design-system/demo/story.node-test.mjs
git commit -m "feat(design-system): outcome tape logic for story pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Story page components (hub) and sync to Compuerta

**Files:**
- Create: `portafolio-mdea/design-system/demo/project-story.tsx`
- Modify: `portafolio-mdea/design-system/demo/story.node-test.mjs` (append tests)
- Modify: `portafolio-mdea/design-system/CHANGELOG.md` (one entry)
- Sync into: `compuerta/design-system/` via `pnpm brand:sync`

**Interfaces:**
- Consumes: `TapeStatus` from `./outcome-tape` (type-only import).
- Produces (all named exports of `design-system/demo/project-story.tsx`):
  - `interface Heading { before?: string; accent: string; after?: string }`
  - `StoryHero({ name, oneLiner, chips }: { name: string; oneLiner: string; chips: string[] })`
  - `StorySection({ index, heading, lead, children }: { index: number; heading: Heading; lead?: string; children?: ReactNode })`
  - `AnalogyBlock({ paragraphs, dictionaryLabel, dictionary }: { paragraphs: string[]; dictionaryLabel: string; dictionary: { term: string; means: string }[] })`
  - `WhyIBuiltIt({ title, text }: { title: string; text: string })` → `null` when `text.trim()` is empty
  - `OutcomeTape({ cells, labels, ariaLabel }: { cells: TapeStatus[]; labels: Record<Exclude<TapeStatus, "pending">, string>; ariaLabel: string })`
  - `FitGuide({ worthLabel, worth, notLabel, not }: { worthLabel: string; worth: string; notLabel: string; not: string })`
  - `ProvesBlock({ text }: { text: string })`
  - `EngineerNotes({ summary, children }: { summary: string; children: ReactNode })`
  - `useReducedMotion(): boolean`

- [ ] **Step 1: Write the failing tests**

Append to `design-system/demo/story.node-test.mjs`:

```js
const { renderToStaticMarkup } = require('react-dom/server');
const { createElement: h } = require('react');

test('why-I-built-it renders nothing until Manuel provides the text', () => {
  const { WhyIBuiltIt } = load('./project-story.tsx');
  assert.equal(renderToStaticMarkup(h(WhyIBuiltIt, { title: 'Why', text: '   ' })), '');
  assert.match(renderToStaticMarkup(h(WhyIBuiltIt, { title: 'Why', text: 'Real note' })), /Real note/);
});

test('story sections are numbered with two digits and highlight one word', () => {
  const { StorySection } = load('./project-story.tsx');
  const html = renderToStaticMarkup(h(StorySection, { index: 2, heading: { before: 'Try', accent: 'it' } }));
  assert.match(html, />02</);
  assert.match(html, /class="text-accent">it</);
});

test('outcome tape exposes one cell per request with its status and a legend', () => {
  const { OutcomeTape } = load('./project-story.tsx');
  const html = renderToStaticMarkup(h(OutcomeTape, { cells: ['served', 'rerouted', 'lost', 'pending'], labels: { served: 'served', rerouted: 'rerouted', lost: 'lost' }, ariaLabel: 'Requests' }));
  assert.equal((html.match(/data-tape-cell=/g) ?? []).length, 4);
  assert.match(html, /data-tape-cell="lost"/);
  assert.match(html, /aria-label="Requests"/);
  assert.match(html, />rerouted</);
});

test('engineer notes are a native collapsed disclosure', () => {
  const { EngineerNotes } = load('./project-story.tsx');
  const html = renderToStaticMarkup(h(EngineerNotes, { summary: 'For engineers', children: 'x' }));
  assert.match(html, /^<details[^>]*><summary[^>]*>For engineers<\/summary>/);
  assert.doesNotMatch(html, /<details[^>]*open/);
});

test('analogy dictionary renders every term with its meaning', () => {
  const { AnalogyBlock } = load('./project-story.tsx');
  const html = renderToStaticMarkup(h(AnalogyBlock, { paragraphs: ['p'], dictionaryLabel: 'In the diagram', dictionary: [{ term: 'the highway', means: 'the main provider' }, { term: 'the crash', means: 'the outage' }] }));
  assert.equal((html.match(/<dt/g) ?? []).length, 2);
  assert.match(html, /the main provider/);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test design-system/demo/story.node-test.mjs`
Expected: the 5 new tests FAIL (`ENOENT ... project-story.tsx`); the 4 tape tests still pass.

- [ ] **Step 3: Implement**

Create `design-system/demo/project-story.tsx`:

```tsx
"use client";
import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { TapeStatus } from "./outcome-tape";

export interface Heading { before?: string; accent: string; after?: string }

function subscribeMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => false);
}

export function StoryHero({ name, oneLiner, chips }: { name: string; oneLiner: string; chips: string[] }) {
  return <header data-story-hero className="pb-10 pt-4 sm:pb-14">
    <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">{name}<span className="text-accent">.</span></h1>
    <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">{oneLiner}</p>
    <ul className="mt-6 flex flex-wrap gap-2">{chips.map(chip => <li key={chip} className="rounded-md border border-border bg-surface px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{chip}</li>)}</ul>
  </header>;
}

export function StorySection({ index, heading, lead, children }: { index: number; heading: Heading; lead?: string; children?: ReactNode }) {
  return <section data-story-section={index} className="border-t border-border py-10 sm:py-14">
    <div className="flex items-baseline gap-4">
      <span className="font-mono text-xs text-muted-foreground">{String(index).padStart(2, "0")}</span>
      <h2 className="text-2xl font-semibold tracking-tight sm:text-4xl">{heading.before ? `${heading.before} ` : ""}<span className="text-accent">{heading.accent}</span>{heading.after ? ` ${heading.after}` : ""}</h2>
    </div>
    {lead ? <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:pl-9">{lead}</p> : null}
    {children ? <div className="mt-8 min-w-0">{children}</div> : null}
  </section>;
}

export function AnalogyBlock({ paragraphs, dictionaryLabel, dictionary }: { paragraphs: string[]; dictionaryLabel: string; dictionary: { term: string; means: string }[] }) {
  return <div data-analogy className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
    <div className="space-y-4 text-base leading-8">{paragraphs.map(p => <p key={p}>{p}</p>)}</div>
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{dictionaryLabel}</p>
      <dl className="mt-4 space-y-3 text-sm">{dictionary.map(item => <div key={item.term} className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-baseline gap-2"><dt className="font-medium">{item.term}</dt><span aria-hidden="true" className="text-muted-foreground">=</span><dd className="text-muted-foreground">{item.means}</dd></div>)}</dl>
    </div>
  </div>;
}

export function WhyIBuiltIt({ title, text }: { title: string; text: string }) {
  if (!text.trim()) return null;
  return <aside data-why className="my-2 border-l-2 border-accent py-1 pl-5">
    <p className="font-mono text-xs uppercase tracking-wider text-accent">{title}</p>
    <p className="mt-2 max-w-2xl text-base leading-7">{text}</p>
  </aside>;
}

const TAPE_COLORS: Record<TapeStatus, string> = { served: "bg-success", rerouted: "bg-info", lost: "bg-danger", pending: "bg-foreground/10" };

export function OutcomeTape({ cells, labels, ariaLabel }: { cells: TapeStatus[]; labels: Record<Exclude<TapeStatus, "pending">, string>; ariaLabel: string }) {
  return <div data-outcome-tape>
    <ol aria-label={ariaLabel} className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1 min-[400px]:grid-cols-[repeat(30,minmax(0,1fr))]">
      {cells.map((cell, i) => <li key={i} data-tape-cell={cell} title={cell === "pending" ? undefined : `${i + 1}: ${labels[cell]}`} className={`h-4 rounded-sm transition-colors duration-300 motion-reduce:transition-none ${TAPE_COLORS[cell]}`}><span className="sr-only">{cell === "pending" ? "" : `${i + 1}: ${labels[cell]}`}</span></li>)}
    </ol>
    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">{(["served", "rerouted", "lost"] as const).map(status => <li key={status} className="flex items-center gap-1.5"><span aria-hidden="true" className={`inline-block size-2.5 rounded-sm ${TAPE_COLORS[status]}`} />{labels[status]}</li>)}</ul>
  </div>;
}

export function FitGuide({ worthLabel, worth, notLabel, not }: { worthLabel: string; worth: string; notLabel: string; not: string }) {
  return <div data-fit-guide className="grid gap-4 md:grid-cols-2">
    <div className="rounded-xl border border-border border-l-4 border-l-success bg-surface p-5"><p className="font-mono text-xs uppercase tracking-wider text-success">{worthLabel}</p><p className="mt-3 text-base leading-7">{worth}</p></div>
    <div className="rounded-xl border border-border border-l-4 border-l-danger bg-surface p-5"><p className="font-mono text-xs uppercase tracking-wider text-danger">{notLabel}</p><p className="mt-3 text-base leading-7">{not}</p></div>
  </div>;
}

export function ProvesBlock({ text }: { text: string }) {
  return <p data-proves className="max-w-3xl text-lg leading-8">{text}</p>;
}

export function EngineerNotes({ summary, children }: { summary: string; children: ReactNode }) {
  return <details data-engineer-notes className="my-10 rounded-xl border border-border bg-surface p-5"><summary className="cursor-pointer font-mono text-sm uppercase tracking-wider focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">{summary}</summary><div className="mt-5 text-sm leading-7 text-muted-foreground">{children}</div></details>;
}
```

- [ ] **Step 4: Run to verify pass, plus existing hub checks**

Run: `node --test design-system/demo/*.node-test.mjs && npx tsc --noEmit && pnpm lint`
Expected: 13 pass (4 foundation + 9 story), tsc silent, lint clean.

Colors come from `--color-*` in each app's `globals.css` (`surface`, `success`, `danger`, `info`, `accent`, `foreground`, `border`). `bg-muted` is a dark gray text tone, so pending cells use `bg-foreground/10`. Do not add new colors.

- [ ] **Step 5: Changelog entry**

Add at the top of the entries in `design-system/CHANGELOG.md`, following its existing format:

```md
## Unreleased
- Added `demo/project-story.tsx` (StoryHero, StorySection, AnalogyBlock, WhyIBuiltIt, OutcomeTape, FitGuide, ProvesBlock, EngineerNotes, useReducedMotion) and `demo/outcome-tape.ts` for recruiter-facing story pages.
```

- [ ] **Step 6: Commit (hub)**

```bash
git add design-system/demo/project-story.tsx design-system/demo/story.node-test.mjs design-system/CHANGELOG.md
git commit -m "feat(design-system): story page components

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 7: Sync into Compuerta and verify**

```bash
cd /c/Proyectos/proyectos-portafolio/compuerta
pnpm brand:sync
git status --short design-system   # expect: new outcome-tape.ts, project-story.tsx, story.node-test.mjs; CHANGELOG.md and .brand-sync-manifest.json modified; nothing else
node --test design-system/demo/*.node-test.mjs && npx tsc --noEmit
git add design-system
git commit -m "chore: sync story components from hub

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Expected: 13 node tests pass, tsc silent. If `git status` shows other design-system files changing, stop and report: the hub and Compuerta copies had drifted.

---

### Task 4: Compuerta story copy (EN/ES) with completeness and AI-tell checks

**Files:**
- Create: `compuerta/lib/experience/story.ts`
- Create: `compuerta/lib/experience/story.test.ts`

**Interfaces:**
- Consumes: `Heading` from `@/design-system/demo/project-story`.
- Produces: `interface CompuertaStory` and `export const STORY: Record<"en" | "es", CompuertaStory>`; `STORY[locale].compare.sentence(on: number, off: number): string`; `STORY[locale].scene.servedOf(n: number, total: number): string`.

- [ ] **Step 1: Write the failing test**

Create `lib/experience/story.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { STORY } from "./story";

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "function") return [String((value as (a: number, b: number) => string)(27, 18)), String((value as (a: number, b: number) => string)(18, 18)), String((value as (a: number, b: number) => string)(19, 18))];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

const FORBIDDEN = [/—/, /\bsino\b/i, /en lugar de/i, /\bnot just\b/i, /\binstead of\b/i, /potenciar/i, /robust/i, /de un vistazo/i, /at a glance/i, /seamless/i, /leverag/i, /\bWaze\b/i];

describe("Compuerta story copy", () => {
  it("has the same shape in English and Spanish", () => {
    const keys = (o: unknown): string[] => o && typeof o === "object" && !Array.isArray(o) ? Object.entries(o).flatMap(([k, v]) => [k, ...keys(v).map(x => `${k}.${x}`)]) : [];
    expect(keys(STORY.es)).toEqual(keys(STORY.en));
    expect(STORY.es.analogy.dictionary).toHaveLength(STORY.en.analogy.dictionary.length);
  });

  it("has no empty strings except the owner-supplied why note", () => {
    for (const locale of ["en", "es"] as const) {
      const { why, ...rest } = STORY[locale];
      expect(why.title.trim()).not.toBe("");
      for (const s of strings(rest)) expect(s.trim(), `${locale}: empty string`).not.toBe("");
    }
  });

  it("avoids AI-sounding patterns and brand names", () => {
    for (const locale of ["en", "es"] as const) for (const s of strings(STORY[locale])) for (const pattern of FORBIDDEN) expect(s, `${locale}: ${pattern}`).not.toMatch(pattern);
  });

  it("states the comparison truthfully, including ties and a single person", () => {
    expect(STORY.es.compare.sentence(27, 18)).toBe("Con respaldo se atendió a 27 clientes. Sin respaldo, a 18. Son 9 personas que se quedaron viendo un \"intenta más tarde\".");
    expect(STORY.es.compare.sentence(19, 18)).toContain("Es una persona que se quedó");
    expect(STORY.es.compare.sentence(18, 18)).toBe("Las dos configuraciones atendieron a 18 clientes. Esta caída fue demasiado corta para notar la diferencia.");
    expect(STORY.en.compare.sentence(27, 18)).toBe("With the backup, 27 customers were served. Without it, 18. That's 9 people staring at a \"try again later\".");
    expect(STORY.en.compare.sentence(19, 18)).toContain("That's one person");
    expect(STORY.en.compare.sentence(18, 18)).toBe("Both setups served 18 customers. This outage was too short to make a difference.");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm vitest run lib/experience/story.test.ts`
Expected: FAIL (`Cannot find module './story'`).

- [ ] **Step 3: Implement**

Create `lib/experience/story.ts`:

```ts
import type { Heading } from "@/design-system/demo/project-story";

type NodeCopy = { name: string; sub: string; analogy: string };

export interface CompuertaStory {
  name: string;
  oneLiner: string;
  chips: string[];
  analogy: { heading: Heading; paragraphs: string[]; dictionaryLabel: string; dictionary: { term: string; means: string }[] };
  why: { title: string; text: string };
  tryIt: { heading: Heading; lead: string; question: string; yes: string; no: string; backupLabel: string; outageEndLabel: string; note: string; simulate: string; cancel: string; reset: string; error: string; idle: string };
  compare: { heading: Heading; lead: string; on: string; off: string; served: string; sentence: (on: number, off: number) => string };
  fit: { heading: Heading; worthLabel: string; worth: string; notLabel: string; not: string };
  proves: { heading: Heading; text: string };
  engineers: { summary: string; points: string[]; repoLabel: string };
  scene: { title: string; caption: string; tapeLabel: string; nodes: { clients: NodeCopy; gateway: NodeCopy; primary: NodeCopy; backup: NodeCopy }; tape: { served: string; rerouted: string; lost: string }; servedOf: (n: number, total: number) => string };
}

const engineerPointsEn = [
  "One circuit breaker per provider: a window of 3 requests, it opens at 40% errors or when p95 latency passes 500 ms, and waits 3 requests before testing the provider again.",
  "Failover follows a preference list per request type; optional hedging duplicates a slow request to the backup after 280 ms.",
  "The simulation is deterministic: a seeded generator, the same math in TypeScript and Python, pinned by shared fixtures that both test suites read.",
  "Stack: Next.js 16, TypeScript, Python, Vitest, pytest.",
];
const engineerPointsEs = [
  "Un circuit breaker por proveedor: ventana de 3 solicitudes, se abre con 40% de errores o cuando la latencia p95 pasa de 500 ms, y espera 3 solicitudes antes de volver a probar al proveedor.",
  "El failover sigue una lista de preferencia por tipo de solicitud; el hedging opcional duplica una solicitud lenta hacia el respaldo después de 280 ms.",
  "La simulación es determinista: un generador con semilla, la misma matemática en TypeScript y Python, fijada por fixtures compartidos que leen las dos suites de tests.",
  "Stack: Next.js 16, TypeScript, Python, Vitest, pytest.",
];

export const STORY: Record<"en" | "es", CompuertaStory> = {
  en: {
    name: "Compuerta",
    oneLiner: "An automatic detour for the day the AI service your company relies on stops answering.",
    chips: ["Service continuity", "2 min", "Live demo"],
    analogy: {
      heading: { before: "The", accent: "analogy" },
      paragraphs: [
        "Think about your drive to work. One day there's a crash on the highway and the maps app on your phone sends you down the side road before you reach the jam. You arrive five minutes late, but you arrive.",
        "Compuerta does the same for an AI assistant. When the main provider fails, it sends requests to a backup, and when the main one recovers, it switches back.",
      ],
      dictionaryLabel: "In the diagram below",
      dictionary: [
        { term: "each car", means: "a customer" },
        { term: "the highway", means: "the main provider" },
        { term: "the crash", means: "the outage" },
        { term: "the side road", means: "the backup provider" },
        { term: "the maps app", means: "Compuerta" },
      ],
    },
    why: { title: "Why I built it", text: "" },
    tryIt: {
      heading: { before: "Try", accent: "it" },
      lead: "Thirty customers write to a support assistant. Partway through, the main provider stops answering.",
      question: "Before you run it, place a bet: with an outage from request 8 to 20, do at least 24 of 30 customers get served?",
      yes: "Yes, 24 or more",
      no: "No, fewer than 24",
      backupLabel: "Use the backup route",
      outageEndLabel: "The outage ends at request",
      note: "Each square is one customer request, not a second of real time. The backup can also fail now and then, like any real provider.",
      simulate: "Run it",
      cancel: "Cancel",
      reset: "Start over",
      error: "The outage could not be simulated. Try another end point.",
      idle: "Place your bet and press Run it.",
    },
    compare: {
      heading: { before: "With", accent: "or without", after: "a backup" },
      lead: "Same outage, same customers. The only change is whether the detour exists.",
      on: "With the backup",
      off: "Without the backup",
      served: "customers served",
      sentence: (on, off) => {
        const d = on - off;
        if (d <= 0) return `Both setups served ${on} customers. This outage was too short to make a difference.`;
        return `With the backup, ${on} customers were served. Without it, ${off}. ${d === 1 ? "That's one person" : `That's ${d} people`} staring at a "try again later".`;
      },
    },
    fit: {
      heading: { before: "Where it", accent: "fits" },
      worthLabel: "Worth it",
      worth: "When someone is waiting for the answer on the other side. I picture a bank's support chat at eleven at night, or an online purchase that keeps spinning while the customer decides whether to just leave.",
      notLabel: "Not needed",
      not: "If the work can wait until tomorrow, like a report that runs overnight.",
    },
    proves: {
      heading: { before: "What it", accent: "proves" },
      text: "I started with the uncomfortable question: what happens the day the provider goes down? Then I measured it in customers served, because that's how an operations director measures it when someone asks how the service did.",
    },
    engineers: { summary: "For engineers", points: engineerPointsEn, repoLabel: "Source code" },
    scene: {
      title: "The route each request took",
      caption: "Watch the main provider turn red during the outage and the requests move to the backup.",
      tapeLabel: "Thirty customer requests, in order",
      nodes: {
        clients: { name: "Customers", sub: "30 requests", analogy: "the cars" },
        gateway: { name: "Compuerta", sub: "picks the route", analogy: "the maps app" },
        primary: { name: "Provider A", sub: "main", analogy: "the highway" },
        backup: { name: "Provider B", sub: "backup", analogy: "the side road" },
      },
      tape: { served: "served", rerouted: "sent to the backup", lost: "lost" },
      servedOf: (n, total) => `${n} of ${total} customers served`,
    },
  },
  es: {
    name: "Compuerta",
    oneLiner: "Un desvío automático para cuando el servicio de IA del que depende tu empresa deja de contestar.",
    chips: ["Continuidad del servicio", "2 min", "Demo en vivo"],
    analogy: {
      heading: { before: "La", accent: "analogía" },
      paragraphs: [
        "Piensa en tu ruta al trabajo. Un día hay un choque en la autopista y la app de mapas del celular te saca por la lateral antes de que llegues al tráfico. Llegas cinco minutos tarde, pero llegas.",
        "Compuerta hace lo mismo con un asistente de IA. Cuando el proveedor principal falla, manda las solicitudes a uno de respaldo, y cuando el principal se recupera, regresa.",
      ],
      dictionaryLabel: "En el diagrama de abajo",
      dictionary: [
        { term: "cada coche", means: "un cliente" },
        { term: "la autopista", means: "el proveedor principal" },
        { term: "el choque", means: "la caída" },
        { term: "la lateral", means: "el proveedor de respaldo" },
        { term: "la app de mapas", means: "Compuerta" },
      ],
    },
    why: { title: "Por qué lo hice", text: "" },
    tryIt: {
      heading: { accent: "Pruébalo" },
      lead: "Treinta clientes le escriben a un asistente de soporte. A media jornada, el proveedor principal deja de contestar.",
      question: "Antes de correrlo, apuesta: con una caída de la solicitud 8 a la 20, ¿se atiende a 24 de 30 clientes o no?",
      yes: "Sí, 24 o más",
      no: "No, menos de 24",
      backupLabel: "Usar la ruta de respaldo",
      outageEndLabel: "La caída termina en la solicitud",
      note: "Cada cuadrito es la solicitud de un cliente, no un segundo de tiempo real. El respaldo también puede fallar de vez en cuando, como cualquier proveedor real.",
      simulate: "Correr",
      cancel: "Cancelar",
      reset: "Empezar de nuevo",
      error: "No se pudo simular la caída. Prueba con otro punto final.",
      idle: "Haz tu apuesta y presiona Correr.",
    },
    compare: {
      heading: { before: "Con", accent: "o sin", after: "respaldo" },
      lead: "La misma caída y los mismos clientes. Lo único que cambia es si existe el desvío.",
      on: "Con respaldo",
      off: "Sin respaldo",
      served: "clientes atendidos",
      sentence: (on, off) => {
        const d = on - off;
        if (d <= 0) return `Las dos configuraciones atendieron a ${on} clientes. Esta caída fue demasiado corta para notar la diferencia.`;
        return `Con respaldo se atendió a ${on} clientes. Sin respaldo, a ${off}. ${d === 1 ? "Es una persona que se quedó" : `Son ${d} personas que se quedaron`} viendo un "intenta más tarde".`;
      },
    },
    fit: {
      heading: { before: "¿Dónde", accent: "sirve?" },
      worthLabel: "Vale la pena",
      worth: "Cuando hay alguien esperando la respuesta del otro lado. Pienso en el chat de soporte de un banco a las once de la noche, o en una compra en línea que se queda girando mientras el cliente decide si mejor se va.",
      notLabel: "No hace falta",
      not: "Si el trabajo puede esperar a mañana, como un reporte que corre de madrugada.",
    },
    proves: {
      heading: { before: "Lo que", accent: "demuestra" },
      text: "Empecé por la pregunta incómoda: ¿qué pasa el día que el proveedor se cae? Luego lo medí en clientes atendidos, porque así lo mide un director de operaciones cuando le preguntan cómo le fue al servicio.",
    },
    engineers: { summary: "Para ingenieros", points: engineerPointsEs, repoLabel: "Código fuente" },
    scene: {
      title: "La ruta que tomó cada solicitud",
      caption: "Mira cómo el proveedor principal se pone en rojo durante la caída y las solicitudes se pasan al respaldo.",
      tapeLabel: "Treinta solicitudes de clientes, en orden",
      nodes: {
        clients: { name: "Clientes", sub: "30 solicitudes", analogy: "los coches" },
        gateway: { name: "Compuerta", sub: "elige la ruta", analogy: "la app de mapas" },
        primary: { name: "Proveedor A", sub: "principal", analogy: "la autopista" },
        backup: { name: "Proveedor B", sub: "respaldo", analogy: "la lateral" },
      },
      tape: { served: "atendida", rerouted: "enviada al respaldo", lost: "perdida" },
      servedOf: (n, total) => `${n} de ${total} clientes atendidos`,
    },
  },
};
```

- [ ] **Step 4: Run to verify pass**

Run: `pnpm vitest run lib/experience/story.test.ts && npx tsc --noEmit`
Expected: 4 pass; tsc silent.

- [ ] **Step 5: Commit**

```bash
git add lib/experience/story.ts lib/experience/story.test.ts
git commit -m "feat: Compuerta story copy in English and Spanish

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Hybrid diagram and story page composition (Compuerta)

**Files:**
- Modify (rewrite): `compuerta/lib/experience/compuerta-scene.tsx`
- Create: `compuerta/lib/experience/scene-state.ts`
- Create: `compuerta/lib/experience/scene-state.test.ts`
- Modify (rewrite): `compuerta/app/[lang]/app/page.tsx`

**Interfaces:**
- Consumes: `tapeCells`, `revealedTicks` (`@/design-system/demo/outcome-tape`); `StoryHero`, `StorySection`, `AnalogyBlock`, `WhyIBuiltIt`, `OutcomeTape`, `FitGuide`, `ProvesBlock`, `EngineerNotes`, `useReducedMotion` (`@/design-system/demo/project-story`); `MissionPrompt`, `MissionComparison` (`@/design-system/demo/mission-lab`); `TracePlayer` (`@/design-system/demo/trace-player`); `useDemoRun` (`@/design-system/demo/use-demo-run`); `runMission`, `MissionResult` (`@/lib/experience/mission`); `ExperienceInput` (`@/lib/experience/adapter`); `STORY` (`@/lib/experience/story`); `SimResult.servedBy` (Task 1).
- Produces:
  - `sceneState(input: ExperienceInput, result: SimResult, revealed: number): { primaryDown: boolean; packetOn: "primary" | "backup" | "none"; cells: TapeStatus[]; served: number }`
  - `COMPLETE_FRAME: PlaybackFrame<TraceEvent>` = `{ visible: 0, total: 0, event: undefined, complete: true }`
  - `CompuertaScene({ frame, input, result, locale }: { frame: PlaybackFrame<TraceEvent>; input: ExperienceInput; result: SimResult; locale: "en" | "es" })`

- [ ] **Step 1: Write the failing test**

Create `lib/experience/scene-state.test.ts`:

```ts
import { expect, test } from "vitest";
import { runExperience } from "./adapter";
import { sceneState, COMPLETE_FRAME } from "./scene-state";
import { revealedTicks } from "@/design-system/demo/outcome-tape";

const signal = new AbortController().signal;

test("fully revealed tape matches the simulation's served count", async () => {
  const input = { outageStart: 8, outageEnd: 20, failover: true, hedge: false };
  const { result } = await runExperience(input, signal, () => {});
  const s = sceneState(input, result.protected, 30);
  expect(s.cells).toHaveLength(30);
  expect(s.cells.filter(c => c !== "lost").length).toBe(result.protected.success);
  expect(s.served).toBe(result.protected.success);
  expect(s.cells.some(c => c === "rerouted")).toBe(true);
});

test("without backup nothing is rerouted", async () => {
  const input = { outageStart: 8, outageEnd: 20, failover: false, hedge: false };
  const { result } = await runExperience(input, signal, () => {});
  expect(sceneState(input, result.protected, 30).cells.includes("rerouted")).toBe(false);
});

test("mid-outage the main provider is down and the packet takes the backup when failover is on", async () => {
  const input = { outageStart: 8, outageEnd: 20, failover: true, hedge: false };
  const { result } = await runExperience(input, signal, () => {});
  const s = sceneState(input, result.protected, 15);
  expect(s.primaryDown).toBe(true);
  expect(s.packetOn).toBe("backup");
});

test("an outage too short to trip the breaker still shows the full result", async () => {
  const input = { outageStart: 8, outageEnd: 10, failover: true, hedge: false };
  const run = await runExperience(input, signal, () => {});
  const frame = run.trace.length === 0 ? COMPLETE_FRAME : { total: run.trace.length, complete: true, event: run.trace.at(-1) };
  expect(revealedTicks(frame, 30)).toBe(30);
  expect(sceneState(input, run.result.protected, revealedTicks(frame, 30)).cells.includes("pending")).toBe(false);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm vitest run lib/experience/scene-state.test.ts`
Expected: FAIL (`Cannot find module './scene-state'`).

- [ ] **Step 3: Implement scene state**

Create `lib/experience/scene-state.ts`:

```ts
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import { tapeCells, type TapeStatus } from "@/design-system/demo/outcome-tape";
import type { SimResult } from "@/lib/compuerta/types";
import type { ExperienceInput } from "./adapter";

/** Used when a run produced no breaker events: show the final result at once. */
export const COMPLETE_FRAME: PlaybackFrame<TraceEvent> = { visible: 0, total: 0, event: undefined, complete: true };

export function sceneState(input: ExperienceInput, result: SimResult, revealed: number): { primaryDown: boolean; packetOn: "primary" | "backup" | "none"; cells: TapeStatus[]; served: number } {
  const cells = tapeCells(result.servedBy, "primary", revealed);
  const last = Math.min(revealed, result.servedBy.length) - 1;
  const primaryDown = last >= 0 && last >= input.outageStart && last < input.outageEnd;
  const lastProvider = last >= 0 ? result.servedBy[last] : "primary";
  const packetOn = lastProvider === null ? "none" : lastProvider === "primary" ? "primary" : "backup";
  return { primaryDown, packetOn, cells, served: cells.filter(c => c === "served" || c === "rerouted").length };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `pnpm vitest run lib/experience/scene-state.test.ts`
Expected: 4 pass. If the "mid-outage" test fails because tick 14 was lost (`packetOn: "none"`), print `result.protected.servedBy.slice(8, 20)` and pick a revealed value whose last tick was served by `backup`; do not change `sceneState`.

- [ ] **Step 5: Rewrite the diagram**

Replace `lib/experience/compuerta-scene.tsx` with:

```tsx
"use client";
import type { PlaybackFrame } from "@/design-system/demo/playback";
import type { TraceEvent } from "@/design-system/demo/types";
import { StoryStage } from "@/design-system/demo/decision-lab";
import { OutcomeTape, useReducedMotion } from "@/design-system/demo/project-story";
import { revealedTicks } from "@/design-system/demo/outcome-tape";
import type { SimResult } from "@/lib/compuerta/types";
import type { ExperienceInput } from "./adapter";
import { sceneState } from "./scene-state";
import { STORY } from "./story";

const NODES = { clients: { x: 10, y: 95 }, gateway: { x: 230, y: 95 }, primary: { x: 470, y: 20 }, backup: { x: 470, y: 170 } } as const;
const W = 150, H = 70;

export function CompuertaScene({ frame, input, result, locale }: { frame: PlaybackFrame<TraceEvent>; input: ExperienceInput; result: SimResult; locale: "en" | "es" }) {
  const copy = STORY[locale].scene;
  const reduced = useReducedMotion();
  const revealed = revealedTicks(frame, result.nTicks, reduced);
  const s = sceneState(input, result, revealed);
  const target = s.packetOn === "backup" ? NODES.backup : NODES.primary;
  const packet = s.packetOn === "none" ? { x: NODES.gateway.x + W / 2, y: NODES.gateway.y + H / 2 } : { x: target.x - 12, y: target.y + H / 2 };
  const node = (key: keyof typeof NODES, tone: string) => {
    const { x, y } = NODES[key]; const n = copy.nodes[key];
    return <g key={key}>
      <rect x={x} y={y} width={W} height={H} rx="10" className={`stroke-2 transition-colors duration-500 motion-reduce:transition-none ${tone}`} />
      <text x={x + W / 2} y={y + 24} textAnchor="middle" className="fill-foreground text-[14px] font-semibold">{n.name}</text>
      <text x={x + W / 2} y={y + 42} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px] uppercase">{n.sub}</text>
      <text x={x + W / 2} y={y + 60} textAnchor="middle" className="fill-accent text-[11px]">= {n.analogy}</text>
    </g>;
  };
  return <StoryStage locale={locale} title={copy.title} caption={copy.caption} step={frame.visible} total={frame.total}>
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={copy.title}>
      <svg role="img" aria-label={copy.servedOf(s.served, result.nTicks)} viewBox="0 0 640 260" className="h-auto w-full min-w-[520px]">
        <path d={`M${NODES.clients.x + W} ${NODES.clients.y + H / 2}H${NODES.gateway.x}`} className="stroke-border" strokeWidth="2" />
        <path d={`M${NODES.gateway.x + W} ${NODES.gateway.y + H / 2}L${NODES.primary.x} ${NODES.primary.y + H / 2}`} className={s.primaryDown ? "stroke-danger" : "stroke-border"} strokeWidth="2" strokeDasharray={s.primaryDown ? "6 6" : undefined} />
        <path d={`M${NODES.gateway.x + W} ${NODES.gateway.y + H / 2}L${NODES.backup.x} ${NODES.backup.y + H / 2}`} className={input.failover ? "stroke-success" : "stroke-border"} strokeWidth="2" strokeDasharray={input.failover ? undefined : "2 6"} />
        {node("clients", "fill-surface stroke-border")}
        {node("gateway", "fill-accent/10 stroke-accent")}
        {node("primary", s.primaryDown ? "fill-danger/15 stroke-danger" : "fill-surface stroke-border")}
        {node("backup", input.failover ? "fill-success/10 stroke-success" : "fill-surface stroke-border opacity-50")}
        <circle cx={packet.x} cy={packet.y} r="8" className="fill-accent transition-all duration-500 motion-reduce:transition-none" />
      </svg>
    </div>
    <div className="mt-6">
      <OutcomeTape cells={s.cells} labels={copy.tape} ariaLabel={copy.tapeLabel} />
      <p className="mt-4 font-mono text-2xl font-semibold tracking-tight">{copy.servedOf(s.served, result.nTicks)}</p>
    </div>
  </StoryStage>;
}
```

- [ ] **Step 6: Rewrite the page**

Replace `app/[lang]/app/page.tsx` with:

```tsx
"use client";
import { useState } from "react";
import { useLocale } from "@/design-system/i18n/context";
import { TracePlayer } from "@/design-system/demo/trace-player";
import { MissionPrompt, MissionComparison } from "@/design-system/demo/mission-lab";
import { useDemoRun } from "@/design-system/demo/use-demo-run";
import { StoryHero, StorySection, AnalogyBlock, WhyIBuiltIt, FitGuide, ProvesBlock, EngineerNotes } from "@/design-system/demo/project-story";
import { traceCopy } from "@/lib/experience/trace-copy";
import { runMission } from "@/lib/experience/mission";
import { CompuertaScene } from "@/lib/experience/compuerta-scene";
import { COMPLETE_FRAME } from "@/lib/experience/scene-state";
import { STORY } from "@/lib/experience/story";

const REPO = "https://github.com/mdeasis27/compuerta";

export default function Page() {
  const locale = useLocale();
  const t = STORY[locale];
  const [failover, setFailover] = useState(true);
  const [outageEnd, setOutageEnd] = useState(20);
  const [prediction, setPrediction] = useState<string | null>(null);
  const demo = useDemoRun(runMission);
  const run = demo.run;
  const result = run?.result;
  const clear = () => { setPrediction(null); demo.reset(); };
  const reset = () => { setFailover(true); setOutageEnd(20); clear(); };
  const input = { outageStart: 8, outageEnd, failover, hedge: false };
  const scene = (frame: typeof COMPLETE_FRAME) => run && result ? <CompuertaScene frame={frame} input={run.input} result={result.protected} locale={locale} /> : null;

  return <main className="mx-auto max-w-5xl px-5 py-8 text-foreground sm:py-12">
    <StoryHero name={t.name} oneLiner={t.oneLiner} chips={t.chips} />

    <StorySection index={1} heading={t.analogy.heading}>
      <AnalogyBlock paragraphs={t.analogy.paragraphs} dictionaryLabel={t.analogy.dictionaryLabel} dictionary={t.analogy.dictionary} />
    </StorySection>

    <WhyIBuiltIt title={t.why.title} text={t.why.text} />

    <StorySection index={2} heading={t.tryIt.heading} lead={t.tryIt.lead}>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
        <section className="min-w-0 rounded-xl border border-border bg-surface p-5">
          <MissionPrompt locale={locale} question={t.tryIt.question} prediction={prediction} onPredict={setPrediction} locked={Boolean(run) || demo.running} options={[{ id: "yes", label: t.tryIt.yes }, { id: "no", label: t.tryIt.no }]} />
          <label className="mt-5 flex items-center gap-2 text-sm"><input type="checkbox" checked={failover} onChange={e => { setFailover(e.target.checked); clear(); }} /> {t.tryIt.backupLabel}</label>
          <label className="mt-5 block text-sm">{t.tryIt.outageEndLabel} <span className="font-mono">{outageEnd}</span>
            <input aria-label={t.tryIt.outageEndLabel} className="mt-2 w-full" type="range" min="10" max="28" value={outageEnd} onChange={e => { setOutageEnd(Number(e.target.value)); clear(); }} />
          </label>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">{t.tryIt.note}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" data-run-experiment disabled={demo.running} className="min-w-0 flex-1 rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white disabled:opacity-60" onClick={() => demo.execute(input)}>{t.tryIt.simulate}</button>
            <button type="button" className="rounded-lg border border-border px-3 py-3 text-sm" onClick={demo.cancel}>{t.tryIt.cancel}</button>
            <button type="button" className="rounded-lg border border-border px-3 py-3 text-sm" onClick={reset}>{t.tryIt.reset}</button>
          </div>
          {demo.error ? <p role="alert" className="mt-3 text-sm text-danger">{t.tryIt.error}</p> : null}
        </section>
        <section className="min-w-0">
          {run && result
            ? (demo.trace.length === 0 ? scene(COMPLETE_FRAME) : <TracePlayer collapsible translate={key => traceCopy(locale, key)} trace={demo.trace} locale={locale} executionMs={run.executionMs} renderStage={scene} />)
            : <p className="rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">{t.tryIt.idle}</p>}
        </section>
      </div>
    </StorySection>

    <StorySection index={3} heading={t.compare.heading} lead={t.compare.lead}>
      {result ? <MissionComparison locale={locale} prediction={prediction} actual={result.protected.success >= 24 ? "yes" : "no"} actualLabel={STORY[locale].scene.servedOf(result.protected.success, result.protected.nTicks)} explanation={t.compare.sentence(result.comparison.enabled.success, result.comparison.disabled.success)} sides={[
        { label: t.compare.on, value: `${result.comparison.enabled.success} / ${result.comparison.enabled.nTicks}`, detail: t.compare.served, positive: result.comparison.enabled.success > result.comparison.disabled.success },
        { label: t.compare.off, value: `${result.comparison.disabled.success} / ${result.comparison.disabled.nTicks}`, detail: t.compare.served },
      ]} /> : null}
    </StorySection>

    <StorySection index={4} heading={t.fit.heading}>
      <FitGuide worthLabel={t.fit.worthLabel} worth={t.fit.worth} notLabel={t.fit.notLabel} not={t.fit.not} />
    </StorySection>

    <StorySection index={5} heading={t.proves.heading}>
      <ProvesBlock text={t.proves.text} />
    </StorySection>

    <EngineerNotes summary={t.engineers.summary}>
      <ul className="list-disc space-y-2 pl-5">{t.engineers.points.map(p => <li key={p}>{p}</li>)}</ul>
      <a className="mt-4 inline-block text-accent underline underline-offset-4" href={REPO}>{t.engineers.repoLabel} →</a>
    </EngineerNotes>
  </main>;
}
```

Notes for the implementer:
- `MissionResult` exposes `comparison.enabled` / `comparison.disabled` (see `lib/experience/mission.ts`); both come from `simulate` with only `failover` toggled.
- If `demo.trace` is not the name exposed by `useDemoRun`, open `design-system/demo/use-demo-run.ts` and use the exact field the old page used (`demo.trace`).
- The page no longer renders the `CompuertaScene` `OutcomeBlock`; that component stays in the design system for other projects.

- [ ] **Step 7: Verify**

Run: `pnpm test && npx tsc --noEmit && pnpm lint && pnpm build`
Expected: all vitest pass (Task 1 + Task 4 + 4 scene-state tests + existing), tsc silent, lint clean, build lists `/[lang]/app`.

- [ ] **Step 8: Commit**

```bash
git add lib/experience/compuerta-scene.tsx lib/experience/scene-state.ts lib/experience/scene-state.test.ts "app/[lang]/app/page.tsx"
git commit -m "feat: Compuerta story page with hybrid diagram and outcome tape

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Hub card links to the demo in the visitor's language

**Files:**
- Create: `portafolio-mdea/src/lib/demo-href.ts`
- Modify: `portafolio-mdea/src/lib/projects.ts` (add `oneLiner?: string` to `ProjectFrontmatter`)
- Modify: `portafolio-mdea/src/components/project-card.tsx`
- Modify: `portafolio-mdea/src/app/[lang]/projects/[slug]/page.tsx:154` (use `demoHref`)
- Modify: `portafolio-mdea/content/projects/en/compuerta.mdx`, `portafolio-mdea/content/projects/es/compuerta.mdx` (frontmatter `oneLiner`)
- Modify: `portafolio-mdea/scripts/portfolio-content.test.mjs` (append tests)
- Modify: `C:/Proyectos/proyectos-portafolio/CLAUDE.md` (rule 4; not a git repo)

**Interfaces:**
- Produces: `demoHref(liveUrl: string, locale: Locale): string` → `new URL(`/${locale}/app`, liveUrl).toString()`.

- [ ] **Step 1: Write the failing tests**

Append to `scripts/portfolio-content.test.mjs`:

```js
import ts from 'typescript';
function loadTs(file){const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;const exports={};new Function('exports',js)(exports);return exports;}

test('demo links keep the visitor language and drop any path on liveUrl', () => {
  const { demoHref } = loadTs('src/lib/demo-href.ts');
  assert.equal(demoHref('https://compuerta-x.vercel.app/app', 'es'), 'https://compuerta-x.vercel.app/es/app');
  assert.equal(demoHref('https://compuerta-x.vercel.app', 'en'), 'https://compuerta-x.vercel.app/en/app');
});

test('projects with a one-liner have it in both languages and a live demo', () => {
  for (const name of fs.readdirSync('content/projects/en').filter(f => f.endsWith('.mdx'))) {
    const en = matter(fs.readFileSync(`content/projects/en/${name}`, 'utf8')).data;
    const es = matter(fs.readFileSync(`content/projects/es/${name}`, 'utf8')).data;
    assert.equal(Boolean(en.oneLiner), Boolean(es.oneLiner), `${name}: oneLiner must exist in both languages`);
    if (en.oneLiner) { assert.ok(en.liveUrl && es.liveUrl, `${name}: oneLiner requires liveUrl`); assert.doesNotMatch(en.oneLiner + es.oneLiner, /—/); }
  }
  assert.ok(matter(fs.readFileSync('content/projects/en/compuerta.mdx', 'utf8')).data.oneLiner);
});
```

The `import ts` line goes at the top of the file with the other imports.

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test:scripts`
Expected: the 2 new tests FAIL (missing `src/lib/demo-href.ts`, missing `oneLiner`).

- [ ] **Step 3: Implement helper and content**

Create `src/lib/demo-href.ts`:

```ts
import type { Locale } from "@/design-system/i18n/locale";

/** Sibling demos redirect a locale-less /app to /en/app, so always include the locale. */
export function demoHref(liveUrl: string, locale: Locale): string {
  return new URL(`/${locale}/app`, liveUrl).toString();
}
```

In `src/lib/projects.ts`, add to `ProjectFrontmatter` after `summary: string;`:

```ts
  oneLiner?: string;
```

In `content/projects/en/compuerta.mdx` frontmatter, after the `summary:` entry, add:

```yaml
oneLiner: An automatic detour for the day the AI service your company relies on stops answering.
```

In `content/projects/es/compuerta.mdx`, same position:

```yaml
oneLiner: Un desvío automático para cuando el servicio de IA del que depende tu empresa deja de contestar.
```

In `src/app/[lang]/projects/[slug]/page.tsx`, replace `href={new URL(`/${lang}/app`, frontmatter.liveUrl).toString()}` with `href={demoHref(frontmatter.liveUrl, lang)}` and add `import { demoHref } from "@/lib/demo-href";`.

- [ ] **Step 4: Update the card**

In `src/components/project-card.tsx`, add `import { demoHref } from "@/lib/demo-href";` and, at the start of `ProjectCard` after `const href = ...`, add this early return. Cards without `oneLiner` keep the existing markup unchanged.

```tsx
  if (frontmatter.oneLiner && frontmatter.liveUrl) {
    const demo = demoHref(frontmatter.liveUrl, locale);
    return (
      <Card className="relative h-full transition-all duration-300 hover:border-foreground/30 hover:shadow-sm focus-within:ring-2 focus-within:ring-foreground/40">
        <div className="relative mx-3 aspect-[16/9] overflow-hidden rounded-lg border border-border/60 bg-muted">
          <Image src={`/project-captures/${frontmatter.slug}.stage${locale === "es" ? ".es" : ""}.png`} alt={locale === "en" ? `${frontmatter.title}: actual interactive demo` : `${frontmatter.title}: demo interactiva real`} fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="object-cover object-top" />
        </div>
        <CardHeader className="gap-3">
          <div className="flex items-center justify-between gap-3">
            <Badge variant={`status-${frontmatter.status}` as const}>{c.status[frontmatter.status]} · {frontmatter.year}</Badge>
            <ArrowUpRight className="size-4 text-foreground/40" />
          </div>
          <CardTitle className="text-xl leading-snug">
            <a href={demo} className="after:absolute after:inset-0 focus-visible:outline-none">{frontmatter.title}</a>
          </CardTitle>
          <CardDescription className="text-[15px] leading-6 text-foreground/70">{frontmatter.oneLiner}</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-accent">{locale === "es" ? "Probar la demo" : "Try the demo"} →</span>
          <Link href={href} className="relative z-10 text-sm text-foreground/60 underline-offset-4 hover:underline">{c.caseStudy}</Link>
        </CardFooter>
      </Card>
    );
  }
```

- [ ] **Step 5: Verify**

Run: `pnpm test:scripts && node --test design-system/demo/*.node-test.mjs && npx tsc --noEmit && pnpm lint && pnpm build`
Expected: script tests pass (10), node tests 13 pass, tsc silent, lint clean, build OK.

- [ ] **Step 6: Update the meta-folder rule**

In `C:/Proyectos/proyectos-portafolio/CLAUDE.md`, replace rule 4 with:

```md
4. Case studies in the hub follow a 5-H2 structure: `El problema / El enfoque / Decisiones de diseño / Estado actual / Lo que demuestra`. Projects migrated to a story page (see `portafolio-mdea/docs/superpowers/specs/2026-10-04-project-story-pages-design.md`) present their demo as the story and keep that technical content under "For engineers".
```

- [ ] **Step 7: Commit (hub only; the meta CLAUDE.md is not in git)**

```bash
cd /c/Proyectos/proyectos-portafolio/portafolio-mdea
git add src/lib/demo-href.ts src/lib/projects.ts src/components/project-card.tsx "src/app/[lang]/projects/[slug]/page.tsx" content/projects/en/compuerta.mdx content/projects/es/compuerta.mdx scripts/portfolio-content.test.mjs
git commit -m "feat: project cards open the story demo in the visitor's language

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: End-to-end verification and preview deploy

**Files:**
- Create (scratch, not committed): a Playwright capture script in the session scratchpad.

- [ ] **Step 1: Full suites in both repos**

```bash
cd /c/Proyectos/proyectos-portafolio/compuerta && pnpm test && (cd backend && python -m pytest -q) && node --test design-system/demo/*.node-test.mjs && npx tsc --noEmit && pnpm lint && pnpm build
cd /c/Proyectos/proyectos-portafolio/portafolio-mdea && pnpm test:scripts && node --test design-system/demo/*.node-test.mjs && npx tsc --noEmit && pnpm lint && pnpm build
```

Expected: every command exits 0. Record the counts for the report.

- [ ] **Step 2: Screenshots of the Compuerta story page**

Start Compuerta: `pnpm start -p 3101` (run in background after the build). Capture with Python Playwright, for each of `/en/app` and `/es/app`, at 1440×900 and 390×844, once normally and once with `page.emulate_media(reduced_motion="reduce")`. For each capture: load, click `[data-run-experiment]`, wait 6 s, full-page screenshot. Also assert in the script:
- `document.documentElement.scrollWidth <= window.innerWidth` (no horizontal page overflow at 390 px),
- `document.querySelectorAll('[data-tape-cell]').length === 30`,
- under reduced motion, `document.querySelectorAll('[data-tape-cell="pending"]').length === 0`,
- with the slider set to 10, after Run, no `pending` cells either.

Review every screenshot visually. Stop the server afterwards.

- [ ] **Step 3: Read the copy aloud**

Read `lib/experience/story.ts` EN and ES strings once more against the Global Constraints forbidden list and the spec's writing rules. Fix wording in `story.ts` only, rerun `pnpm vitest run lib/experience/story.test.ts`, commit as `fix(copy): ...` if anything changed.

- [ ] **Step 4: Push branches and get preview URLs**

```bash
cd /c/Proyectos/proyectos-portafolio/compuerta && git push -u origin feat/project-story-pilot
cd /c/Proyectos/proyectos-portafolio/portafolio-mdea && git push
```

Find each preview deployment for branch `feat/project-story-pilot` (Vercel MCP `list_deployments` for projects `compuerta` and `portafolio-mdea` in team `manueldeasis27-2515s-projects`, or `gh api repos/mdeasis27/<repo>/deployments`). Confirm `curl -s -o /dev/null -w "%{http_code}" <preview>/es/app` returns 200 for Compuerta and `<preview>/es/projects` returns 200 for the hub. If the preview is protected (401), report it with the dashboard link; do not change protection settings.

- [ ] **Step 5: Report**

Report to Manuel in Spanish: test counts per repo, the screenshot findings, both preview URLs, and the reminder that "Por qué lo hice" is still empty. Do not merge to `main`.
