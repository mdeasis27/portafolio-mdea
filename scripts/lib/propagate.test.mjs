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
