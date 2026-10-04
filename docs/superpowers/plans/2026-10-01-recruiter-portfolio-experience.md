# Recruiter Portfolio Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking. Execute in the current session; additional agents and publication are not required by this plan.

**Goal:** Bring the hub and every one of its 21 projects to a consistent, bilingual, interactive AI Product portfolio standard.

**Architecture:** Extend the existing portable design system with locale and demo-presentation primitives. Each project has a typed local adapter over its domain logic, its own visualization, and an optional separate live integration. Route public pages through `/en` and `/es` without changing API paths.

**Tech Stack:** Next.js 16.2.3, React 19.2.4, strict TypeScript, existing CSS tokens and components, SVG/CSS visualizations, MDX, existing TypeScript/Python domain modules and test runners. No new runtime dependency unless an implementation constraint demonstrates the need and is reviewed.

**Spec:** `docs/superpowers/specs/2026-10-01-recruiter-portfolio-experience.md`

## Global Constraints

- English is the default; Spanish is an equivalent supported language throughout navigation, demos, errors, case studies, and documentation.
- No login, paid account, API key, or database connection is required for the primary demo.
- No external company names in public copy; preserve required integration identifiers and licensing notices.
- Meaningful input changes affect computed results or traces. Label every simulation and trace playback.
- Monetary amounts use integer cents. No `any` or `@ts-ignore`.
- Preserve the existing uncommitted anonymization changes and work on intent-named branches. Do not commit, merge, deploy, or publish merely to satisfy a process step.
- Shared-kit propagation refuses dirty repositories. Do not bypass that protection: use the already available individual sync workflow for owned changes after recording and reviewing affected files, or take an approved checkpoint before propagation.

## Review Focus

- A previous run finishes after input changes or cancellation: obsolete results must not replace the current run. Test in Task 1.
- Missing database/API credentials: the primary experience still computes and renders a result. Test in Tasks 3–24.
- Language changes during editing: inputs must survive or an explicit reset warning must appear. Test in Tasks 1–2.
- Reduced motion, narrow screens, and keyboard input: complete the workflow without animation or pointer-only controls. Check in Tasks 1 and 25.
- Unsupported queries or ambiguous evidence: show refusal/review and explain the supported scope rather than invent an answer. Test in the owning domain task.

## Task 1: Shared locale and demo foundations

**Files:** Create `design-system/i18n/locale.ts`, `design-system/i18n/context.tsx`, `design-system/components/language-switch.tsx`, `design-system/demo/types.ts`, `design-system/demo/use-demo-run.ts`, `design-system/demo/demo-shell.tsx`, `design-system/demo/trace-player.tsx`; extend `design-system/README.md`; add focused tests under `design-system/demo/` and `design-system/i18n/`.

**Interfaces:** `Locale = 'en' | 'es'`; `localizedPath(path: string, locale: Locale): string`; `TraceEvent` contains `id`, `step`, `kind`, `messageKey`, optional evidence IDs, and measured execution timestamp; `DemoRun<I, R>` contains `input`, `result`, `trace`, `executionMs`, and `mode: 'local' | 'simulation' | 'live'`; `DemoAdapter<I, R>` accepts input, an `AbortSignal`, and an event callback, returning `Promise<DemoRun<I, R>>`. Shared UI never interprets domain evidence or calculates business metrics.

- [x] Write tests for locale normalization, same-page switching, cancelling a run, ignoring stale completion, resetting input/result, and replay time remaining separate from execution time.
- [x] Confirm the initial locale/cancellation tests fail before implementing their behavior; later tests verify final behavior without claiming an observed red phase.
- [x] Implement primitives using existing components, `Intl`, `AbortController`, and CSS/SVG. Include keyboard controls and reduced-motion behavior.
- [x] Run the focused tests and TypeScript; inspect desktop and phone layouts before distributing components.

## Task 2: Bilingual hub and navigation

**Files:** Move public `src/app/` pages and root layout under `src/app/[lang]/`; create `src/proxy.ts`; preserve `src/app/globals.css` and static metadata endpoints; modify `src/lib/projects.ts`, `src/lib/site.ts`, `src/components/site-nav.tsx`, `src/components/site-footer.tsx`, `src/components/project-card.tsx`; create `src/lib/i18n/en.ts`, `src/lib/i18n/es.ts`; split case studies under `content/projects/en/` and `content/projects/es/`.

