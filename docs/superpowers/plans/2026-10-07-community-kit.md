# Community Kit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give all 22 portfolio repos (hub + 21 siblings) a MIT license, contribution rules, security policy, issue/PR templates and CI, so they can be made public and look professional.

**Architecture:** Templates live in the hub (`community-kit/`). A small library (`scripts/lib/community.mjs`) renders them into a target repo and makes three per-repo edits (package.json license, README badges, README license section). A CLI (`scripts/community-propagate.mjs`) walks the hub plus the siblings from `portfolio.config.mjs`. It writes files only; git, PRs and GitHub settings are separate, manual steps.

**Tech Stack:** Node 22 ESM (`node:test`), GitHub Actions (pnpm 9, Node 22), `gh` CLI.

**Spec:** `docs/superpowers/specs/2026-10-07-community-kit-design.md`

## Global Constraints

- License: MIT, `Copyright (c) 2026 Manuel De Asís`. No other holder text, no `[Tu Nombre]`.
- Community files are in English; READMEs stay bilingual (EN section in `README.md`, ES section in `README.es.md`).
- The script never runs git, never commits or pushes, refuses a dirty working tree, is idempotent, and `--dry-run` writes nothing.
- CI uses pnpm `version: 9`, Node `22`, `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build`, and `pnpm test` only when the repo's `package.json` has a `test` script.
- One branch `chore/community-files` per repo from `origin/main`; one PR each. Commit messages carry `[skip ci]` except the pilot (`bandera`). Never `git push` to `main`; push with `git push origin chore/community-files:chore/community-files` (a command containing the word `main`, e.g. `--base main`, must be a separate call from any `git push`).
- Do NOT run `gh repo edit`, visibility changes, `gh pr merge` or any repo-settings write without Manuel's explicit confirmation in the conversation (Task 6 prepares them, does not run them).
- Do not delete files with `rm -rf`; if a command is denied, stop and report BLOCKED.
- Commits end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`; PR bodies end with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

## Review Focus

- A repo whose `package.json` has no `scripts` key or no `test` script → CI must not contain `pnpm test` (pinned by test).
- READMEs with CRLF line endings → a second run must not duplicate badges or the section (pinned by test).
- `package.json` already declaring `"license": "MIT"` → file untouched byte for byte (pinned by test).
- Missing `README.es.md` in a repo → no crash, other files still written (pinned by test).
- Dirty working tree in any target → nothing is written to any repo (pinned by test on the CLI-level function).

## File Structure

- Create `scripts/lib/community.mjs`: render + per-repo edits + `assertClean`.
- Create `scripts/community.test.mjs`: unit tests for the library and for the kit's contents.
- Create `scripts/community-propagate.mjs`: CLI over hub + siblings.
- Create `community-kit/` (templates, listed in Task 2).
- Modify `package.json` (hub): add `community:propagate` script.

---

### Task 1: Rendering library (test first)

**Files:**
- Create: `scripts/lib/community.mjs`, `scripts/community.test.mjs`

**Interfaces:**
- Produces: `applyCommunityKit({kitDir, targetDir, name, dryRun=false}) → string[]` (relative paths written or that would be written, forward slashes); `assertClean(dir) → void` (throws `Error` containing `working tree is not clean` or `not a git repo`).
- Template conventions: `{{name}}` is replaced by the repo directory name; any template line containing `# if-test` is dropped when the target has no `scripts.test`, otherwise only the ` # if-test` suffix is stripped.

- [ ] **Step 1: Write the failing tests**

