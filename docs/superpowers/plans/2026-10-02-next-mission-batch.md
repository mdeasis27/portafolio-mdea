# Evaluation, bounded agents and document policy — approved implementation plan

> **For agentic workers:** Use `superpowers:executing-plans` after Manuel reviews this material scope. Manuel approved this three-project implementation on 2026-10-02. Publication and denied-action retries remain unauthorized. Read-only independent review may be delegated when useful; writes stay sequential.

**Goal:** Extend useful mission patterns to Veredicto, Mesa and Doorman while giving each a distinct business decision.

**Architecture:** Preserve each project's existing adapter and scene. Add project-owned `lib/experience/mission.ts` comparisons, reuse the approved mission/trace components and keep the selected run's trace separate from silent comparisons. Counterfactuals use the same business input, with only the named policy or configuration changed.

**Tech Stack:** Existing Next.js, strict TypeScript, React, Vitest and shared design system; no new dependency or live integration.

**Spec:** Manuel's portfolio requirements and [pilot acceptance](../../quality/mission-pilot-acceptance.md). Owner visual approval is recorded separately in [the manual record](../../quality/mission-pilot-owner-review.json).

## Global constraints

- English default, equivalent Spanish; code/comments English. No public company examples, fabricated business impact or current-provider pricing.
- No `any`, `@ts-ignore`, secret-file reads or `.env` creation. All monetary calculations use integer cents; these three missions add no financial model.
- Inspect applicable AGENTS, installed APIs, Git status/current branch/log/worktrees before implementation. Preserve modified/untracked work and create an intent-named branch only after that inspection. Do not broadly synchronize dirty kits.
- No server/background launch, cache deletion, local-file browser automation or substitute for a denied action. No publishing, deploy, push, merge or secret-store write.
- Preserve edits, presets, reset, cancellation and existing scenes. Comparisons appear only at the terminal frame, and predictions/results invalidate when inputs change.

## Review focus

- Equal results are legitimate; never force a winner or claim a configuration is universally better.
- Cancel inside an event callback: no later event or comparison can publish.
- Invalid/empty input: existing validation applies to all comparison runs.
- Edited input after execution: no stale prediction, trace or comparison remains.
- Local traces, token units and permitted-operation lists are computation/simulation, not live retrieval quality, model billing or executed external actions.

## Task 1 — Veredicto: release a retrieval configuration

**Files:** Create `veredicto/lib/experience/mission.ts` and `mission.test.ts`; modify `veredicto/app/[lang]/app/page.tsx`, owned copies of `design-system/demo/mission-lab.tsx` and `trace-player.tsx`; update paired READMEs and hub `content/projects/{en,es}/veredicto.mdx`.

**Interface:** `runMission` keeps `ExperienceInput`, the selected adapter result, trace and local mode; adds comparison results for selected retrieval and BM25 reference. Both run on identical `queryId`, committed corpus and `k`. Existing degraded retrieval remains an explicitly labeled empty-ranking negative control.

- [x] Add failing tests for identical question/k, selected BM25 equality, degraded empty ranking and cancellation after a callback. Assert precision/recall from actual committed relevance labels, not invented impact.
- [x] Implement the wrapper with immutable input snapshots and silent reference execution. Preserve `compareRuns` gate semantics; disclose that a one-question gate is not a benchmark release certification and that calibration is existing reference data, not evidence of this execution.
- [x] Add an optional pass/block prediction after the controls, simultaneous ranking/precision/recall/gate cards and a concise explanation of relevant passages versus retrieved passages. Use the existing degraded scenario as the challenge; keep both equal and differing outcomes honest.
- [x] Verify tests, scoped lint, strict types, build and EN/ES static markup; document actual comparison inputs and browser-evidence limits.

## Task 2 — Mesa: choose an agent-workflow budget

**Files:** Create `mesa/lib/experience/mission.ts` and `mission.test.ts`; modify `mesa/app/[lang]/app/page.tsx`, owned mission/trace copies; update paired READMEs and hub Mesa case studies.

**Interface:** `runMission` preserves selected input/result/trace and simulation mode; adds selected versus 12-step reference results. Hold task, `maxTokens` and `maxRejections` fixed. Only `maxSteps` changes. Compare `trace.steps`, `budget`, termination reason and whether a draft exists.