**Interfaces:** `getAllProjects(locale: Locale): Promise<Project[]>`, `getProjectBySlug(slug: string, locale: Locale): Promise<Project | null>`, and localized source/demo link generation. Keep slug and technical metadata equal across translations.

- [x] Test `/` → `/en`, `/projects/<slug>` → `/en/projects/<slug>`, locale validation, and bypassing API/assets. Ensure redirects retain query strings.
- [x] Test translated case-study pairs, five-H2 structure, unique slugs, and identical source/demo identity.
- [x] Implement the locale segment and dictionaries following the installed internationalization guide. Translate metadata and content, including HTML language and alternate-language links.
- [x] Rework the home briefing around applied AI Product work; keep the complete catalogue available. Add real screenshot slots only when captures exist.
- [x] Run content checks, TypeScript, lint, build, and navigation checks in both languages.

## Per-project task contract

Tasks 3–23 each produce one independently usable project. For repository `<project>`, create `lib/experience/types.ts`, `lib/experience/adapter.ts`, `lib/experience/copy.en.ts`, `lib/experience/copy.es.ts`, `components/experience/experience.tsx`, and `components/experience/visualization.tsx`. Add `lib/experience/adapter.test.ts` to substantive new behavior; use existing tests where they already prove it. Modify the current `app/page.tsx`, `app/app/page.tsx`, and `app/layout.tsx` through their new `app/[lang]/` equivalents; create root `proxy.ts`. Migrate additional public pages listed in each task. Keep `app/api/` unchanged except for optional persistence-error handling.

**Interfaces:** Each repository defines its own `ExperienceInput` and `ExperienceResult`. Export `runExperience: DemoAdapter<ExperienceInput, ExperienceResult>` from `lib/experience/adapter.ts`; the visualizer accepts its typed result and trace. Inputs use language-neutral IDs; dictionaries translate labels and explanation keys. Domain functions stay in their existing folders and do not depend on UI.

**Required steps for each task:**

- [x] Record the current tree and create an intent-named branch while preserving the existing anonymization edits.
- [x] Add focused tests for the two input-dependent outcomes named below, invalid/empty input, deterministic reset, and running without database or API credentials.
- [x] Implement the smallest adapter over existing algorithms; add a local domain module only where the current project has fixtures or live integrations rather than an editable computation.
- [x] Build the domain visualization and scenario controls; integrate the shared shell and EN/ES dictionaries. Keep live execution optional and explicitly labeled.
- [x] Run the relevant tests, TypeScript, lint, build, and both-language browser flow. Record measured evidence and remaining limitations.
- [x] Update the corresponding two hub case studies and both repository READMEs to match the implemented behavior.

## Task 3: agente-riesgo — reference experience

Reuse `lib/demo-cases.ts` and `lib/agent.ts` as reference material; add `lib/experience/policy.ts` for an explicitly labeled policy simulation. Inputs: verification flags, evidence coverage, and escalation threshold. Compare a complete/clean case with an incomplete or sanctioned case; raising the review threshold must change the review queue without inventing a probability. Replace fixture URLs with inspectable local evidence IDs. Visualize evidence lanes and the decision branch. This task establishes the shared visual standard; the remaining tasks reuse its conventions, not its visualization.

## Task 4: identidad-360

Reuse `lib/truora.ts`, `lib/tavily.ts`, and `lib/synthesizer.ts` as integration/reference boundaries; keep them optional. Create local profile assembly in `lib/experience/profile.ts`. Inputs: enabled sources and conflicting identity signals. Removing a confirming source reduces evidence coverage; adding a contradiction triggers review. Visualize evidence provenance and contradictions rather than implying verified real identity.

## Task 5: kyc-antifraude

Reuse `lib/truora.ts` and `lib/synthesizer.ts` as optional integration boundaries; create `lib/experience/screening.ts`. Inputs: document completeness and screening flags. Clean/complete and flagged/incomplete cases take different state-machine paths. Also migrate `app/admin/page.tsx` to its localized equivalent. The local demo never starts a paid screening check.

## Task 6: radar-proveedores

Reuse `lib/risk-classifier.ts`; create local signal scoring in `lib/experience/due-diligence.ts`, keeping `lib/report-generator.ts` and `lib/tavily.ts` optional. Inputs: anonymized supplier signals and relevance weights. An unresolved high-impact signal causes a different recommendation than resolved low-impact evidence. Also migrate `app/history/page.tsx` and `app/supplier/[name]/page.tsx`; local history uses anonymous scenario IDs.