Create `scripts/community.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execSync} from 'node:child_process';
import {applyCommunityKit, assertClean} from './lib/community.mjs';

function tmp(){return fs.mkdtempSync(path.join(os.tmpdir(),'community-'));}
function write(root,rel,content){const p=path.join(root,rel);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,content);}
function read(root,rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function makeKit(){const k=tmp();
 write(k,'LICENSE','MIT {{name}}\n');
 write(k,'.github/workflows/ci.yml','steps:\n  - run: pnpm lint\n  - run: pnpm test # if-test\n  - run: pnpm build\n');
 return k;}
function makeRepo({pkg={name:'demo',private:true,scripts:{lint:'x',test:'y',build:'z'}},readme='# Demo\n\n[Español](README.es.md)\n\nBody.\n',readmeEs='# Demo\n\n[English](README.md)\n\nCuerpo.\n'}={}){const r=tmp();
 write(r,'package.json',JSON.stringify(pkg,null,2)+'\n');
 if(readme!==null)write(r,'README.md',readme);
 if(readmeEs!==null)write(r,'README.es.md',readmeEs);
 return r;}
const snapshot=root=>{const out={};const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);e.isDirectory()?walk(p):out[path.relative(root,p)]=fs.readFileSync(p,'utf8');}};walk(root);return out;};

test('renders kit files with the repo name and adds the license to package.json after private',()=>{
 const kit=makeKit(),repo=makeRepo();
 const written=applyCommunityKit({kitDir:kit,targetDir:repo,name:'bandera'});
 assert.equal(read(repo,'LICENSE'),'MIT bandera\n');
 assert.ok(written.includes('LICENSE')&&written.includes('.github/workflows/ci.yml')&&written.includes('package.json'));
 const pkg=JSON.parse(read(repo,'package.json'));
 assert.equal(pkg.license,'MIT');
 assert.deepEqual(Object.keys(pkg),['name','private','license','scripts']);
 assert.ok(read(repo,'package.json').endsWith('}\n'));
});

test('CI test step exists only when the repo defines a test script',()=>{
 const kit=makeKit();
 const withTest=makeRepo(),noTest=makeRepo({pkg:{name:'a',private:true,scripts:{lint:'x',build:'z'}}}),noScripts=makeRepo({pkg:{name:'b'}});
 for(const r of [withTest,noTest,noScripts])applyCommunityKit({kitDir:kit,targetDir:r,name:'x'});
 assert.match(read(withTest,'.github/workflows/ci.yml'),/- run: pnpm test\n/);
 assert.doesNotMatch(read(withTest,'.github/workflows/ci.yml'),/if-test/);
 assert.doesNotMatch(read(noTest,'.github/workflows/ci.yml'),/pnpm test/);
 assert.doesNotMatch(read(noScripts,'.github/workflows/ci.yml'),/pnpm test/);
});

test('READMEs get badges under the title and a localized section, exactly once',()=>{
 const kit=makeKit(),repo=makeRepo();
 applyCommunityKit({kitDir:kit,targetDir:repo,name:'bandera'});
 const en=read(repo,'README.md'),es=read(repo,'README.es.md');
 assert.match(en,/^# Demo\n\n<!-- community-badges -->\n.*actions\/workflows\/ci\.yml\/badge\.svg.*License-MIT.*\n<!-- \/community-badges -->\n\n\[Español\]/s);
 assert.match(en,/## License and contributing/);
 assert.match(es,/## Licencia y contribución/);
 assert.equal(en.split('community-badges -->').length-1,2);
 assert.equal(en.split('<!-- community-section -->').length-1,1);
});

test('a second run changes nothing, including READMEs with CRLF line endings',()=>{
 const kit=makeKit(),repo=makeRepo({readme:'# Demo\r\n\r\n[Español](README.es.md)\r\n\r\nBody.\r\n'});
 applyCommunityKit({kitDir:kit,targetDir:repo,name:'bandera'});
 const before=snapshot(repo);
 const again=applyCommunityKit({kitDir:kit,targetDir:repo,name:'bandera'});
 assert.deepEqual(again,[]);
 assert.deepEqual(snapshot(repo),before);
});

test('package.json that already says MIT is left untouched byte for byte',()=>{
 const kit=makeKit();
 const raw='{\r\n  "name": "x",\r\n  "license": "MIT"\r\n}\r\n';
 const repo=makeRepo();write(repo,'package.json',raw);
 const written=applyCommunityKit({kitDir:kit,targetDir:repo,name:'x'});
 assert.equal(read(repo,'package.json'),raw);
 assert.ok(!written.includes('package.json'));
});

test('a missing README.es.md does not stop the other files',()=>{
 const kit=makeKit(),repo=makeRepo({readmeEs:null});
 applyCommunityKit({kitDir:kit,targetDir:repo,name:'x'});
 assert.ok(fs.existsSync(path.join(repo,'LICENSE')));
 assert.ok(!fs.existsSync(path.join(repo,'README.es.md')));
});

test('dry run reports changes but writes nothing',()=>{
 const kit=makeKit(),repo=makeRepo();const before=snapshot(repo);
 const written=applyCommunityKit({kitDir:kit,targetDir:repo,name:'x',dryRun:true});
 assert.ok(written.length>0);
 assert.deepEqual(snapshot(repo),before);
});

test('assertClean refuses a dirty tree and a non-git directory',()=>{
 const dir=tmp();
 assert.throws(()=>assertClean(dir),/not a git repo/);
 execSync('git init -q',{cwd:dir});execSync('git commit --allow-empty -m init -q',{cwd:dir,env:{...process.env,GIT_AUTHOR_NAME:'t',GIT_AUTHOR_EMAIL:'t@t',GIT_COMMITTER_NAME:'t',GIT_COMMITTER_EMAIL:'t@t'}});
 assert.doesNotThrow(()=>assertClean(dir));
 write(dir,'new.txt','x');
 assert.throws(()=>assertClean(dir),/working tree is not clean/);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test scripts/community.test.mjs`
