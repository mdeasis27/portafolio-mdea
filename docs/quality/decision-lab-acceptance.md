# Decision lab implementation acceptance — 2026-10-01

All 21 projects now have a distinct interactive decision scene, a specific business role and consequence, two contrasting input presets, manual inputs and English/Spanish explanations. The hub has 42 matching case studies, scenario previews and current scene thumbnails. Bilingual project READMEs show both actual scenario captures. Work remains local on `feat/memorable-decision-labs`; nothing was published or deployed.

## Executable evidence

- 394 fresh TypeScript/Node tests passed across all 22 repositories. This count excludes repeated runs and prior Python-only verification.
- All 88 recorded test, lint, TypeScript and production-build commands exited 0. Source corrections were checked again before acceptance.
- Every primary React component passed two locales and two distinct scenario computations in Chromium. The checks cover stage progression, terminal outcomes, changed-input invalidation, full-input preset restoration, reset, cancel-control presence, keyboard focus, 390px layout overflow, reduced motion and zero external/API requests. Six editable product demos additionally exercise localized validation errors.
- The generated file-based review gallery opened all 21 actual components, computed results in both locales and made no external requests. It also supports a localized catalogue and locale-preserving preview links.
- All 22 branches and `git diff --check` passed inspection. The 42 case studies are stable on repeated generation. Content tests reject generic role/decision/scenario placeholders.
- 168 canonical PNG assets were verified by signature, dimensions and SHA-256. Eight captures per project include English/Spanish screens, mobile, cover and both scenario stages. The hub also holds full and stage captures in both languages. Generated diagnostic captures and component bundles are ignored; canonical evidence is retained.
- Reviewed scenes include the invoice/cost intersection, passage connections, graph hops, ballots, relevance needle and catalogue. Final gates/results are withheld until their computed event; unrevealed values use neutral placeholders.

The full machine-readable record is [decision-lab-acceptance.json](decision-lab-acceptance.json). Per-repository command logs are `docs/quality/decision-lab-{test,lint,types,build}.log`; command summaries and component browser reports are alongside them. Consolidated records are [commands](decision-lab-commands.json), [components](decision-lab-browser.json), [file previews](decision-lab-local-preview.json) and [content idempotence](decision-lab-content-idempotence.json).

## How to review locally

Open [the decision lab gallery](.component-labs/index.html) directly in a browser. It is generated, ignored local review material: real components and local algorithms with controlled navigation, no Next server. Choose EN/ES, open a project, compare its two presets, edit inputs and use the trace player. It does not require credentials.

To regenerate: build each project, run `python scripts/check-component-labs.py`, then `node scripts/promote-decision-labs.mjs`, `python scripts/check-local-lab-index.py` and `python scripts/audit-decision-labs.py`. Browser automation uses the installed Playwright package and Chromium; bundling uses the installed Next webpack and TypeScript APIs.

## Verification boundary

An earlier automatic policy review denied launching a background Next verification server. That action was not retried. These new checks launch no Next server and **do not certify Next route navigation, secondary routes or a production deployment**. They use actual React components, production CSS and embedded fonts with a controlled locale fixture. Existing public links point at the existing deployments; this implementation is unpublished.

The [previous route-level acceptance](2026-10-01-portfolio-acceptance.md) remains a separate baseline. Its route checks, 11 Python checks and unresolved post-fix KYC admin browser check were not relabeled as fresh evidence for this phase. Existing framework/lint warnings remain in their logs; exit zero is not a warning-free claim.

Animation reveals already-computed local events. Execution duration is measured locally; proxy/model traffic and latency are disclosed simulations. Price curves use stated assumptions, never live provider pricing or claimed production savings. No messages are sent, files rewritten or external actions performed by primary demos. Graph examples use anonymous display names; necessary technical entity and document IDs remain consistent.

## Distinct visual mechanisms

| Project | Inspectable mechanism |
| --- | --- |
| agente-cobranzas | Account aging, policy boundary and unsent contact preview |
| agente-riesgo | Verification, evidence and policy gates |
| arbitro | Candidate ballots, consensus and review escalation |
| asedio | Attack-family matrix with progressive test outcomes |
| bandera | Staged traffic and a stop condition |
| compuerta | Primary/fallback route following actual breaker events |
| destilacion | Extracted invoice and demand/cost intersection |
| doorman | Document quarantine, fired rules and local action decision |
| ensayo | Sample means, confidence interval and release gate |
| escaneo | OCR field spotlight and checksum review |
| evidencia | Literal question matches connected to inspectable cited passages |
| fabrica | Log fan-in, deduplication, coverage and selected queries |
| grafo | Actual ontology hops and a single-passage comparison |
| identidad-360 | Profile assembly, source coverage and contradiction |
| kyc-antifraude | Document/screening lane and onboarding exit |
| mesa | Measured local handoff sequence, budget and termination |
| radar-proveedores | Data-driven relevance needle and investigation tasks |
| traductor | Question, supported template/schema, rows or refusal |
| veredicto | Ranked local passages and regression gate |
| vigia | Source/documentation references and a reviewable proposed diff |
| warmstart | Exact/semantic/miss branches, version invalidations and assumed costs |

## Command results

| Repository | Passing tests | Test / lint / types / build exits |
| --- | ---: | --- |
| portafolio-mdea | 22 | 0 / 0 / 0 / 0 |
| agente-cobranzas | 3 | 0 / 0 / 0 / 0 |
| agente-riesgo | 4 | 0 / 0 / 0 / 0 |
| arbitro | 12 | 0 / 0 / 0 / 0 |
| asedio | 23 | 0 / 0 / 0 / 0 |
| bandera | 9 | 0 / 0 / 0 / 0 |
| compuerta | 29 | 0 / 0 / 0 / 0 |
| destilacion | 21 | 0 / 0 / 0 / 0 |
| doorman | 8 | 0 / 0 / 0 / 0 |
| ensayo | 14 | 0 / 0 / 0 / 0 |
| escaneo | 12 | 0 / 0 / 0 / 0 |
| evidencia | 18 | 0 / 0 / 0 / 0 |
| fabrica | 8 | 0 / 0 / 0 / 0 |
| grafo | 51 | 0 / 0 / 0 / 0 |
| identidad-360 | 18 | 0 / 0 / 0 / 0 |
| kyc-antifraude | 3 | 0 / 0 / 0 / 0 |
| mesa | 40 | 0 / 0 / 0 / 0 |
| radar-proveedores | 3 | 0 / 0 / 0 / 0 |
| traductor | 44 | 0 / 0 / 0 / 0 |
| veredicto | 32 | 0 / 0 / 0 / 0 |
| vigia | 7 | 0 / 0 / 0 / 0 |
| warmstart | 13 | 0 / 0 / 0 / 0 |
