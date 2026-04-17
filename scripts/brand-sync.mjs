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
