# Plan 2 — Project Migration Design Spec

**Date:** 2026-04-16
**Status:** Design approved, ready for `writing-plans`.
**Supersedes scope:** Phases 4–6 of `2026-04-16-mdea-brand-design-system.md`.

## Context

Plan 1 (Hub Foundation) shipped: the hub `portafolio-mdea/` lives inside the meta-folder `C:/Proyectos/proyectos-portafolio/`, owns the `design-system/` and `ai-kit/` source-of-truth, and is deployed at `https://portafolio-mdea.vercel.app`.

Two sibling projects still live outside the meta-folder and run the pre-brand-v2 design:

- `C:/Proyectos/agente-riesgo/` — live on Vercel as `agente-riesgo`.
- `C:/Proyectos/identidad-360/` — live on Vercel as `identidad-360`.

This spec covers the work needed to bring both siblings into the meta-folder, adopt the brand v2 design system, and introduce two propagation scripts so future hub changes flow to siblings with one command each.

## Goals

1. Physically relocate both siblings into `C:/Proyectos/proyectos-portafolio/`.
2. Each sibling adopts the brand v2 `design-system/` (and `ai-kit/` if it uses LLMs), deploys green on Vercel, and renders the new identity in production.
3. Introduce `brand:propagate` and `ai:propagate` scripts in the hub so a single command pushes kit updates to all declared siblings.
4. Introduce a declarative config file `portfolio.config.mjs` at the hub root as the single source of truth for which siblings exist and which kits each consumes.

## Non-goals

- Custom domain setup (`manueldeasis.com`) — deferred.
- Touching any sibling outside `identidad-360` and `agente-riesgo` (e.g., `tramitesmx`, `interviews`, `vertical-ai-analyzer`) — out of scope.
- Portfolio intake automation (scanning for new projects, `BRIEF.md` scaffolding) — deferred to a later spec.
- CI/CD changes (GitHub Actions, dependabot) — deferred.
- Refactoring the `design-system/` or `ai-kit/` themselves — this spec only distributes them.

## Decisions (closed during brainstorm — do not re-open)

| # | Decision | Rationale |
|---|---|---|
| D1 | **Sequential migration, one sibling at a time, fully complete before touching the next.** | Two live Vercel deploys; risk is real. Plan 1 surfaced Windows+pnpm gotchas. Safer than parallel. |
| D2 | **Migration order: `identidad-360` first, then `agente-riesgo`.** | Pilot with lower-stake sibling; if the recipe breaks, the more prominent case study is still intact. |
| D3 | **Rollback: Vercel Instant Rollback primary; `git revert` + push fallback.** | Instant Rollback restores availability in ~5s; `git revert` only if dashboard is unavailable or we want git to reflect the rollback. |
| D4 | **Two separate scripts: `brand:propagate` and `ai:propagate`.** | Explicit, unix-philosophy, mirrors the existing `brand:sync` / `ai:sync` pair in siblings. Each script ≈ 50 lines. |
| D5 | **Sibling discovery: declarative config `portfolio.config.mjs` at hub root.** | Single source of truth across both scripts. Avoids filesystem-magic coupling policy to mechanism. |

## Architecture

### Final filesystem

```
C:/Proyectos/proyectos-portafolio/
├── CLAUDE.md                          (meta-folder, already exists)
├── portafolio-mdea/                   (hub)
│   ├── design-system/                 (source of truth)
│   ├── ai-kit/                        (source of truth)
│   ├── portfolio.config.mjs           (NEW)
│   └── scripts/
│       ├── brand-sync.mjs             (exists; refactored to import from lib/sync-kit)
│       ├── ai-sync.mjs                (exists; refactored to import from lib/sync-kit)
│       ├── brand-propagate.mjs        (NEW)
│       ├── ai-propagate.mjs           (NEW)
│       └── lib/
│           ├── sync-kit.mjs           (NEW — extracted from brand-sync.mjs, adds dryRun)
│           └── propagate.mjs          (NEW — shared helper for both propagate scripts)
├── identidad-360/                     (migrated — 1st)
│   ├── design-system/                 (synced copy from hub)
│   ├── ai-kit/                        (synced copy, if used)
│   └── ...
└── agente-riesgo/                     (migrated — 2nd)
    └── (same shape)
```

### `portfolio.config.mjs`

Single source of truth for which siblings participate in the portfolio and which kits each consumes. Lives at the hub root.

```js
// portafolio-mdea/portfolio.config.mjs
export default {
  siblings: [
    { name: 'identidad-360', kits: ['brand', 'ai'] },
    { name: 'agente-riesgo',  kits: ['brand', 'ai'] },
  ],
};
```

