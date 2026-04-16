// scripts/brand-sync.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { syncKit } from "./brand-sync.mjs";

test("syncKit copies all files from source to target", () => {
  const source = mkdtempSync(path.join(tmpdir(), "src-"));
  const target = mkdtempSync(path.join(tmpdir(), "tgt-"));
  mkdirSync(path.join(source, "components"));
  writeFileSync(path.join(source, "tokens.css"), ":root { --x: 1; }");
  writeFileSync(path.join(source, "components", "button.tsx"), "export {}");

  syncKit({ source, target });

  assert.equal(readFileSync(path.join(target, "tokens.css"), "utf8"), ":root { --x: 1; }");
  assert.ok(existsSync(path.join(target, "components", "button.tsx")));

  rmSync(source, { recursive: true, force: true });
  rmSync(target, { recursive: true, force: true });
});

test("syncKit removes files in target that no longer exist in source", () => {
  const source = mkdtempSync(path.join(tmpdir(), "src-"));
  const target = mkdtempSync(path.join(tmpdir(), "tgt-"));
  writeFileSync(path.join(source, "a.css"), "a");
  writeFileSync(path.join(target, "a.css"), "old-a");
  writeFileSync(path.join(target, "b.css"), "stale");

  syncKit({ source, target });

  assert.equal(readFileSync(path.join(target, "a.css"), "utf8"), "a");
  assert.equal(existsSync(path.join(target, "b.css")), false);

  rmSync(source, { recursive: true, force: true });
  rmSync(target, { recursive: true, force: true });
});

test("syncKit writes a manifest with timestamp", () => {
  const source = mkdtempSync(path.join(tmpdir(), "src-"));
  const target = mkdtempSync(path.join(tmpdir(), "tgt-"));
  writeFileSync(path.join(source, "tokens.css"), ":root {}");

  syncKit({ source, target, kitName: "brand" });

  const manifest = JSON.parse(readFileSync(path.join(target, ".brand-sync-manifest.json"), "utf8"));
  assert.equal(manifest.kit, "brand");
  assert.ok(manifest.syncedAt);
  assert.ok(Array.isArray(manifest.files));

  rmSync(source, { recursive: true, force: true });
  rmSync(target, { recursive: true, force: true });
});
