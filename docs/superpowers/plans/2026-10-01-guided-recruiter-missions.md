# Guided recruiter missions implementation plan

**Goal:** Give a recruiter a two-minute, bilingual route through three business decisions they can test themselves.

**Approved scope:** Manuel approved Evidencia, Compuerta and Destilación, interactive missions, simultaneous computed comparisons, mobile readability and professional reasoning. Publication remains separate.

**Architecture:** Keep each project's actual local algorithm and playback. Add a small shared mission presentation kit, with project-owned counterfactual calculations. The hub guides visitors to the three case studies and demos. No dependencies, external requests, accounts, model calls or invented business outcomes.

**Design:** Editorial decision desk: restrained existing Geist typography and semantic tokens, oversized decision numbers, an inspectable comparison and a compact mobile introduction. Motion only follows actual playback; reduced motion remains supported.

## Tasks

- [x] Test counterfactual behavior before implementation: Evidencia compares strict/permissive retrieval on the same corpus; Compuerta compares failover on/off for the same outage; Destilación handles exact cost equality without claiming a cheaper option. Test cancellation and unchanged inputs.
- [x] Implement project-owned mission helpers and a shared `mission-lab.tsx` presentation kit. Predictions must be cleared by edits, presets and reset. Comparisons appear only at completed playback and must use the executed input snapshot.
- [x] Integrate all three experiences, concise mission briefs, project-specific challenges and expandable engineering decisions/production limitations. Preserve custom controls and existing trace/cancellation behavior.
- [x] Add the bilingual recruiter journey to the hub, with three ordered steps, honest user-marked progress, current case/demo links and a reset. Keep all 21 projects accessible.
- [x] Verify all four repositories with tests, lint, strict types and production builds. Browser-check actual components in both languages: predictions, comparisons, edit/reset invalidation, equality, no future result, keyboard, reduced motion and mobile legibility. No retry of previously denied server/cache actions.
- [x] Refresh the three projects' screenshots, public captures and bilingual documentation. Add a scoped evidence report; preserve previous acceptance reports and clearly distinguish component checks from route/deployment checks.

## Review focus

- Comparison must change only the stated variable; cancellation must also stop the counterfactual.
- No answer or success rate appears before terminal playback.
- Editing an input clears prediction, comparison and obsolete trace together.
- Exact cost equality is reported as equality, never savings.
- Mobile comparisons stack with ordinary readable text; wide diagrams scroll inside their own labeled container.

## Execution notes

Repository states and worktrees inspected. All four moved to `feat/guided-recruiter-missions`; existing uncommitted work retained. Implementation is sequential in the current directories to avoid transferring or overlapping earlier uncommitted work. One independent read-only review will cover the final scope. No commit, push or publication is implied.

## Completion evidence

`docs/quality/recruiter-missions-acceptance.md`: 96 tests, 16 command checks, 8 bilingual browser component checks, 6 local guide-to-demo checks and 20 PNG evidence assets. The existing 21-preview gallery also passed. All four branches preserve prior work; publication and actual Next HTTP-route checks remain pending.