- `name` — directory name of the sibling. Resolved relative to the hub: `path.resolve(hubDir, '..', name)`.
- `kits` — array of kit identifiers. Valid values: `'brand'`, `'ai'`. All siblings are expected to include `'brand'`; `'ai'` is opt-in.
- **No extra metadata.** YAGNI — if a future plan needs `liveUrl`, `vercelProject`, `stack`, etc., extend the shape then.

### Hub ↔ sibling contract

- **Hub** is source of truth for `design-system/` and `ai-kit/`. All edits happen in the hub.
- **Siblings** hold read-only synced copies. Editing these directories inside a sibling is disallowed by convention — edits live in the hub, then `pnpm brand:propagate` or `pnpm ai:propagate` pushes them out.
- If a sibling diverges accidentally (manual edit, merge conflict), the next propagate run overwrites. Propagate is a deliberate, manual command — never automatic.

## Migration procedure (per sibling)

Executed sequentially: `identidad-360` first. Repeat verbatim for `agente-riesgo` after the first succeeds.

### Step 1 — Pre-flight at the current location

Inside `C:/Proyectos/<sibling>/`:

1. `git status` — working tree must be clean. If not, commit or stash first.
2. `git log origin/main..main` — no unpushed commits; push anything pending before migrating.
3. Record the current production deployment URL (`vercel inspect <url>` or dashboard) — this is the rollback anchor.

### Step 2 — Physical move (manual, outside Claude Code)

