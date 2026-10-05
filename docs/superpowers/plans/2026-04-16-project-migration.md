# Project Migration (Plan 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `identidad-360` and `agente-riesgo` into the meta-folder `C:/Proyectos/proyectos-portafolio/`, adopt brand v2 in both, and build `brand:propagate` + `ai:propagate` scripts driven by a declarative `portfolio.config.mjs`.

**Architecture:** Two phases. First, build the tooling in the hub (Phase A): refactor `syncKit` into a shared lib, add `dryRun`, add `portfolio.config.mjs`, build propagate scripts with TDD. Then migrate siblings sequentially (Phase B: `identidad-360`, Phase C: `agente-riesgo`) using the same recipe — pre-flight, manual mv handoff, local reconciliation, brand adoption, push, watch deploy, update hub config. Phase D validates both propagate scripts against real siblings.

**Tech Stack:** Node.js 22, pnpm 9, `node:test` (no external deps), Next.js 16, deployment platform. Tests follow Plan 1's pattern (`mkdtempSync` fixtures, no external mock libs).

---

## Phase A — Build tooling in hub

### Task 1: Extract `syncKit` to `scripts/lib/sync-kit.mjs`

**Files:**
- Create: `scripts/lib/sync-kit.mjs`
- Modify: `scripts/brand-sync.mjs` (remove `syncKit` definition, import from lib)
- Modify: `scripts/ai-sync.mjs` (update import path)
- Modify: `scripts/brand-sync.test.mjs` (update import path)

- [ ] **Step 1: Create `scripts/lib/sync-kit.mjs`** with the current `syncKit` implementation (copy from `scripts/brand-sync.mjs` lines 1–57, minus the CLI block at lines 59–73).

```js
// scripts/lib/sync-kit.mjs
// Shared kit sync primitive. Used by brand-sync, ai-sync, brand-propagate, ai-propagate.
import {
  readdirSync, statSync, mkdirSync, copyFileSync,
  rmSync, existsSync, writeFileSync,
} from "node:fs";
import path from "node:path";

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
  const targetFiles = existsSync(target)
    ? new Set(walk(target).filter((f) => !f.endsWith("-sync-manifest.json")))
    : new Set();

  for (const rel of sourceFiles) {
    const src = path.join(source, rel);
    const dst = path.join(target, rel);
    mkdirSync(path.dirname(dst), { recursive: true });
    copyFileSync(src, dst);
  }

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
  writeFileSync(
    path.join(target, `.${kitName}-sync-manifest.json`),
    JSON.stringify(manifest, null, 2)
  );
  return manifest;
}
```

- [ ] **Step 2: Rewrite `scripts/brand-sync.mjs`** to import `syncKit` from the new lib and keep only the CLI.

```js
// scripts/brand-sync.mjs
// Copies design-system/ from the hub into the current repo.
// Usage from consumer repo: node ../portafolio-mdea/scripts/brand-sync.mjs
import path from "node:path";
import { existsSync } from "node:fs";
import { parseArgs } from "node:util";
import { syncKit } from "./lib/sync-kit.mjs";

const { values } = parseArgs({
  options: {
    from: { type: "string", default: ".." },
  },
});
const hubDir = path.resolve(process.cwd(), values.from, "portafolio-mdea");
const sourceDir = existsSync(hubDir)
  ? path.join(hubDir, "design-system")
  : path.resolve(process.cwd(), values.from, "design-system");
const targetDir = path.join(process.cwd(), "design-system");

console.log(`[brand-sync] ${sourceDir} → ${targetDir}`);
const manifest = syncKit({ source: sourceDir, target: targetDir, kitName: "brand" });
console.log(`[brand-sync] synced ${manifest.files.length} files at ${manifest.syncedAt}`);

export { syncKit }; // re-export for backwards compat during transition
```

- [ ] **Step 3: Update import in `scripts/ai-sync.mjs`**

Replace line 6:

```js
import { syncKit } from "./brand-sync.mjs";
```

with:

```js
import { syncKit } from "./lib/sync-kit.mjs";
```

- [ ] **Step 4: Update import in `scripts/brand-sync.test.mjs`**

Replace line 7:

```js
import { syncKit } from "./brand-sync.mjs";
```

with:

```js
import { syncKit } from "./lib/sync-kit.mjs";
```

- [ ] **Step 5: Run existing tests — must all pass**

```bash
node --test scripts/brand-sync.test.mjs
node --test scripts/ai-sync.test.mjs
```

Expected: 3 tests pass in `brand-sync.test.mjs`, 1 test passes in `ai-sync.test.mjs`. No failures.

- [ ] **Step 6: Build verification**

```bash
pnpm build
```

Expected: exit 0, no errors.

- [ ] **Step 7: Commit**

```bash
git add scripts/lib/sync-kit.mjs scripts/brand-sync.mjs scripts/ai-sync.mjs scripts/brand-sync.test.mjs
git commit -m "refactor(scripts): extract syncKit to lib/sync-kit.mjs"
```

---

### Task 2: Add `dryRun` support to `syncKit`

**Files:**
- Modify: `scripts/lib/sync-kit.mjs`
- Create: `scripts/lib/sync-kit.test.mjs`

- [ ] **Step 1: Write failing test**

Create `scripts/lib/sync-kit.test.mjs`:

