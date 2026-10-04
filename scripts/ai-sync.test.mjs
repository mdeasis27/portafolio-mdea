// scripts/ai-sync.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { syncKit } from "./lib/sync-kit.mjs";

test("ai-kit can be synced with the same syncKit helper", () => {
  const source = mkdtempSync(path.join(tmpdir(), "ai-src-"));
  const target = mkdtempSync(path.join(tmpdir(), "ai-tgt-"));
  writeFileSync(path.join(source, "models.ts"), "export const X = 1;");

  const manifest = syncKit({ source, target, kitName: "ai" });

  assert.equal(manifest.kit, "ai");
  assert.ok(existsSync(path.join(target, ".ai-sync-manifest.json")));

  rmSync(source, { recursive: true, force: true });
  rmSync(target, { recursive: true, force: true });
});