Expected: FAIL (`Cannot find module './lib/community.mjs'`).

- [ ] **Step 3: Implement `scripts/lib/community.mjs`**

```js
// scripts/lib/community.mjs
// Renders community-kit/ into a repo and makes the per-repo edits (package.json license, README badges and section).
import {execSync} from 'node:child_process';
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
    status = execSync('git status --porcelain', {cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']});
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test scripts/community.test.mjs`
Expected: 8 tests pass. If the CRLF idempotency test fails, debug `replaceBlock` marker detection before changing the test.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/community.mjs scripts/community.test.mjs
git commit -m "feat(community): render kit into a repo with license, badges and CI step"
```

(Append the Co-Authored-By trailer.)

---

### Task 2: The kit templates

**Files:**
- Create: `community-kit/LICENSE`, `community-kit/CONTRIBUTING.md`, `community-kit/CODE_OF_CONDUCT.md`, `community-kit/SECURITY.md`, `community-kit/.github/PULL_REQUEST_TEMPLATE.md`, `community-kit/.github/ISSUE_TEMPLATE/bug_report.yml`, `community-kit/.github/ISSUE_TEMPLATE/feature_request.yml`, `community-kit/.github/ISSUE_TEMPLATE/config.yml`, `community-kit/.github/workflows/ci.yml`
- Modify: `scripts/community.test.mjs` (append kit-content tests)

**Interfaces:**
- Consumes: template conventions from Task 1 (`{{name}}`, `# if-test`).

- [ ] **Step 1: Append the failing kit tests to `scripts/community.test.mjs`**

```js
const KIT='community-kit';
const KIT_FILES=['LICENSE','CONTRIBUTING.md','CODE_OF_CONDUCT.md','SECURITY.md','.github/PULL_REQUEST_TEMPLATE.md','.github/ISSUE_TEMPLATE/bug_report.yml','.github/ISSUE_TEMPLATE/feature_request.yml','.github/ISSUE_TEMPLATE/config.yml','.github/workflows/ci.yml'];

test('the kit ships every community file and none has leftover placeholders',()=>{
 for(const rel of KIT_FILES){
  const text=fs.readFileSync(path.join(KIT,rel),'utf8');
  assert.ok(text.trim().length>0,rel);
  assert.doesNotMatch(text,/\[INSERT[^\]]*\]|\[Tu Nombre\]|TODO|TBD/,rel);
  const unknown=[...text.matchAll(/\{\{(\w+)\}\}/g)].map(m=>m[1]).filter(k=>k!=='name');
  assert.deepEqual(unknown,[],`${rel}: unknown placeholders`);
 }
 assert.deepEqual(fs.readdirSync(KIT,{recursive:true}).filter(f=>fs.statSync(path.join(KIT,f)).isFile()).map(f=>f.split(path.sep).join('/')).sort(),[...KIT_FILES].sort());
});

test('license is MIT for Manuel De Asís and the code of conduct has a contact',()=>{
 const lic=fs.readFileSync(path.join(KIT,'LICENSE'),'utf8');
 assert.match(lic,/^MIT License\n\nCopyright \(c\) 2026 Manuel De Asís\n/);
 assert.match(fs.readFileSync(path.join(KIT,'CODE_OF_CONDUCT.md'),'utf8'),/manueldeasis27@gmail\.com/);
 assert.match(fs.readFileSync(path.join(KIT,'SECURITY.md'),'utf8'),/manueldeasis27@gmail\.com/);
});

test('CI workflow pins pnpm 9 and Node 22 and has the conditional test step',()=>{
 const ci=fs.readFileSync(path.join(KIT,'.github/workflows/ci.yml'),'utf8');
 assert.match(ci,/version: 9/);
 assert.match(ci,/node-version: 22/);
 assert.match(ci,/pnpm install --frozen-lockfile/);
 assert.match(ci,/- run: pnpm test # if-test/);
 for(const cmd of ['pnpm lint','pnpm build'])assert.ok(ci.includes(cmd),cmd);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `node --test scripts/community.test.mjs`
Expected: the 3 new tests FAIL (kit directory does not exist).

- [ ] **Step 3: Create the templates**

`community-kit/LICENSE`:

```
MIT License