```js
// scripts/lib/sync-kit.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { syncKit } from "./sync-kit.mjs";

test("syncKit with dryRun: true does not write to target", () => {
  const source = mkdtempSync(path.join(tmpdir(), "src-"));
  const target = mkdtempSync(path.join(tmpdir(), "tgt-"));
  writeFileSync(path.join(source, "tokens.css"), ":root {}");

  const manifest = syncKit({ source, target, kitName: "brand", dryRun: true });

  assert.equal(existsSync(path.join(target, "tokens.css")), false, "file must NOT be copied in dry run");
  assert.equal(existsSync(path.join(target, ".brand-sync-manifest.json")), false, "manifest must NOT be written in dry run");
  assert.equal(manifest.dryRun, true);
  assert.ok(Array.isArray(manifest.files));
  assert.equal(manifest.files.length, 1);

  rmSync(source, { recursive: true, force: true });
  rmSync(target, { recursive: true, force: true });
});

test("syncKit with dryRun: true reports files that would be deleted", () => {
  const source = mkdtempSync(path.join(tmpdir(), "src-"));
  const target = mkdtempSync(path.join(tmpdir(), "tgt-"));
  writeFileSync(path.join(source, "a.css"), "a");
  writeFileSync(path.join(target, "stale.css"), "old");

  const manifest = syncKit({ source, target, kitName: "brand", dryRun: true });

  assert.equal(existsSync(path.join(target, "stale.css")), true, "stale.css must still exist after dry run");
  assert.deepEqual(manifest.wouldDelete, ["stale.css"]);

  rmSync(source, { recursive: true, force: true });
  rmSync(target, { recursive: true, force: true });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
node --test scripts/lib/sync-kit.test.mjs
```

Expected: both tests fail (no `dryRun` support yet).

- [ ] **Step 3: Modify `scripts/lib/sync-kit.mjs`** — update `syncKit` to support `dryRun`:

```js
export function syncKit({ source, target, kitName = "brand", dryRun = false }) {
  if (!existsSync(source)) throw new Error(`Source not found: ${source}`);
  if (!dryRun && !existsSync(target)) mkdirSync(target, { recursive: true });

  const sourceFiles = new Set(walk(source));
  const targetFiles = existsSync(target)
    ? new Set(walk(target).filter((f) => !f.endsWith("-sync-manifest.json")))
    : new Set();

  const wouldDelete = [...targetFiles].filter((f) => !sourceFiles.has(f));

  if (dryRun) {
    return {
      kit: kitName,
      dryRun: true,
      sourcePath: source,
      files: [...sourceFiles].sort(),
      wouldDelete: wouldDelete.sort(),
    };
  }

  for (const rel of sourceFiles) {
    const src = path.join(source, rel);
    const dst = path.join(target, rel);
    mkdirSync(path.dirname(dst), { recursive: true });
    copyFileSync(src, dst);
  }

  for (const rel of wouldDelete) {
    rmSync(path.join(target, rel), { force: true });
  }

  const manifest = {
    kit: kitName,
    syncedAt: new Date().toISOString(),
    sourcePath: source,
    files: [...sourceFiles].sort(),
  };
  writeFileSync(
    path.join(target, `.${kitName}-sync-manifest.json`),
    JSON.stringify(manifest, null, 2)
  );
  return manifest;
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
node --test scripts/lib/sync-kit.test.mjs scripts/brand-sync.test.mjs scripts/ai-sync.test.mjs
```

Expected: 2 new tests pass; 3 existing `brand-sync.test.mjs` tests still pass; 1 `ai-sync.test.mjs` test still passes. Total 6 passes.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/sync-kit.mjs scripts/lib/sync-kit.test.mjs
git commit -m "feat(scripts): add dryRun flag to syncKit"
```

---

### Task 3: Create `portfolio.config.mjs` with empty siblings

**Files:**
- Create: `portfolio.config.mjs`

- [ ] **Step 1: Create the config file** at the hub root with an empty siblings array (siblings get added as each migration completes).

```js
// portfolio.config.mjs
// Source of truth for portfolio siblings and which kits each consumes.
// Consumed by scripts/brand-propagate.mjs and scripts/ai-propagate.mjs.

/**
 * @typedef {Object} SiblingEntry
 * @property {string} name           - directory name, resolved relative to the hub as `../<name>`.
 * @property {Array<'brand'|'ai'>} kits - kits this sibling consumes.
 */

/** @type {{ siblings: SiblingEntry[] }} */
export default {
  siblings: [
    // Populated as siblings are migrated (see Plan 2).
    // Example: { name: 'identidad-360', kits: ['brand', 'ai'] },
  ],
};
```

- [ ] **Step 2: Build verification**

```bash
pnpm build
```

Expected: exit 0. Next.js should ignore the file (it's not in `src/`).

- [ ] **Step 3: Commit**

```bash
git add portfolio.config.mjs
git commit -m "feat: add portfolio.config.mjs (empty siblings)"
```

---

### Task 4: Build `scripts/lib/load-config.mjs` with validation + tests

**Files:**
- Create: `scripts/lib/load-config.mjs`
- Create: `scripts/lib/load-config.test.mjs`

- [ ] **Step 1: Write failing tests**

Create `scripts/lib/load-config.test.mjs`:

```js
// scripts/lib/load-config.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { loadPortfolioConfig } from "./load-config.mjs";

function setupHub(configSource) {
  const hubDir = mkdtempSync(path.join(tmpdir(), "hub-"));
  writeFileSync(path.join(hubDir, "portfolio.config.mjs"), configSource);
  return hubDir;
}