- [x] Add failing tests for a one-step challenge versus a 12-step reference with 10,000 token units and one rejection allowance; same task/options; low token cap blocking both; reference equality; cancellation. Assert the actual budget boundary and completion state rather than assuming extra steps always complete.
- [x] Implement the wrapper without changing handlers or introducing real agents. Keep generated timestamps/run IDs out of business comparison equality; compare the computed work and termination fields.
- [x] Add an optional completes/stops prediction, the handoff sequence and a budget ledger showing consumed steps and modeled token units. Explicitly label these as simulation units and disclose any existing budget overrun behavior; correcting that behavior requires an evidenced, separately explained scope extension.
- [x] Verify the same technical and bilingual gates, including equal/blocked outcomes, and document the constraints needed for production orchestration.

## Task 3 — Doorman: can a document authorize an action?

**Files:** Create `doorman/lib/experience/mission.ts` and `mission.test.ts`; modify `doorman/app/[lang]/app/page.tsx`, owned mission/trace copies; update paired READMEs and hub Doorman case studies.

**Interface:** `runMission` preserves selected input/result/trace and local mode; adds hardened-on/off results computed on the exact same document. Compare `requested`, `executed`, `blockedBy` and fired rule IDs. Explain that `executed` is the existing simulator's permitted-action list: no email or ATS write occurs.

- [x] Add failing tests using the existing hostile document, a benign document, identical source text for both policies and callback cancellation. Assert the hardened path blocks document-origin email authorization while the unprotected simulation permits it; benign equality remains valid.
- [x] Implement the comparison without tool integrations or changing the policy rule set. Preserve the adapter's cancellation semantics.
- [ ] Add a blocked/permitted prediction, matched action lists and a visual link from document text to fired rule to policy consequence. Keep the document source visible and distinguish lexical rules from a comprehensive security guarantee.
- [x] Verify technical/bilingual gates and document false positives, false negatives and production isolation requirements.

## Documentation and acceptance handoff

- [x] Extend phase-specific command/markup/content helpers narrowly to the three new projects; retain previous reports and captures. Generate local component previews and syntax-check their scripts without claiming browser execution.
- [x] Update bilingual documentation and a new acceptance manifest with executable counts and explicitly pending browser/capture/HTTP gates. Current screenshots were unavailable; the boundary is recorded rather than marked complete.
- [ ] Ask Manuel to review the new local demos. Publication remains a separate decision after complete route/image/integration verification.

## Proposed sequence for all 15 remaining projects

| Batch | Projects | Decision focus |
|---|---|---|
| 1 | Veredicto, Mesa, Doorman | Retrieval quality, bounded work, document-origin actions |
| 2 | Identidad 360, KYC Antifraude, Radar Proveedores | Evidence consistency, onboarding gate, investigation triggers |
| 3 | Escaneo, Árbitro, Asedio | Extraction validation, disagreement, attack fixtures |
| 4 | Agente Cobranzas, Bandera, Fábrica | Contact routing, rollout limits, evaluation-set coverage |
| 5 | Grafo, Traductor, Vigía | Connected evidence, permitted query templates, source/document alignment |

Batches 2–5 are sequencing proposals, not implementation plans or approved scopes. Each requires checking actual algorithm controls before defining its comparison. A changed evidence signal must be labeled an evidence sensitivity scenario, not a policy comparison on identical data.

## Español — alcance para revisión

Se propone implementar primero **Veredicto, Mesa y Doorman**. Veredicto compara una configuración de recuperación con BM25 sobre la misma pregunta y corpus; Mesa compara el presupuesto elegido con 12 pasos manteniendo tarea, tokens y revisiones; Doorman compara la política activada/desactivada sobre el mismo documento. Cada demo conserva sus controles y visualización e incorpora predicción opcional, comparación final calculada y notas de producción.

La exploración independiente recomendó también el grupo Identidad 360/KYC/Radar por su continuidad temática. Se propone empezar por Veredicto/Mesa/Doorman para ampliar las competencias de AI Product mostradas tras el piloto de riesgo/estadística/caché. La secuencia de cinco lotes cubre los 15 restantes y evita repetir una sola plantilla de decisión.

Manuel aprobó la implementación de este lote el 2026-10-02. La aprobación visual del piloto anterior ya está registrada; capturas nuevas y rutas HTTP siguen pendientes, sin reintentar acciones denegadas ni autorizar publicación.

## Final review rulings

Independent review findings were reproduced and corrected. Veredicto now requires the existing recall >=0.5 quality condition as well as no regression and relevant labels; unscored questions cannot approve. Doorman separates classification from tool authorization, and classifying a document does not invent a requested action. Mesa/Doorman presets are localized and numeric inputs are safe integers. See `docs/quality/mission-batch-progress.md` for the execution ledger.