## Task 7: agente-cobranzas

Extract the contact-policy calculation from `app/api/run-collections/route.ts` into a pure `lib/experience/contact-policy.ts` without changing cron behavior. Inputs: delinquency, amount in cents, segment, and policy. Crossing a policy boundary changes priority and message tone. Show queue segmentation and a local message preview. Assert the primary demo imports neither the sending function nor scheduled execution.

## Task 8: evidencia

Reuse `lib/rag/retrievers.ts`, `lib/rag/answer.ts`, and `lib/rag/citations.ts`. Inputs: editable local corpus, question, retrieval configuration. Supported evidence yields cited output; an out-of-scope query refuses. Show retrieved passages and unsupported claims; heuristic generation is explicitly labeled.

## Task 9: grafo

Reuse `lib/grafo/graph.ts`, `lib/grafo/extract.ts`, `lib/grafo/resolve.ts`, `lib/grafo/retrieve.ts`, and `lib/grafo/answer.ts`. Inputs: entity and relationship query over the provided ontology. One-hop and multi-hop queries show different traversals; unsupported relationships refuse. Visualize highlighted nodes/edges beside the single-passage baseline.

## Task 10: veredicto

Reuse `lib/eval/retrievers.ts`, `lib/eval/retrieval.ts`, `lib/eval/agreement.ts`, and `lib/eval/diff.ts`. Inputs: retriever configuration and query subset. A known degraded configuration fails the existing regression gate. Show per-query rankings and calibration. Keep labels and sample size visible.

## Task 11: doorman

Reuse `lib/guard/guard.ts` and rules. Inputs: document text and tool policy. A benign document and an irreversible request from document origin produce different guard paths. Show fired rules and permitted/blocked operations. No real tool action occurs.

## Task 12: asedio

Reuse `lib/asedio/suite.ts`, `lib/asedio/checks.ts`, and the deterministic target proxies in `lib/asedio/demo.ts`. Inputs: attack families and target policy. Vulnerable and hardened runs have different findings; unknown payloads can enter review rather than receiving an invented verdict. Show a live-updating attack matrix and explicit simulated target labels.

## Task 13: compuerta

Reuse `lib/compuerta/sim.ts`, `breaker.ts`, and seeded workload generation. Inputs: outage window, traffic mix, failover/hedging policy. Failover changes availability under the same outage. Visualize requests, open/half-open/closed transitions, and recovery; execution steps represent simulated ticks, not real provider requests.

## Task 14: warmstart

Reuse `lib/cache/cache.ts`, `lib/cache/workload.ts`, and `lib/cache/semantic.ts`. Inputs: query batch, threshold, and prompt version. Changing the threshold affects hits; changing prompt version invalidates prior entries. Show lookup paths and false hits. Cost calculations display their assumptions and use integer cents, with pricing per batch when a single request costs less than a cent.

## Task 15: mesa

Reuse `lib/mesa/graph.ts`, `demo-agents.ts`, `budget.ts`, and `reviewer.ts`. Inputs: task, budgets, and rejection cap. A tight budget terminates differently from a permissive budget; repeated rejection still terminates within its bound. Visualize handoffs and budget consumption without suggesting local proxies are live LLM calls.

## Task 16: arbitro

Reuse `lib/arbitro/agreement.ts`, `lib/arbitro/arbitrate.ts`, and `lib/arbitro/benchmark.ts`. Inputs: candidate labels, confidence, escalation threshold. Strong agreement resolves; weak/split evidence escalates. Show vote distributions and the chosen branch. Candidate confidence is supplied scenario data, not a calibrated probability.

## Task 17: destilacion

Reuse `lib/destilacion/extract.ts`, `lib/destilacion/metrics.ts`, and `lib/destilacion/breakeven.ts`. Inputs: invoice text and monthly request volume. Different documents yield different fields; request volume crosses the computed break-even. Show field extraction and the cost curve, labeled as a rule-based student proxy and an assumed cost model.

## Task 18: escaneo

Reuse `lib/escaneo/extract.ts` and `validate.ts`. Inputs: OCR text and selected deterministic corruptions. A valid checksum passes; a corrupted field is highlighted for review. Do not claim a flagged error has been corrected unless a correction actually occurs. Visualize raw, extracted, and validated fields.

