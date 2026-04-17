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
