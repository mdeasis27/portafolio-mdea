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