## Task 19: traductor

Reuse `lib/traductor/route.ts`, `generate.ts`, and `validate.ts`. Add `lib/experience/query-local.ts` for evaluating only supported templates over the committed schema and seeded records. A valid supported question returns computed rows; an unknown table or unsupported operation refuses. Show query interpretation, schema validation, and results without requiring a database or executing model-generated arbitrary SQL.

## Task 20: ensayo

Reuse `lib/ensayo/statistics.ts` and `lib/ensayo/analyze.ts`. Inputs: score samples and significance level. A known improvement advances; an inconclusive sample holds. Reject insufficient/invalid samples with a useful explanation. Show distributions, confidence interval, and the decision.

## Task 21: bandera

Reuse `lib/bandera/rollout.ts`, `lib/bandera/simulation.ts`, and `lib/bandera/statistics.ts`. Inputs: simulated variant quality and no-worse margin. Improvement advances through stages; a regression activates the kill switch. Visualize traffic stages and evidence at each transition.

## Task 22: fabrica

Reuse `lib/fabrica/generate.ts` and `lib/fabrica/similarity.ts`. Inputs: anonymized logs, similarity threshold, and sample count. Duplicate and diverse input batches yield different removal and coverage counts. Empty input does not claim 100% coverage. Visualize deduplication, grouping, and selected evaluation cases; do not claim intent labels were inferred if supplied by input.

## Task 23: vigia

Reuse `lib/vigia/extract.ts` and `lib/vigia/detect.ts`. Inputs: local source/document text and rename mappings. A known rename yields a proposed correction; a removed symbol without a mapping needs review. Show highlighted references and a preview diff. No source-file write or external PR occurs from the demo.

## Task 24: Repository presentation and assets

**Files in every repository:** `README.md`, `README.es.md`, `docs/images/cover.png`, `docs/images/demo.png`; add `docs/architecture.md` only where a README cannot clearly explain the existing boundaries. In the hub, add an English/Spanish presentation template under `docs/templates/` and a content-check script under `scripts/`.

- [x] Capture actual completed EN/ES interfaces at desktop and phone sizes; create covers from real captures and consistent typography.
- [x] Verify image resolution, relative image paths, and accessible descriptions.
- [x] Write paired READMEs using actual supported inputs, limitations, demo/source/case-study links, and dependency versions.
- [x] Reproduce frozen installation in the existing checkout, local demo, and relevant verification commands for each project; keep secrets out of examples and Git.
- [x] Check translation parity and naming policy in public text while exempting required technical identifiers and license notices.

## Task 25: Whole-portfolio acceptance

**Files:** Add `docs/quality/2026-10-01-portfolio-acceptance.md` with per-project evidence; update the rollout checklist and hub catalogue metadata to match actual completion.

- [x] Verify all 21 entries have a usable primary demo and both language case studies.
- [x] For every project, run the two contrasting inputs defined above, cancellation/reset, unsupported input, and no-credentials mode.
- [x] Verify desktop/phone, keyboard navigation, reduced motion, language switching, legacy redirects, localized links, and storage-error fallback.
- [x] Run tests appropriate to changed behavior, TypeScript, lint, and production builds in affected repositories. Record failures honestly; do not carry stale green results forward.
- [x] Review the final diffs and capture screenshots for every finished demo. Leave work local and present deployment/publication as a separate concrete approval step.

## Self-review

The tasks cover all 21 configured siblings and the hub. Shared contracts are defined once, domain inputs stay typed per repository, and existing algorithms remain the calculation source. Optional external writes are excluded from primary demos. Language routing, missing credentials, stale completion, unsupported input, accessibility, and repository reproducibility each have an owning verification step. No additional agent, commit, or publication is required by this plan.


## Execution notes — 2026-10-01

Implementation and primary-demo acceptance are complete across the hub and all 21 projects. See `docs/quality/2026-10-01-portfolio-acceptance.md` for executable evidence and proportional implementation adjustments. A fresh empty-clone installation and a red-first history for every project are not claimed.

- [ ] Repeat the corrected KYC admin mobile browser check when server launch is permitted. Its previous overflow result is preserved; lint, TypeScript and build passed after correction.
- [ ] Obtain separate authorization before production deployment or repository publication. The new public locale routes are not deployed and nine project repositories remain private.