Copyright (c) 2026 Manuel De Asís

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

`community-kit/CONTRIBUTING.md`:

````markdown
# Contributing to {{name}}

Thanks for taking the time to improve this project. Issues and pull requests are welcome.

## Before you start

- Search [existing issues](https://github.com/mdeasis27/{{name}}/issues) to avoid duplicates.
- For anything larger than a small fix, open an issue first so we can agree on the approach.
- By participating you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Set up

You need Node 22 and [pnpm](https://pnpm.io) 9.

```bash
git clone https://github.com/mdeasis27/{{name}}.git
cd {{name}}
pnpm install
pnpm dev
```

## Make a change

1. Fork the repository and create a branch from `main` named for the intent: `feat/…`, `fix/…`, `docs/…` or `chore/…`.
2. Keep the change focused: one logical change per pull request.
3. Add or update tests when behavior changes.
4. Make sure the checks pass locally:

   ```bash
   pnpm lint
   pnpm test   # if the project defines tests
   pnpm build
   ```

5. Commit with [Conventional Commits](https://www.conventionalcommits.org) (`feat: …`, `fix: …`, `docs: …`).
6. Open a pull request and fill in the template. CI must be green before review.

## Style

- TypeScript in strict mode: no `any`, no `@ts-ignore`.
- Money values are integers in cents, never floats.
- Code, comments and commit messages are in English. User-facing text follows the project's languages (English and Spanish).
- Demos must keep working without API keys (demo mode).

## Reporting bugs and ideas

Use the issue templates. Include steps to reproduce, what you expected and what happened. Security problems go through [SECURITY.md](SECURITY.md), not public issues.
````

`community-kit/CODE_OF_CONDUCT.md`: obtain the official Contributor Covenant 2.1 text and set the contact:

```bash
curl -fsSL https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md -o community-kit/CODE_OF_CONDUCT.md
grep -c "\[INSERT CONTACT METHOD\]" community-kit/CODE_OF_CONDUCT.md   # Expected: 1
sed -i 's/\[INSERT CONTACT METHOD\]/manueldeasis27@gmail.com/' community-kit/CODE_OF_CONDUCT.md
```

If the download fails or the placeholder count is not 1, stop and report: do not hand-write the covenant.

`community-kit/SECURITY.md`:

```markdown
# Security policy

## Supported versions

Only the latest commit on `main` is supported.

## Reporting a vulnerability

Please do not open a public issue for security problems.

- Preferred: use [GitHub private vulnerability reporting](https://github.com/mdeasis27/{{name}}/security/advisories/new).
- Or email manueldeasis27@gmail.com with a description, steps to reproduce and the impact.

You can expect an acknowledgement within 5 business days. Once the problem is confirmed, a fix is prepared privately and the report is credited unless you prefer otherwise.

## Scope

This repository is a portfolio demo. Its scenarios use fictional or anonymized data and its results are simulations; it does not process real customer data or connect to production systems. Issues in the code, dependencies or build configuration are in scope.
```

`community-kit/.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## What and why

<!-- What does this change do, and why is it needed? Link the issue: Closes #123 -->

## How it was verified

- [ ] `pnpm lint`
- [ ] `pnpm test` (if the project defines tests)
- [ ] `pnpm build`
- [ ] Manually checked in the browser (EN and ES, if UI changed)

## Notes for the reviewer

<!-- Trade-offs, follow-ups, screenshots. -->
```

`community-kit/.github/ISSUE_TEMPLATE/bug_report.yml`:

```yaml
name: Bug report
description: Something does not work as expected
labels: [bug]
body:
  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      description: Describe the problem and what you expected instead.
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
      placeholder: |
        1. Open …
        2. Click …
        3. See …
    validations:
      required: true
  - type: input
    id: environment
    attributes:
      label: Browser and OS
      placeholder: Chrome 130 on Windows 11
```

`community-kit/.github/ISSUE_TEMPLATE/feature_request.yml`:

```yaml
name: Feature request
description: Suggest an improvement or a new idea
labels: [enhancement]
body:
  - type: textarea
    id: problem
    attributes:
      label: What problem would this solve?
    validations:
      required: true
  - type: textarea
    id: proposal
    attributes:
      label: What would you like to see?
    validations:
      required: true
  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives you considered
```

`community-kit/.github/ISSUE_TEMPLATE/config.yml`:

```yaml
blank_issues_enabled: false
contact_links:
  - name: Security vulnerability
    url: https://github.com/mdeasis27/{{name}}/security/advisories/new
    about: Report security problems privately, not as a public issue.
  - name: Contact Manuel
    url: mailto:manueldeasis27@gmail.com
    about: Questions or collaboration ideas.
```

`community-kit/.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm test # if-test
      - run: pnpm build
```

- [ ] **Step 4: Run to verify it passes**

Run: `node --test scripts/community.test.mjs`
Expected: all 11 tests pass.

- [ ] **Step 5: Commit**

```bash
git add community-kit scripts/community.test.mjs
git commit -m "feat(community): add license, contribution, security and CI templates"
```

(Append the Co-Authored-By trailer.)

---

### Task 3: CLI and package script

**Files:**
- Create: `scripts/community-propagate.mjs`
- Modify: `package.json` (hub, `scripts` block)

**Interfaces:**
- Consumes: `applyCommunityKit`, `assertClean` (Task 1); `loadPortfolioConfig(hubDir)` from `scripts/lib/load-config.mjs` (returns `{siblings:[{name,kits}]}`).
- Produces: `pnpm community:propagate [--dry-run]`; prints one line per repo, exits non-zero without writing anything if any target is dirty.

- [ ] **Step 1: Create the CLI**

```js
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
```

In the hub `package.json`, add inside `scripts` next to `ai:propagate`:

```json
    "community:propagate": "node scripts/community-propagate.mjs",
```

- [ ] **Step 2: Dry-run against the real repos**

Run: `pnpm community:propagate --dry-run`
Expected: 22 lines `DRY RUN <name>: N file(s)` (hub plus 21 siblings), N = 12 for every repo (9 kit files + package.json + 2 READMEs), and `git status` in every repo still clean. If any sibling is missing or errors, stop and report.

- [ ] **Step 3: Verify the dirty-tree refusal on the real hub**

Run (in the hub): `echo x > _dirty.txt && pnpm community:propagate; echo "exit=$?"` then `rm _dirty.txt` (that single file only).
Expected: message `working tree is not clean`, `exit=1`, and no repo modified.

- [ ] **Step 4: Full script tests, then commit**

Run: `pnpm test:scripts`
Expected: all pass (previous count plus the 11 new).

```bash
git add scripts/community-propagate.mjs package.json
git commit -m "feat(community): add community:propagate script"
```

(Append the Co-Authored-By trailer.)

---

### Task 4: Pilot on `bandera`

**Files:** changes only inside `../bandera` (generated).

- [ ] **Step 1: Prepare the branch**

In `../bandera`: `git worktree list`, `git status --short` (must be clean), `git fetch`, `git switch -c chore/community-files origin/main`, then `git branch --unset-upstream`.

- [ ] **Step 2: Propagate only to the pilot**

The CLI targets all repos, so apply the library directly to the pilot from the hub directory:

```bash
node -e "import('./scripts/lib/community.mjs').then(m=>console.log(m.applyCommunityKit({kitDir:'community-kit',targetDir:'../bandera',name:'bandera'})))"
```

Expected: a list including `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `.github/...`, `package.json`, `README.md`, `README.es.md`.

- [ ] **Step 3: Verify locally**

In `../bandera`: `git diff --stat` shows only the expected files; run `pnpm lint && pnpm test && pnpm build`.
Expected: all exit 0.

- [ ] **Step 4: Commit, push, PR (pilot has no `[skip ci]`)**

```bash
git add LICENSE CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md .github package.json README.md README.es.md
git commit -m "docs: add license, contribution rules, security policy and CI"
git push origin chore/community-files:chore/community-files
```

Then, as a separate call: `gh pr create --base main --head chore/community-files --title "docs: add license, contribution rules, security policy and CI" --body "<what and why, ends with the Claude Code line>"`.

- [ ] **Step 5: Verify CI and Vercel on the PR**

Run: `gh pr checks <n> --repo mdeasis27/bandera --watch`
Expected: the `verify` job succeeds. If it fails, read `gh run view --log-failed`, fix the template in the hub (new commit on this branch, re-run Task 3 Step 4 and this task from Step 1 on a clean branch), and do not roll out to the other repos until the pilot is green.

---

### Task 5: Roll out to the other 20 repos and the hub

**Files:** generated changes in 20 siblings and in the hub itself.

- [ ] **Step 1: Prepare all branches**

For each of the 20 remaining siblings (every name in `portfolio.config.mjs` except `bandera`): confirm `git status --short` is empty, `git fetch`, `git switch -c chore/community-files origin/main`, `git branch --unset-upstream`. Stop and report if any repo is dirty (could be another session's work).

- [ ] **Step 2: Propagate**

The pilot already carries its changes (clean-tree check would fail for it), so apply the library to each remaining target rather than the CLI:

```bash
for r in $(node -e "import('./portfolio.config.mjs').then(m=>console.log(m.default.siblings.map(s=>s.name).filter(n=>n!=='bandera').join(' ')))"); do
  node -e "import('./scripts/lib/community.mjs').then(m=>console.log('$r',m.applyCommunityKit({kitDir:'community-kit',targetDir:'../$r',name:'$r'}).length))"
done
node -e "import('./scripts/lib/community.mjs').then(m=>console.log('hub',m.applyCommunityKit({kitDir:'community-kit',targetDir:'.',name:'portafolio-mdea'}).length))"
```

Expected: 21 lines with a count of 12 each (the hub has no `test` script, but the file count is the same).

- [ ] **Step 3: Verify every repo locally (background, log to a file)**

For each repo run `pnpm lint && pnpm test && pnpm build` (skip `pnpm test` for the hub) and write one line per repo `name ok|FAIL` to `$TMP/community-verify.log`. Read the tail of the log only.
Expected: 22 lines `ok`. Any FAIL: inspect that repo's output before continuing.

- [ ] **Step 4: Commit and push each sibling and the hub**

Per repo: `git add LICENSE CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md .github package.json README.md README.es.md` then `git commit -m "docs: add license, contribution rules, security policy and CI [skip ci]"` (with trailer), then `git push origin chore/community-files:chore/community-files` (one call per push, no `main` word in it). For the hub, use the existing branch `feat/community-kit` (it already holds the kit, script and spec), and add the generated files as one more commit.

- [ ] **Step 5: Open the PRs**

As separate calls: `gh pr create --base main --head chore/community-files ...` for each sibling (same title and body as the pilot, noting `[skip ci]` was used to avoid 21 Vercel builds), and one PR for the hub from `feat/community-kit`. Collect the 22 PR numbers into `$TMP/community-prs.txt` as `repo number`.

---

### Task 6: Handoff: merge loop, pre-public checks and settings (prepared, not run)

**Files:** none in the repos; outputs are text for Manuel.

- [ ] **Step 1: Personal-data scan of docs**

For each repo, grep tracked files (and `git log --all -p` diffs of `docs/`) for emails other than `manueldeasis27@gmail.com`, phone-number patterns, and the words `confidencial`, `interno`, `password`. Report the hits per repo; do not edit anything.

- [ ] **Step 2: Write the merge loop for Manuel**

Produce, from `community-prs.txt`, a loop he runs with `!`:

```bash
while read repo n; do gh pr merge "$n" --repo mdeasis27/"$repo" --squash --delete-branch --subject "docs: add license, contribution rules, security policy and CI [skip ci]"; done < community-prs.txt
```

- [ ] **Step 3: Prepare the settings commands**

For each repo, from `content/projects/en/<slug>.mdx` (`oneLiner`, `liveUrl`), generate the commands (do not run):

```bash
gh repo edit mdeasis27/<repo> --description "<oneLiner>" --homepage "<liveUrl>" --add-topic portfolio --add-topic applied-ai --add-topic nextjs --add-topic typescript --delete-branch-on-merge
gh api -X PUT repos/mdeasis27/<repo>/private-vulnerability-reporting
```

and, last, `gh repo edit mdeasis27/<repo> --visibility public --accept-visibility-change-consequences` for the 11 repos still private.

- [ ] **Step 4: Report and wait**

Present: the 22 PR links, the pilot's CI result, the scan hits, and the prepared commands. Run nothing that merges, edits settings or changes visibility until Manuel confirms each batch in the conversation. After the merges, verify with `gh api repos/mdeasis27/<repo>/community/profile --jq .health_percentage` (expected >= 90) and that `identidad-360`'s `LICENSE` no longer contains `[Tu Nombre]`.
