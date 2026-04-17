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
