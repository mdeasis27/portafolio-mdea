// scripts/lib/propagate.mjs
// Propagates a kit from the hub to every sibling declaring it in portfolio.config.mjs.
import path from "node:path";
import { execSync } from "node:child_process";
import { syncKit } from "./sync-kit.mjs";
import { loadPortfolioConfig } from "./load-config.mjs";

function assertCleanGitTree(dir) {
  try {
    const status = execSync("git status --porcelain", { cwd: dir, encoding: "utf8" });
    if (status.trim() !== "") {
      throw new Error(`sibling at ${dir}: working tree is not clean — commit or stash before propagating`);
    }
  } catch (err) {
    if (err.message.includes("working tree is not clean")) throw err;
    throw new Error(`sibling at ${dir}: not a git repo or git unavailable — ${err.message}`);
  }
}

export async function propagateKit({ hubDir, kitName, kitSourceDir, kitTargetDir, dryRun = false }) {
  const config = await loadPortfolioConfig(hubDir);
  const targets = config.siblings.filter((s) => s.kits.includes(kitName));

  // Health-check every target before touching any of them — abort early.
  for (const sibling of targets) {
    const siblingDir = path.resolve(hubDir, "..", sibling.name);
    assertCleanGitTree(siblingDir);
  }

  const results = [];
  for (const sibling of targets) {
    const siblingDir = path.resolve(hubDir, "..", sibling.name);
    const manifest = syncKit({
      source: path.join(hubDir, kitSourceDir),
      target: path.join(siblingDir, kitTargetDir),
      kitName,
      dryRun,
    });
    results.push({ sibling: sibling.name, ...manifest });
  }
  return results;
}
