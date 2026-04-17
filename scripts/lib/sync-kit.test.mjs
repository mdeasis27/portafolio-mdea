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
