# Community kit: license, contribution rules and CI for all 22 repos

Date: 2026-10-07 · Scope: the hub (`portafolio-mdea`) plus the 21 siblings declared in `portfolio.config.mjs`.

## Purpose and audience

Every portfolio repo should look professional and be safe to make public: a recruiter or engineer who opens any repo finds a license, clear contribution rules, a security contact, templates, and a green CI badge. Success: all 22 repos carry the same community files, each repo's CI passes, and every repo is public.

## Decisions (agreed with Manuel, 2026-10-07)

| Topic | Decision |
|---|---|
| Final visibility | All 22 public (today 11 public, 11 private). |
| License | MIT, `Copyright (c) 2026 Manuel De Asís`. |
| Contributions | Issues and PRs welcome, with clear rules. |
| Out of scope | Dependabot (extra PRs and Vercel builds), CHANGELOG. |

## Facts established before design

- History scan of all 22 repos (all branches): no real secrets, no `.env`/key files ever committed; the only pattern hit is the placeholder `sk-ant-REEMPLAZA_CON_TU_KEY`. Personal-data scan of `docs/` is still required before flipping visibility.
- Only `identidad-360` has a `LICENSE`, and it still contains the placeholder `[Tu Nombre]` (must be corrected).
- No repo has `.github/`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` or `SECURITY.md`. All have `README.md` and `README.es.md`.
- All repos use pnpm with `lint`, `test`, `build` scripts (the hub has no `test`). `package.json` has no `packageManager` field and `"private": true`; none has a `license` field.

## Design

### Template kit (hub, `community-kit/`)

Files copied into each repo with `{{name}}` / `{{slug}}` substitution (English, GitHub standard; READMEs stay bilingual):

- `LICENSE` (MIT).
- `CONTRIBUTING.md`: fork, branch, `pnpm install`, run `pnpm lint`, `pnpm test`, `pnpm build`, conventional commits, open a PR, what a good issue contains.
- `CODE_OF_CONDUCT.md`: Contributor Covenant 2.1, contact `manueldeasis27@gmail.com`.
- `SECURITY.md`: report through GitHub private vulnerability reporting or by email; states the demos are simulations over fictional data.
- `.github/ISSUE_TEMPLATE/bug_report.yml`, `feature_request.yml`, `config.yml` (blank issues disabled, contact link to the email), `.github/PULL_REQUEST_TEMPLATE.md`.
- `.github/workflows/ci.yml`: on push to `main` and on pull requests: checkout, `pnpm/action-setup` (version 9), Node 22 with pnpm cache, `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm test` (only when the repo's `package.json` has a `test` script), `pnpm build`.

### Propagation script (hub)

`scripts/community-propagate.mjs` (`pnpm community:propagate [--dry-run]`):

- Targets: the hub and every sibling in `portfolio.config.mjs`, resolved as `../<name>` (same convention as `brand:propagate`, reusing `loadPortfolioConfig`).
- Writes the kit files; refuses to run on a dirty working tree; never runs git, never commits or pushes.
- Idempotent: running it twice produces no diff.
- Per-repo edits it also makes: `package.json` gets `"license": "MIT"` (existing keys and ordering preserved); `README.md` and `README.es.md` get license and CI badges under the title plus a short "License and contributing" / "Licencia y contribución" section, each inserted once (marker comment prevents duplicates).
- The CI workflow includes the `test` step only if the target defines that script, so one template serves all 22 repos.
- `identidad-360/LICENSE` is overwritten with the corrected text.

### Delivery

- One branch `chore/community-files` per repo, from `origin/main`, one PR each (22 PRs).
- Commit messages carry `[skip ci]` so Vercel does not build 22 previews and 22 production deploys on the Hobby plan. One pilot repo (`bandera`) omits the marker so the new workflow and the Vercel flow run once for real.
- Manuel runs the merges (a loop is prepared; squash subject carries `[skip ci]`).
- Outward-facing GitHub settings come last and only after Manuel confirms: repo description, homepage (live demo URL), topics, private vulnerability reporting, delete-branch-on-merge, and finally visibility -> public. Manuel flips visibility, or approves it explicitly per batch.

### Out of scope

Content of `docs/` beyond the personal-data scan, project code, Vercel settings, and the `brand`/`ai` kits.

## Verification

- Hub: `pnpm test:scripts` covers the script (substitution, idempotency, dirty-tree refusal, conditional `test` step, README insertion once, `--dry-run` writes nothing).
- Every repo: after propagation, `pnpm lint && pnpm build` (plus `pnpm test` where defined) still pass locally, and `git diff --stat` shows only the expected files.
- Pilot (`bandera`): the GitHub Actions run on the PR is green.
- After merges: `gh api repos/mdeasis27/<r>/community/profile` shows health >= 90 for each repo.

## Risks

- A repo whose existing CI/Vercel config assumes something different from pnpm 9 / Node 22: the pilot and local builds catch it; Vercel production is unaffected by `.github/` files.
- Making repos public exposes commit history and docs permanently: mitigated by the scan above and the per-batch confirmation gate.
