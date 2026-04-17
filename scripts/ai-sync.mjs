// scripts/ai-sync.mjs
// Syncs ai-kit/ from the hub into the current repo.
import path from "node:path";
import { existsSync } from "node:fs";
import { parseArgs } from "node:util";
import { syncKit } from "./brand-sync.mjs";

const { values } = parseArgs({
  options: {
    from: { type: "string", default: ".." },
  },
});

const hubDir = path.resolve(process.cwd(), values.from, "portafolio-mdea");
const sourceDir = existsSync(hubDir)
  ? path.join(hubDir, "ai-kit")
  : path.resolve(process.cwd(), values.from, "ai-kit");
const targetDir = path.join(process.cwd(), "ai-kit");

console.log(`[ai-sync] ${sourceDir} → ${targetDir}`);
const manifest = syncKit({ source: sourceDir, target: targetDir, kitName: "ai" });
console.log(`[ai-sync] synced ${manifest.files.length} files at ${manifest.syncedAt}`);
