// scripts/community-propagate.mjs
// Applies community-kit/ to the hub and every sibling in portfolio.config.mjs.
// Usage: pnpm community:propagate [--dry-run]
// Writes files only: no git, no commits, no pushes.
import path from 'node:path';
import {parseArgs} from 'node:util';
import {applyCommunityKit, assertClean} from './lib/community.mjs';
import {loadPortfolioConfig} from './lib/load-config.mjs';

const {values} = parseArgs({options: {'dry-run': {type: 'boolean', default: false}}});
const dryRun = values['dry-run'];
const hubDir = process.cwd();
const hubName = path.basename(hubDir);

try {
  const config = await loadPortfolioConfig(hubDir);
  const targets = [{name: hubName, dir: hubDir}, ...config.siblings.map((s) => ({name: s.name, dir: path.resolve(hubDir, '..', s.name)}))];
  if (!dryRun) for (const t of targets) assertClean(t.dir); // check all before writing any
  for (const t of targets) {
    const written = applyCommunityKit({kitDir: path.join(hubDir, 'community-kit'), targetDir: t.dir, name: t.name, dryRun});
    console.log(`[community-propagate] ${dryRun ? 'DRY RUN' : 'synced'} ${t.name}: ${written.length} file(s)`);
  }
} catch (err) {
  console.error(`[community-propagate] ${err.message}`);
  process.exit(1);
}
