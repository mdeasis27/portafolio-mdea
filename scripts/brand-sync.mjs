// scripts/brand-sync.mjs
// Copies design-system/ from a sibling "hub" repo into the current repo.
// Usage from consumer repo: node ../portafolio-mdea/scripts/brand-sync.mjs
import {
  readdirSync, statSync, mkdirSync, copyFileSync,
  rmSync, existsSync, writeFileSync,
} from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  const targetFiles = existsSync(target) ? new Set(walk(target).filter((f) => !f.endsWith("-sync-manifest.json"))) : new Set();

  // Copy everything from source
  for (const rel of sourceFiles) {
    const src = path.join(source, rel);
    const dst = path.join(target, rel);
    mkdirSync(path.dirname(dst), { recursive: true });
    copyFileSync(src, dst);
  }

  // Remove target files that are not in source
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
  writeFileSync(path.join(target, `.${kitName}-sync-manifest.json`), JSON.stringify(manifest, null, 2));
  return manifest;
}

// CLI entrypoint
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}` || process.argv[1].endsWith("brand-sync.mjs")) {
  const { values } = parseArgs({
    options: {
      from: { type: "string", default: ".." },
    },
  });
  const hubDir = path.resolve(process.cwd(), values.from, "portafolio-mdea");
  const sourceDir = existsSync(hubDir) ? path.join(hubDir, "design-system") : path.resolve(process.cwd(), values.from, "design-system");
  const targetDir = path.join(process.cwd(), "design-system");

  console.log(`[brand-sync] ${sourceDir} → ${targetDir}`);
  const manifest = syncKit({ source: sourceDir, target: targetDir, kitName: "brand" });
  console.log(`[brand-sync] synced ${manifest.files.length} files at ${manifest.syncedAt}`);
}
