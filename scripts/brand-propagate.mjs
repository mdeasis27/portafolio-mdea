// scripts/brand-propagate.mjs
// Propagates design-system/ from the hub to every sibling declaring "brand" in portfolio.config.mjs.
// Usage: pnpm brand:propagate [--dry-run]
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
    kitName: "brand",
    kitSourceDir: "design-system",
    kitTargetDir: "design-system",
    dryRun,
  });

  if (results.length === 0) {
    console.log(`[brand-propagate] no siblings declare "brand" kit`);
    process.exit(0);
  }

  const tag = dryRun ? "DRY RUN" : "synced";
  for (const r of results) {
    const deletes = (r.wouldDelete ?? []).length;
    console.log(`[brand-propagate] ${tag} ${r.sibling}: ${r.files.length} files${deletes ? `, ${deletes} would be deleted` : ""}`);
  }
} catch (err) {
  console.error(`[brand-propagate] ERROR: ${err.message}`);
  process.exit(1);
}
