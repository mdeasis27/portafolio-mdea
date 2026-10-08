// scripts/lib/community.mjs
// Renders community-kit/ into a repo and makes the per-repo edits (package.json license, README badges and section).
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync} from 'node:fs';
import path from 'node:path';

const BADGES = ['<!-- community-badges -->', '<!-- /community-badges -->'];
const SECTION = ['<!-- community-section -->', '<!-- /community-section -->'];
const SECTIONS = {
  'README.md': '## License and contributing\n\nReleased under the [MIT License](LICENSE). Issues and pull requests are welcome: read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md) first. To report a vulnerability, see [SECURITY.md](SECURITY.md).',
  'README.es.md': '## Licencia y contribución\n\nPublicado bajo la [licencia MIT](LICENSE). Se aceptan issues y pull requests: lee antes [CONTRIBUTING.md](CONTRIBUTING.md) y el [Código de Conducta](CODE_OF_CONDUCT.md). Para reportar una vulnerabilidad, consulta [SECURITY.md](SECURITY.md).',
};

export function assertClean(dir) {
  let status;
  try {
    status = execFileSync('git', ['status', '--porcelain'], {cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']});
  } catch {
    throw new Error(`${dir}: not a git repo or git unavailable`);
  }
  if (status.trim() !== '') throw new Error(`${dir}: working tree is not clean, commit or stash first`);
}

function listFiles(dir, base = dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    return statSync(full).isDirectory() ? listFiles(full, base) : [path.relative(base, full).split(path.sep).join('/')];
  });
}

function render(text, name, hasTest) {
  return text
    .replaceAll('{{name}}', name)
    .split('\n')
    .filter((line) => hasTest || !line.includes('# if-test'))
    .map((line) => line.replace(/\s+# if-test$/, ''))
    .join('\n');
}

function replaceBlock(text, [start, end], block) {
  const from = text.indexOf(start);
  const to = text.indexOf(end) + end.length;
  return text.slice(0, from) + block + text.slice(to);
}

function withBadges(text, name) {
  const line = `[![CI](https://github.com/mdeasis27/${name}/actions/workflows/ci.yml/badge.svg)](https://github.com/mdeasis27/${name}/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)`;
  const block = `${BADGES[0]}\n${line}\n${BADGES[1]}`;
  if (text.includes(BADGES[0])) return replaceBlock(text, BADGES, block);
  const afterTitle = text.indexOf('\n');
  if (afterTitle === -1) return `${text}\n\n${block}\n`;
  return `${text.slice(0, afterTitle)}\n\n${block}${text.slice(afterTitle)}`;
}

function withSection(text, body) {
  const block = `${SECTION[0]}\n${body}\n${SECTION[1]}`;
  if (text.includes(SECTION[0])) return replaceBlock(text, SECTION, block);
  return `${text.replace(/\s*$/, '')}\n\n${block}\n`;
}

function withLicense(raw) {
  const pkg = JSON.parse(raw);
  if (pkg.license === 'MIT') return raw;
  const out = {};
  for (const [key, value] of Object.entries(pkg)) {
    if (key === 'license') continue;
    out[key] = value;
    if (key === 'private') out.license = 'MIT';
  }
  if (!('license' in out)) out.license = 'MIT';
  return `${JSON.stringify(out, null, 2)}\n`;
}

export function applyCommunityKit({kitDir, targetDir, name, dryRun = false}) {
  const pkgRaw = readFileSync(path.join(targetDir, 'package.json'), 'utf8');
  const hasTest = Boolean(JSON.parse(pkgRaw).scripts?.test);
  const changes = new Map();
  for (const rel of listFiles(kitDir)) changes.set(rel, render(readFileSync(path.join(kitDir, rel), 'utf8'), name, hasTest));
  changes.set('package.json', withLicense(pkgRaw));
  for (const readme of ['README.md', 'README.es.md']) {
    const file = path.join(targetDir, readme);
    if (existsSync(file)) changes.set(readme, withSection(withBadges(readFileSync(file, 'utf8'), name), SECTIONS[readme]));
  }
  const written = [];
  for (const [rel, content] of changes) {
    const file = path.join(targetDir, rel);
    if (existsSync(file) && readFileSync(file, 'utf8') === content) continue;
    written.push(rel);
    if (!dryRun) {
      mkdirSync(path.dirname(file), {recursive: true});
      writeFileSync(file, content);
    }
  }
  return written;
}