Manuel moves the directory using Windows Explorer or an external terminal (Claude Code's shell handle blocks `mv` — see `feedback_windows_mv.md`):

```
C:/Proyectos/<sibling>  →  C:/Proyectos/proyectos-portafolio/<sibling>
```

Claude Code reopens at the new path.

### Step 3 — Local reconciliation at the new location

Inside `C:/Proyectos/proyectos-portafolio/<sibling>/`:

1. `CI=true pnpm install` — reconciles pnpm symlinks broken by the move (confirmed failure mode from Plan 1).
2. `pnpm build` — must pass identical to pre-move state.
3. `pnpm lint` — must pass (or be unconfigured). No skips.
4. Smoke test locally: `pnpm dev`, open the home page and primary case study in a browser, verify render.

If any step fails, investigate before moving on. Do not push to main yet.

### Step 4 — Adopt brand v2

Inside the sibling at the new location:

1. `pnpm brand:sync` — replaces the sibling's `design-system/` with the v2 version from the hub.
2. If the sibling uses LLMs: `pnpm ai:sync` — replaces its `ai-kit/`.
3. `pnpm build` again — confirm the sibling compiles with the new kits.
4. Smoke test again: `pnpm dev`, verify brand v2 renders (Fraunces H1, zinc+blue palette, new component styles, MDX components if used).

### Step 5 — Update hub config

In `portafolio-mdea/portfolio.config.mjs`, add the sibling:

```js
{ name: '<sibling>', kits: ['brand', /* 'ai' if applicable */] },
```

Commit this change in the hub but do **not** push yet — wait until the sibling deploy is confirmed green in Step 7.

### Step 6 — Commit and push in the sibling

Inside the sibling:

```bash
git add -A
git commit -m "chore: migrate to meta-folder + adopt brand v2"
git push origin main
```

Vercel auto-deploys.

### Step 7 — Watch the deploy

Monitor the new deployment:

- `vercel inspect <new-deployment-url>` or dashboard.
- Wait for **READY**.

**If READY:**
- Push the hub commit from Step 5.
- Mark the sibling as complete; move to the next.

**If ERROR or 500 runtime:** trigger rollback (below).

### Step 8 — Success criteria (per sibling)

- [ ] Sibling physically at `C:/Proyectos/proyectos-portafolio/<sibling>/`.
- [ ] `origin/main` == local `main` (no divergence).
- [ ] Latest Vercel production deploy = READY; public URL returns 200.
- [ ] Home + primary case study render with brand v2 in production (manual visual check).
- [ ] `portafolio-mdea/portfolio.config.mjs` includes the sibling.
- [ ] Hub commit with updated config pushed.

## Pre-push gates (mandatory before every `git push origin main` in a sibling)

| Gate | Command | Catches |
|---|---|---|
| 1. Install clean | `CI=true pnpm install` exit 0 | Broken pnpm symlinks post-move |
| 2. Build green | `pnpm build` exit 0 | Next.js compile errors, MDX parse errors, missing routes |
| 3. Lint green | `pnpm lint` exit 0 (or skip if not configured) | TypeScript + ESLint violations |

Optional: local visual smoke (`pnpm dev` + browse). Recommended for every migration — Plan 1 showed visual issues that all three gates missed.

## Rollback

**Trigger conditions** (any one):
- Vercel build error on the new deployment.
- Production URL returns non-200 after deploy settles.
- Page renders catastrophically broken (complete layout collapse, missing fonts, white-on-white text). Minor visual details do not trigger rollback — fix forward.

**Primary action — Vercel Instant Rollback:**
1. Vercel dashboard → project → Deployments.
2. Select the previous READY production deployment.
3. Click "Promote to Production". Takes ~5 seconds.
4. Production is restored. Commit that caused the issue remains on `main` but no longer serves traffic.

**Fallback — `git revert` + push:**

Use only if Instant Rollback is unavailable or git state must reflect the rollback:

```bash
git revert <problem-commit-hash>
git push origin main
```

Vercel auto-deploys the reverted state in 30–60s.

**After rollback:** investigate without pressure. Push a fix as a new commit when ready; Vercel deploys it. If green, the sibling migration is complete.

## `portfolio.config.mjs` parsing and validation

Loaded by both propagate scripts via dynamic import:

```js
const configPath = path.join(hubDir, 'portfolio.config.mjs');
const config = (await import(pathToFileURL(configPath).href)).default;
```

Validation (must fail fast with clear errors):

- `config` is an object.
- `config.siblings` is an array.
- Each entry has a string `name` and an array `kits` whose values are all in `['brand', 'ai']`.
- No duplicate `name` entries.
- Each `name` resolves to an existing directory at `path.resolve(hubDir, '..', name)`.

## Propagate scripts

### API

Executed from the hub:

```bash
pnpm brand:propagate              # propagates design-system to all "brand" siblings
pnpm brand:propagate --dry-run    # lists what would change, writes nothing
pnpm ai:propagate                 # propagates ai-kit to all "ai" siblings
pnpm ai:propagate --dry-run       # same, for ai-kit
```

### Shared helper — `scripts/lib/propagate.mjs`

```js
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { syncKit } from './sync-kit.mjs'; // existing shared helper from Plan 1

export async function propagateKit({ hubDir, kitName, kitSourceDir, kitTargetDir, dryRun = false }) {
  const configPath = path.join(hubDir, 'portfolio.config.mjs');
  const config = (await import(pathToFileURL(configPath).href)).default;

  validateConfig(config, hubDir);

  const targets = config.siblings.filter(s => s.kits.includes(kitName));
  const results = [];

  for (const sibling of targets) {
    const siblingDir = path.resolve(hubDir, '..', sibling.name);
    await assertSiblingHealthy(siblingDir);

    const result = await syncKit({
      source: path.join(hubDir, kitSourceDir),
      target: path.join(siblingDir, kitTargetDir),
      kitName,
      dryRun,
    });
    results.push({ sibling: sibling.name, ...result });
  }

  return results;
}
```

- `assertSiblingHealthy` — checks that (a) the sibling directory exists, (b) it's a git repo, (c) working tree is clean. Aborts the whole run if any check fails (no partial propagation).
- `syncKit` — currently lives as an exported function inside `scripts/brand-sync.mjs` and is imported by `scripts/ai-sync.mjs`. As part of Plan 2, **extract it to `scripts/lib/sync-kit.mjs`** so `brand-sync.mjs`, `ai-sync.mjs`, and both propagate scripts import it from one place. Extend the function to accept an optional `dryRun` flag that makes it return a planned-manifest without writing.

### Public scripts

`scripts/brand-propagate.mjs`:

```js
import { propagateKit } from './lib/propagate.mjs';

const dryRun = process.argv.includes('--dry-run');
const results = await propagateKit({
  hubDir: process.cwd(),
  kitName: 'brand',
  kitSourceDir: 'design-system',
  kitTargetDir: 'design-system',
  dryRun,
});

printSummary(results, { kit: 'brand', dryRun });
```

`scripts/ai-propagate.mjs` — identical shape, `kitName: 'ai'`, `kitSourceDir: 'ai-kit'`, `kitTargetDir: 'ai-kit'`.

### Safety rules

1. **Working tree check** per sibling before touching files. Abort-fail if dirty.
2. **Dry-run flag** available on both scripts. Must list every file that would change without writing.
3. **No automated git operations in siblings.** The script leaves modified files in the sibling's working tree. Manuel reviews the diff and decides what to commit.
4. **Propagate runs are atomic per sibling but not across siblings.** If sibling 1 propagates cleanly and sibling 2 fails the health check, sibling 1 keeps its changes (in working tree, unreviewed). The script reports clearly which siblings succeeded and which didn't.

### Package scripts

Append to `portafolio-mdea/package.json`:

```json
{
  "scripts": {
    "brand:propagate": "node scripts/brand-propagate.mjs",
    "ai:propagate": "node scripts/ai-propagate.mjs"
  }
}
```

## Testing

Reuse the Plan 1 TDD pattern (`node:test`, fixture-based, no real filesystem writes beyond a temp dir).

Test file: `scripts/lib/propagate.test.mjs`.

Test cases:

1. Parses a valid `portfolio.config.mjs` and returns the correct filtered list per kit.
2. Rejects malformed configs (missing `siblings`, non-array `kits`, unknown kit names, duplicate sibling names).
3. Rejects non-existent sibling directories with a clear error.
4. Rejects siblings with a dirty working tree with a clear error.
5. Invokes `syncKit` with correct `source` / `target` paths for each sibling.
6. `--dry-run` mode reports planned changes without invoking `syncKit` in write mode.

Fixtures: `scripts/lib/__fixtures__/mini-portfolio/` with a stub hub and two stub siblings (one with brand+ai, one with brand only) — sized small, git-committed as fixtures.

**Regression coverage:** the existing `scripts/brand-sync.test.mjs` and `scripts/ai-sync.test.mjs` must keep passing after the `syncKit` extraction to `scripts/lib/sync-kit.mjs`. Add one extra test in `scripts/lib/sync-kit.test.mjs` for the new `dryRun` flag.

## Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| pnpm symlinks broken after `mv` | High (Plan 1 confirmed) | Medium (build fails locally) | Mandatory `CI=true pnpm install` in Step 3. |
| Sibling has env vars Vercel needs that we forget to preserve | Medium | High (deploy 500s) | Step 1 includes checking Vercel dashboard env var list before migrating; no changes to env var list during migration. |
| `brand:sync` overwrites custom sibling-local components | Medium | Medium (sibling loses tweaks) | Assume no sibling currently has local overrides (siblings were synced from the old design-system). Validate by inspecting each sibling's `design-system/` diff vs. hub before Step 4. If unexpected local edits found, extract and escalate before overwriting. |
| Case study MDX in sibling references components the new `design-system/` doesn't export | Medium | High (build breaks) | Build gate in Step 3 catches this pre-sync; build gate in Step 4 (post-sync) catches regressions introduced by the sync. |
| Vercel deploy succeeds but runtime 500s (e.g., broken dynamic import) | Low | High (site down) | Post-deploy smoke test is mandatory; rollback via Instant Rollback is 5s. |
| `portfolio.config.mjs` committed to hub before sibling deploy confirmed green | Low | Low (out-of-sync hub for minutes) | Step 5 explicitly commits without pushing; Step 7 pushes only after sibling deploy READY. |

## Out of scope / deferred

- **Custom domain** (`manueldeasis.com` or similar) — handled in a future task, unblocked by this plan.
- **Portfolio intake automation** (`BRIEF.md` template, `pnpm portfolio:scan`) — future spec.
- **More kits** (e.g., `analytics-kit`, `legal-kit`) — pattern is extensible; not built now.
- **Auto-commit in propagate scripts** — deliberately not built. Manual review preserved.
- **CI enforcement of "no edits to synced kits in siblings"** — a `pre-commit` hook could enforce this; deferred.
- **Monorepo migration** (pnpm workspaces across all siblings) — explicitly rejected in spec v2. Each project stays independent.

## Success criteria for Plan 2 overall

- [ ] `identidad-360` lives in the meta-folder, deployed green, renders brand v2.
- [ ] `agente-riesgo` lives in the meta-folder, deployed green, renders brand v2.
- [ ] `portafolio-mdea/portfolio.config.mjs` lists both siblings with correct kits.
- [ ] `pnpm brand:propagate` runs cleanly against both siblings (dry-run shows no unexpected diffs).
- [ ] `pnpm ai:propagate` runs cleanly against both siblings (if both use AI).
- [ ] Test suite for `propagate.mjs` passes (6 cases above).
- [ ] Hub pushed to origin with all above in place.
- [ ] Both sibling production URLs return 200 and render brand v2.

## Estimated effort

- **identidad-360 migration:** ~2h (including investigation time, local validation, deploy watch).
- **agente-riesgo migration:** ~1h (recipe learned, fewer surprises).
- **`portfolio.config.mjs` + propagate scripts + tests:** ~2h.
- **Integration, hub commits, final verification:** ~1h.
- **Total:** 5–7h.