test("loadPortfolioConfig returns siblings array from a valid config", async () => {
  const hubDir = setupHub(`export default { siblings: [{ name: "x", kits: ["brand"] }] };`);
  // Sibling directory must exist for validation to pass.
  mkdirSync(path.join(hubDir, "..", "x"), { recursive: true });

  const config = await loadPortfolioConfig(hubDir);

  assert.equal(config.siblings.length, 1);
  assert.equal(config.siblings[0].name, "x");
  assert.deepEqual(config.siblings[0].kits, ["brand"]);

  rmSync(hubDir, { recursive: true, force: true });
  rmSync(path.join(hubDir, "..", "x"), { recursive: true, force: true });
});

test("loadPortfolioConfig rejects missing siblings array", async () => {
  const hubDir = setupHub(`export default {};`);
  await assert.rejects(
    () => loadPortfolioConfig(hubDir),
    /siblings must be an array/
  );
  rmSync(hubDir, { recursive: true, force: true });
});

test("loadPortfolioConfig rejects unknown kit names", async () => {
  const hubDir = setupHub(`export default { siblings: [{ name: "x", kits: ["wat"] }] };`);
  await assert.rejects(
    () => loadPortfolioConfig(hubDir),
    /unknown kit/i
  );
  rmSync(hubDir, { recursive: true, force: true });
});

test("loadPortfolioConfig rejects duplicate sibling names", async () => {
  const hubDir = setupHub(`
    export default {
      siblings: [
        { name: "x", kits: ["brand"] },
        { name: "x", kits: ["ai"] }
      ]
    };
  `);
  await assert.rejects(
    () => loadPortfolioConfig(hubDir),
    /duplicate sibling/i
  );
  rmSync(hubDir, { recursive: true, force: true });
});

test("loadPortfolioConfig rejects non-existent sibling directory", async () => {
  const hubDir = setupHub(`export default { siblings: [{ name: "ghost", kits: ["brand"] }] };`);
  await assert.rejects(
    () => loadPortfolioConfig(hubDir),
    /does not exist/i
  );
  rmSync(hubDir, { recursive: true, force: true });
});
```

- [ ] **Step 2: Run tests — expect FAIL (module does not exist)**

```bash
node --test scripts/lib/load-config.test.mjs
```

Expected: all 5 tests fail with "Cannot find module".

- [ ] **Step 3: Implement `scripts/lib/load-config.mjs`**

```js
// scripts/lib/load-config.mjs
// Loads and validates portfolio.config.mjs from the hub root.
import path from "node:path";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

const VALID_KITS = new Set(["brand", "ai"]);

export async function loadPortfolioConfig(hubDir) {
  const configPath = path.join(hubDir, "portfolio.config.mjs");
  if (!existsSync(configPath)) {
    throw new Error(`portfolio.config.mjs not found at ${configPath}`);
  }

  const mod = await import(pathToFileURL(configPath).href);
  const config = mod.default;

  if (!config || typeof config !== "object") {
    throw new Error(`portfolio.config.mjs must export default an object`);
  }
  if (!Array.isArray(config.siblings)) {
    throw new Error(`portfolio.config.mjs: siblings must be an array`);
  }

  const seen = new Set();
  for (const s of config.siblings) {
    if (typeof s?.name !== "string" || !s.name) {
      throw new Error(`portfolio.config.mjs: each sibling must have a non-empty "name"`);
    }
    if (seen.has(s.name)) {
      throw new Error(`portfolio.config.mjs: duplicate sibling "${s.name}"`);
    }
    seen.add(s.name);

    if (!Array.isArray(s.kits) || s.kits.length === 0) {
      throw new Error(`portfolio.config.mjs: sibling "${s.name}" must declare at least one kit`);
    }
    for (const k of s.kits) {
      if (!VALID_KITS.has(k)) {
        throw new Error(`portfolio.config.mjs: sibling "${s.name}" has unknown kit "${k}"`);
      }
    }

    const siblingDir = path.resolve(hubDir, "..", s.name);
    if (!existsSync(siblingDir)) {
      throw new Error(`portfolio.config.mjs: sibling "${s.name}" directory does not exist at ${siblingDir}`);
    }
  }

  return config;
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
node --test scripts/lib/load-config.test.mjs
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/load-config.mjs scripts/lib/load-config.test.mjs
git commit -m "feat(scripts): add portfolio.config.mjs loader + validator"
```

---

### Task 5: Build `scripts/lib/propagate.mjs` with tests

**Files:**
- Create: `scripts/lib/propagate.mjs`
- Create: `scripts/lib/propagate.test.mjs`

- [ ] **Step 1: Write failing tests**

Create `scripts/lib/propagate.test.mjs`:

```js
// scripts/lib/propagate.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { propagateKit } from "./propagate.mjs";

function setupMiniPortfolio({ configSource, siblings }) {
  // Creates a temp meta-folder with hub + stub siblings.
  const metaDir = mkdtempSync(path.join(tmpdir(), "meta-"));
  const hubDir = path.join(metaDir, "portafolio-mdea");
  mkdirSync(path.join(hubDir, "design-system"), { recursive: true });
  mkdirSync(path.join(hubDir, "ai-kit"), { recursive: true });
  writeFileSync(path.join(hubDir, "design-system", "tokens.css"), ":root { --x: 1; }");
  writeFileSync(path.join(hubDir, "ai-kit", "models.ts"), "export const FREE_MODELS_PRIORITY = [];");
  writeFileSync(path.join(hubDir, "portfolio.config.mjs"), configSource);

  for (const sib of siblings) {
    const sibDir = path.join(metaDir, sib.name);
    mkdirSync(sibDir, { recursive: true });
    // Make it a git repo for health check.
    execSync("git init -q", { cwd: sibDir });
    execSync("git commit --allow-empty -m init -q", { cwd: sibDir });
    if (sib.dirty) {
      writeFileSync(path.join(sibDir, "dirty.txt"), "uncommitted");
    }
  }

  return { metaDir, hubDir };
}

function cleanup(dir) {
  rmSync(dir, { recursive: true, force: true });
}

test("propagateKit copies brand kit to all siblings with 'brand'", async () => {
  const { metaDir, hubDir } = setupMiniPortfolio({
    configSource: `export default { siblings: [
      { name: "sib-a", kits: ["brand"] },
      { name: "sib-b", kits: ["ai"] }
    ]};`,
    siblings: [{ name: "sib-a" }, { name: "sib-b" }],
  });

  const results = await propagateKit({
    hubDir,
    kitName: "brand",
    kitSourceDir: "design-system",
    kitTargetDir: "design-system",
  });

  assert.equal(results.length, 1);
  assert.equal(results[0].sibling, "sib-a");
  assert.ok(existsSync(path.join(metaDir, "sib-a", "design-system", "tokens.css")));
  assert.equal(existsSync(path.join(metaDir, "sib-b", "design-system")), false);
  cleanup(metaDir);
});

test("propagateKit aborts if a sibling has a dirty working tree", async () => {
  const { metaDir, hubDir } = setupMiniPortfolio({
    configSource: `export default { siblings: [{ name: "sib-dirty", kits: ["brand"] }]};`,
    siblings: [{ name: "sib-dirty", dirty: true }],
  });

  await assert.rejects(
    () => propagateKit({ hubDir, kitName: "brand", kitSourceDir: "design-system", kitTargetDir: "design-system" }),
    /working tree is not clean/i
  );
  assert.equal(existsSync(path.join(metaDir, "sib-dirty", "design-system", "tokens.css")), false);
  cleanup(metaDir);
});

test("propagateKit with dryRun: true lists changes without writing", async () => {
  const { metaDir, hubDir } = setupMiniPortfolio({
    configSource: `export default { siblings: [{ name: "sib-a", kits: ["brand"] }]};`,
    siblings: [{ name: "sib-a" }],
  });

  const results = await propagateKit({
    hubDir,
    kitName: "brand",
    kitSourceDir: "design-system",
    kitTargetDir: "design-system",
    dryRun: true,
  });

  assert.equal(results[0].dryRun, true);
  assert.equal(existsSync(path.join(metaDir, "sib-a", "design-system", "tokens.css")), false);
  cleanup(metaDir);
});

test("propagateKit filters siblings that do not declare the kit", async () => {
  const { metaDir, hubDir } = setupMiniPortfolio({
    configSource: `export default { siblings: [
      { name: "brand-only", kits: ["brand"] },
      { name: "ai-only",    kits: ["ai"] }
    ]};`,
    siblings: [{ name: "brand-only" }, { name: "ai-only" }],
  });

  const aiResults = await propagateKit({
    hubDir,
    kitName: "ai",
    kitSourceDir: "ai-kit",
    kitTargetDir: "ai-kit",
  });

  assert.equal(aiResults.length, 1);
  assert.equal(aiResults[0].sibling, "ai-only");
  cleanup(metaDir);
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
node --test scripts/lib/propagate.test.mjs
```

Expected: all 4 tests fail with "Cannot find module".

- [ ] **Step 3: Implement `scripts/lib/propagate.mjs`**

```js
// scripts/lib/propagate.mjs
// Propagates a kit from the hub to every sibling declaring it in portfolio.config.mjs.
import path from "node:path";
import { execSync } from "node:child_process";
import { syncKit } from "./sync-kit.mjs";
import { loadPortfolioConfig } from "./load-config.mjs";

function assertCleanGitTree(dir) {
  try {
    const status = execSync("git status --porcelain", { cwd: dir, encoding: "utf8" });
    if (status.trim() !== "") {
      throw new Error(`sibling at ${dir}: working tree is not clean — commit or stash before propagating`);
    }
  } catch (err) {
    if (err.message.includes("working tree is not clean")) throw err;
    throw new Error(`sibling at ${dir}: not a git repo or git unavailable — ${err.message}`);
  }
}

export async function propagateKit({ hubDir, kitName, kitSourceDir, kitTargetDir, dryRun = false }) {
  const config = await loadPortfolioConfig(hubDir);
  const targets = config.siblings.filter((s) => s.kits.includes(kitName));

  // Health-check every target before touching any of them — abort early.
  for (const sibling of targets) {
    const siblingDir = path.resolve(hubDir, "..", sibling.name);
    assertCleanGitTree(siblingDir);
  }

  const results = [];
  for (const sibling of targets) {
    const siblingDir = path.resolve(hubDir, "..", sibling.name);
    const manifest = syncKit({
      source: path.join(hubDir, kitSourceDir),
      target: path.join(siblingDir, kitTargetDir),
      kitName,
      dryRun,
    });
    results.push({ sibling: sibling.name, ...manifest });
  }
  return results;
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
node --test scripts/lib/propagate.test.mjs
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/propagate.mjs scripts/lib/propagate.test.mjs
git commit -m "feat(scripts): add propagateKit with health checks + dryRun"
```

---

### Task 6: Create `scripts/brand-propagate.mjs` CLI

**Files:**
- Create: `scripts/brand-propagate.mjs`

- [ ] **Step 1: Write the CLI**

```js
// scripts/brand-propagate.mjs
// Propagates design-system/ from the hub to every sibling declaring "brand" in portfolio.config.mjs.
// Usage: pnpm brand:propagate [--dry-run]
import { parseArgs } from "node:util";
import { propagateKit } from "./lib/propagate.mjs";

const { values } = parseArgs({
  options: {
    "dry-run": { type: "boolean", default: false },
  },
});

const dryRun = values["dry-run"];

try {
  const results = await propagateKit({
    hubDir: process.cwd(),
    kitName: "brand",
    kitSourceDir: "design-system",
    kitTargetDir: "design-system",
    dryRun,
  });

  if (results.length === 0) {
    console.log(`[brand-propagate] no siblings declare "brand" kit`);
    process.exit(0);
  }

  const tag = dryRun ? "DRY RUN" : "synced";
  for (const r of results) {
    const deletes = (r.wouldDelete ?? []).length;
    console.log(`[brand-propagate] ${tag} ${r.sibling}: ${r.files.length} files${deletes ? `, ${deletes} would be deleted` : ""}`);
  }
} catch (err) {
  console.error(`[brand-propagate] ERROR: ${err.message}`);
  process.exit(1);
}
```

- [ ] **Step 2: Verify the script runs against the empty config (no siblings yet)**

```bash
node scripts/brand-propagate.mjs --dry-run
```

Expected: prints `[brand-propagate] no siblings declare "brand" kit` and exits 0.

- [ ] **Step 3: Commit**

```bash
git add scripts/brand-propagate.mjs
git commit -m "feat(scripts): add brand:propagate CLI"
```

---

### Task 7: Create `scripts/ai-propagate.mjs` CLI

**Files:**
- Create: `scripts/ai-propagate.mjs`

- [ ] **Step 1: Write the CLI**

```js
// scripts/ai-propagate.mjs
// Propagates ai-kit/ from the hub to every sibling declaring "ai" in portfolio.config.mjs.
// Usage: pnpm ai:propagate [--dry-run]
import { parseArgs } from "node:util";
import { propagateKit } from "./lib/propagate.mjs";

const { values } = parseArgs({
  options: {
    "dry-run": { type: "boolean", default: false },
  },
});

const dryRun = values["dry-run"];

try {
  const results = await propagateKit({
    hubDir: process.cwd(),
    kitName: "ai",
    kitSourceDir: "ai-kit",
    kitTargetDir: "ai-kit",
    dryRun,
  });

  if (results.length === 0) {
    console.log(`[ai-propagate] no siblings declare "ai" kit`);
    process.exit(0);
  }

  const tag = dryRun ? "DRY RUN" : "synced";
  for (const r of results) {
    const deletes = (r.wouldDelete ?? []).length;
    console.log(`[ai-propagate] ${tag} ${r.sibling}: ${r.files.length} files${deletes ? `, ${deletes} would be deleted` : ""}`);
  }
} catch (err) {
  console.error(`[ai-propagate] ERROR: ${err.message}`);
  process.exit(1);
}
```

- [ ] **Step 2: Verify the script runs**

```bash
node scripts/ai-propagate.mjs --dry-run
```

Expected: prints `[ai-propagate] no siblings declare "ai" kit` and exits 0.

- [ ] **Step 3: Commit**

```bash
git add scripts/ai-propagate.mjs
git commit -m "feat(scripts): add ai:propagate CLI"
```

---

### Task 8: Wire `brand:propagate` + `ai:propagate` into `package.json`

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add the scripts** — insert after the existing `ai:sync` entry:

```json
    "brand:propagate": "node scripts/brand-propagate.mjs",
    "ai:propagate": "node scripts/ai-propagate.mjs",
```

- [ ] **Step 2: Verify both scripts resolve**

```bash
pnpm brand:propagate --dry-run
pnpm ai:propagate --dry-run
```

Expected: both exit 0 with the "no siblings" message.

- [ ] **Step 3: Full test suite**

```bash
node --test scripts/brand-sync.test.mjs scripts/ai-sync.test.mjs scripts/lib/sync-kit.test.mjs scripts/lib/load-config.test.mjs scripts/lib/propagate.test.mjs
```

Expected: all tests pass. Total: 3 (brand-sync) + 1 (ai-sync) + 2 (sync-kit) + 5 (load-config) + 4 (propagate) = 15 passes.

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "feat: wire brand:propagate + ai:propagate into pnpm scripts"
```

---

### Task 9: Phase A milestone

- [ ] **Step 1: Empty milestone commit**

```bash
git commit --allow-empty -m "milestone: Plan 2 Phase A — propagation tooling ready"
```

- [ ] **Step 2: Do NOT push yet** — keep the hub local until Phase B completes. Hub config still has empty `siblings`; pushing now is harmless but there's nothing to verify in prod.

---

## Phase B — Migrate `identidad-360`

**Pre-requisite:** Phase A complete. Work directory alternates between the hub and the sibling; each task notes which.

### Task 10: Pre-flight at old location — `identidad-360`

**Work in:** `C:/Proyectos/identidad-360/` (old location, before move).

- [ ] **Step 1: Verify clean state**

```bash
cd C:/Proyectos/identidad-360
git status
```

Expected: "nothing to commit, working tree clean". If not, commit or stash before continuing — do NOT proceed with a dirty tree.

- [ ] **Step 2: Verify no unpushed commits**

```bash
git log origin/main..main --oneline
```

Expected: empty output (no commits ahead of origin). If not, `git push origin main` first.

- [ ] **Step 3: Record current production deployment** (rollback anchor)

```bash
vercel inspect https://identidad-360.vercel.app 2>&1 | head -20
```

Record the "id" field. Save it somewhere retrievable (e.g., paste in chat). This is the deploy we'd Instant-Rollback to if the post-migration deploy breaks.

- [ ] **Step 4: Detect if the sibling uses ai-kit**

```bash
grep -rn "from ['\"].*ai-kit" src/ 2>&1 | head -5
grep -rn "ai-kit" package.json 2>&1
```

If no matches in either, `identidad-360` does NOT use ai-kit → skip `ai:sync` later and declare `kits: ['brand']` only.
If matches, `ai` kit is in scope → declare `kits: ['brand', 'ai']`.

Record the decision (brand-only or brand+ai).

- [ ] **Step 5: HAND OFF to user for manual move**

Claude must stop here. Ask the user to:

1. Close any Claude Code session that has `C:/Proyectos/identidad-360` open.
2. Via Windows Explorer or an external terminal, move the directory:
   `C:/Proyectos/identidad-360` → `C:/Proyectos/proyectos-portafolio/identidad-360`
3. Reopen Claude Code at the new location (or at `C:/Proyectos/proyectos-portafolio/` meta-folder).
4. Reply when done; include the rollback deploy id from Step 3 and the kit decision from Step 4.

No commit in this task.

---

### Task 11: Reconciliation at new location — `identidad-360`

**Work in:** `C:/Proyectos/proyectos-portafolio/identidad-360/` (new location, post-move).

- [ ] **Step 1: Reconcile pnpm**

```bash
cd C:/Proyectos/proyectos-portafolio/identidad-360
CI=true pnpm install
```

Expected: exit 0. This rebuilds the pnpm symlinks broken by the move (Plan 1 confirmed failure mode).

- [ ] **Step 2: Build verification**

```bash
pnpm build
```

Expected: exit 0. Must match the pre-move build result. If this fails but passed pre-move, investigate before continuing.

- [ ] **Step 3: Lint verification**

```bash
pnpm lint
```

Expected: exit 0, or `missing script: lint` (project has no lint script, which is fine — do not add one in this plan).

- [ ] **Step 4: Local smoke test**

```bash
pnpm dev
```

Open `http://localhost:3000` in a browser, verify the home page and primary case study render correctly (same as pre-move state). Kill the dev server (`Ctrl+C`) before continuing.

- [ ] **Step 5: No commit** — the mv itself is untracked (the whole repo has moved; git sees the same commits). Phase continues in Task 12.

---

### Task 12: Adopt brand v2 in `identidad-360`

**Work in:** `C:/Proyectos/proyectos-portafolio/identidad-360/`.

- [ ] **Step 1: Sync design-system from the hub**

```bash
node ../portafolio-mdea/scripts/brand-sync.mjs
```

Expected: `[brand-sync] ... synced N files`. Files under `design-system/` get replaced with the hub's brand v2 version.

- [ ] **Step 2: If sibling uses ai-kit (from Task 10 Step 4), sync it**

Only run if kit decision was `brand+ai`:

```bash
node ../portafolio-mdea/scripts/ai-sync.mjs
```

Expected: `[ai-sync] ... synced N files`.

If sibling is brand-only, skip this step.

- [ ] **Step 3: Build verification post-sync**

```bash
pnpm build
```

Expected: exit 0. If fails, investigate — the sibling may reference components or APIs the new kit doesn't expose.

- [ ] **Step 4: Local smoke test — verify brand v2 renders**

```bash
pnpm dev
```

Open `http://localhost:3000` in browser. Verify:
- Fonts: Inter body, Fraunces H1 (serif).
- Palette: zinc + blue accent (light and dark if toggleable).
- Any case-study pages: MDX components render (`<Metric>`, `<Tradeoff>` if used).

Kill `pnpm dev` before continuing.

- [ ] **Step 5: Review diff before commit**

```bash
git status
git diff --stat
```

Expected: changes limited to `design-system/` (and `ai-kit/` if synced). If anything else changed, investigate before committing.

- [ ] **Step 6: Commit + push**

```bash
git add -A
git commit -m "chore: migrate to meta-folder + adopt brand v2"
git push origin main
```

deployment platform auto-deploys.

---

### Task 13: Watch deploy + decide — `identidad-360`

**Work in:** monitoring (no code changes).

- [ ] **Step 1: Watch deploy status**

```bash
vercel inspect https://identidad-360.vercel.app 2>&1 | head -30
```

Or check the deployment platform dashboard. Wait for the latest deploy to transition from BUILDING → READY.

- [ ] **Step 2: If READY → smoke test production**

```bash
curl -sSfI https://identidad-360.vercel.app | head -5
```

Expected: `HTTP/1.1 200 OK` or similar 2xx.

Open `https://identidad-360.vercel.app` in a browser. Verify Fraunces H1, zinc+blue palette, case studies render. Report any visual issues.

If all good → proceed to Task 14.

- [ ] **Step 3: If ERROR or 500 → rollback**

**Primary rollback (deployment platform Instant Rollback):**
- Open deployment platform dashboard → `identidad-360` project → Deployments.
- Find the deploy with the id recorded in Task 10 Step 3.
- Click "Promote to Production". Production restored in ~5s.

**Fallback (git revert):**
```bash
git revert HEAD --no-edit
git push origin main
```

After rollback → investigate. Push a fix as a new commit. Re-run this task from Step 1 with the fix deploy.

Do NOT proceed to Task 14 until READY + production smoke-tested 200 + visual check passes.

- [ ] **Step 4: No commit — just verification**

---

### Task 14: Update hub `portfolio.config.mjs` with `identidad-360`

**Work in:** `C:/Proyectos/proyectos-portafolio/portafolio-mdea/` (hub).

- [ ] **Step 1: Add sibling to config**

Edit `portfolio.config.mjs` — replace the empty siblings placeholder with:

```js
export default {
  siblings: [
    { name: 'identidad-360', kits: [/* 'brand' and/or 'ai' per Task 10 Step 4 */] },
  ],
};
```

Use the kit array that matches Task 10 Step 4 decision.

- [ ] **Step 2: Verify config loads**

```bash
node -e "import('./portfolio.config.mjs').then(m => console.log(JSON.stringify(m.default, null, 2)))"
```

Expected: prints the config JSON without error.

- [ ] **Step 3: Run propagate dry-run against real sibling**

```bash
pnpm brand:propagate --dry-run
```

Expected: `[brand-propagate] DRY RUN identidad-360: N files` (where N > 0). No errors.

If the sibling had `kits: ['brand', 'ai']`:

```bash
pnpm ai:propagate --dry-run
```

Expected: `[ai-propagate] DRY RUN identidad-360: N files`.

- [ ] **Step 4: Build verification**

```bash
pnpm build
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add portfolio.config.mjs
git commit -m "feat(config): register identidad-360 as portfolio sibling"
```

- [ ] **Step 6: Push hub**

```bash
git push origin main
```

deployment platform will redeploy the hub. The change is trivial (one file, no code path change) so this is low-risk.

---

### Task 15: Phase B milestone

**Work in:** hub.

- [ ] **Step 1: Empty milestone commit**

```bash
git commit --allow-empty -m "milestone: Plan 2 Phase B — identidad-360 migrated"
git push origin main
```

---

## Phase C — Migrate `agente-riesgo`

Same recipe as Phase B. The receta is proven after `identidad-360` succeeded; fewer surprises expected.

### Task 16: Pre-flight at old location — `agente-riesgo`

**Work in:** `C:/Proyectos/agente-riesgo/` (old location).

- [ ] **Step 1: Verify clean state**

```bash
cd C:/Proyectos/agente-riesgo
git status
```

Expected: "nothing to commit, working tree clean". Commit or stash first if dirty.

- [ ] **Step 2: Verify no unpushed commits**

```bash
git log origin/main..main --oneline
```

Expected: empty. If not, `git push origin main` first.

- [ ] **Step 3: Record current production deployment**

```bash
vercel inspect https://agente-riesgo.vercel.app 2>&1 | head -20
```

Record the "id" field as rollback anchor.

- [ ] **Step 4: Detect ai-kit usage**

```bash
grep -rn "from ['\"].*ai-kit" src/ 2>&1 | head -5
grep -rn "ai-kit" package.json 2>&1
```

Record decision (brand-only or brand+ai).

- [ ] **Step 5: HAND OFF to user**

Ask the user to:
1. Close any Claude Code session with `C:/Proyectos/agente-riesgo` open.
2. Move `C:/Proyectos/agente-riesgo` → `C:/Proyectos/proyectos-portafolio/agente-riesgo`.
3. Reopen Claude Code at the new location (or at the meta-folder).
4. Reply with the rollback deploy id and kit decision.

No commit in this task.

---

### Task 17: Reconciliation at new location — `agente-riesgo`

**Work in:** `C:/Proyectos/proyectos-portafolio/agente-riesgo/`.

- [ ] **Step 1: Reconcile pnpm**

```bash
cd C:/Proyectos/proyectos-portafolio/agente-riesgo
CI=true pnpm install
```

Expected: exit 0.

- [ ] **Step 2: Build verification**

```bash
pnpm build
```

Expected: exit 0.

- [ ] **Step 3: Lint verification**

```bash
pnpm lint
```

Expected: exit 0 or `missing script: lint`.

- [ ] **Step 4: Local smoke test**

`pnpm dev`, browse `http://localhost:3000`, verify render. Kill dev server.

- [ ] **Step 5: No commit.**

---

### Task 18: Adopt brand v2 in `agente-riesgo`

**Work in:** `C:/Proyectos/proyectos-portafolio/agente-riesgo/`.

- [ ] **Step 1: Sync design-system**

```bash
node ../portafolio-mdea/scripts/brand-sync.mjs
```

Expected: `[brand-sync] ... synced N files`.

- [ ] **Step 2: If ai-kit used (from Task 16 Step 4), sync it**

```bash
node ../portafolio-mdea/scripts/ai-sync.mjs
```

Expected: `[ai-sync] ... synced N files`. Skip if brand-only.

- [ ] **Step 3: Build verification post-sync**

```bash
pnpm build
```

Expected: exit 0.

- [ ] **Step 4: Local smoke test**

`pnpm dev`, verify brand v2 renders, kill dev server.

- [ ] **Step 5: Review diff**

```bash
git status
git diff --stat
```

Expected: changes limited to `design-system/` (and `ai-kit/` if applicable).

- [ ] **Step 6: Commit + push**

```bash
git add -A
git commit -m "chore: migrate to meta-folder + adopt brand v2"
git push origin main
```

---

### Task 19: Watch deploy + decide — `agente-riesgo`

**Work in:** monitoring.

- [ ] **Step 1: Watch deploy**

```bash
vercel inspect https://agente-riesgo.vercel.app 2>&1 | head -30
```

Wait for READY.

- [ ] **Step 2: If READY → smoke test production**

```bash
curl -sSfI https://agente-riesgo.vercel.app | head -5
```

Expected: `HTTP/1.1 200`.

Browser check at `https://agente-riesgo.vercel.app`: Fraunces H1, zinc+blue palette, case study renders. If good → Task 20.

- [ ] **Step 3: If ERROR or 500 → rollback**

Instant Rollback via deployment platform dashboard to the deploy id from Task 16 Step 3. Or `git revert HEAD --no-edit && git push origin main`. Investigate, fix, re-deploy.

Do NOT proceed to Task 20 until production is verified green.

- [ ] **Step 4: No commit.**

---

### Task 20: Update hub `portfolio.config.mjs` with `agente-riesgo`

**Work in:** hub.

- [ ] **Step 1: Add sibling to config**

Edit `portfolio.config.mjs`:

```js
export default {
  siblings: [
    { name: 'identidad-360', kits: [/* from Task 14 */] },
    { name: 'agente-riesgo',  kits: [/* 'brand' and/or 'ai' per Task 16 Step 4 */] },
  ],
};
```

- [ ] **Step 2: Verify config loads**

```bash
node -e "import('./portfolio.config.mjs').then(m => console.log(JSON.stringify(m.default, null, 2)))"
```

Expected: prints both siblings.

- [ ] **Step 3: Run propagate dry-run against both siblings**

```bash
pnpm brand:propagate --dry-run
```

Expected: reports both siblings (or only those with `brand` kit).

```bash
pnpm ai:propagate --dry-run
```

Expected: reports siblings with `ai` kit.

- [ ] **Step 4: Build verification**

```bash
pnpm build
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add portfolio.config.mjs
git commit -m "feat(config): register agente-riesgo as portfolio sibling"
```

- [ ] **Step 6: Push hub**

```bash
git push origin main
```

---

### Task 21: Phase C milestone

- [ ] **Step 1: Empty milestone commit**

```bash
git commit --allow-empty -m "milestone: Plan 2 Phase C — agente-riesgo migrated"
git push origin main
```

---

## Phase D — Final verification

### Task 22: End-to-end propagate smoke test

**Work in:** hub.

- [ ] **Step 1: Full test suite**

```bash
node --test scripts/brand-sync.test.mjs scripts/ai-sync.test.mjs scripts/lib/sync-kit.test.mjs scripts/lib/load-config.test.mjs scripts/lib/propagate.test.mjs
```

Expected: 15 tests pass.

- [ ] **Step 2: Dry-run both propagates** (should report both siblings with no unexpected diffs)

```bash
pnpm brand:propagate --dry-run
pnpm ai:propagate --dry-run
```

Expected: each lists the siblings declaring the respective kit. The "wouldDelete" counts should be 0 (siblings are in sync from Phase B/C). If non-zero, investigate — may indicate a sibling has local edits that propagate would overwrite.

- [ ] **Step 3: Build verification**

```bash
pnpm build
```

Expected: exit 0.

- [ ] **Step 4: No commit.** This task is verification only.

---

### Task 23: Final milestone + push

**Work in:** hub.

- [ ] **Step 1: Empty milestone commit**

```bash
git commit --allow-empty -m "milestone: Plan 2 complete — portfolio migration + propagate"
```

- [ ] **Step 2: Push**

```bash
git push origin main
```

- [ ] **Step 3: Final visual verification (user, browser)**

Open each production URL and confirm brand v2 is live:

- [ ] `https://portafolio-mdea.vercel.app` — hub (from Plan 1, still green)
- [ ] `https://identidad-360.vercel.app` — Fraunces H1, zinc+blue, case study MDX renders
- [ ] `https://agente-riesgo.vercel.app` — same checks

Report any visual regressions.

---

## Self-review

**Spec coverage:**

- D1 (sequential) → enforced by task order (16 after 15).
- D2 (identidad-360 first) → Phase B is identidad-360, Phase C is agente-riesgo.
- D3 (Instant Rollback primary + git revert fallback) → Task 13 Step 3 and Task 19 Step 3.
- D4 (two scripts) → Tasks 6 and 7.
- D5 (declarative config) → Task 3 creates it; Tasks 4, 5 load and consume it.
- Refactor syncKit into lib → Task 1.
- Add dryRun to syncKit → Task 2.
- Pre-push gates (install + build + lint) → Task 11 Steps 1–3, Task 17 Steps 1–3.
- Health check (working tree clean) per sibling before propagate → Task 5 Step 3 implementation + Task 5 test 2.
- No auto-commit in propagate → by design; scripts never call git. Confirmed by tests.
- End-to-end propagate smoke → Task 22.

**Placeholder scan:** no TBD/TODO/vague handlers. Every code block is complete. Kit-decision placeholder in Task 14 Step 1 and Task 20 Step 1 is explicitly tied to Task 10 Step 4 / Task 16 Step 4 output — these are legitimate user decisions, not plan gaps.

**Type consistency:**
- `syncKit({ source, target, kitName, dryRun })` signature consistent in Task 1, Task 2, Task 5.
- `propagateKit({ hubDir, kitName, kitSourceDir, kitTargetDir, dryRun })` signature consistent in Task 5, Tasks 6–7, Task 20.
- `portfolio.config.mjs` shape (`{ siblings: [{ name, kits }] }`) consistent across Tasks 3, 4, 5, 14, 20.
- Return values `{ sibling, dryRun?, files, wouldDelete? }` consistent between propagate tests (Task 5) and CLI output formatting (Tasks 6–7).

**Scope check:** Plan 2 is self-contained — builds tools, migrates two specific siblings, validates end-to-end. No portfolio intake, no CI, no dominio. Matches spec's goals exactly.
