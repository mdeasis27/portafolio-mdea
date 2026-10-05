# Recruiter Portfolio Experience

## Purpose and audience

Present Manuel as an AI Product professional who can turn business problems into usable software, explain product decisions, and substantiate results. The audience includes recruiters, hiring managers, and technical reviewers. Scope: the portfolio hub and all 21 projects listed in `portfolio.config.mjs`.

Success means a visitor can understand the business problem, operate the demo without credentials, change a meaningful input, observe a different computed outcome, and find the source and implementation instructions.

## Agreed requirements

- English is the default; Spanish is an equivalent supported language throughout navigation, demos, errors, case studies, and documentation.
- Public copy names capabilities and technologies, not external companies. Integration identifiers, dependency names, required endpoints, and licensing notices remain technically accurate.
- Business scenarios use anonymized or clearly fictional data and identify the target user and decision.
- Demos are interactive products. A changed input changes the computation, evidence, trace, or outcome; animated fixed responses do not meet this requirement.
- No login, paid account, API key, or database connection is required for the primary demo.
- Repository presentation includes English and Spanish READMEs, real screenshots, a cover image, working source/demo/case-study links, and verified setup commands.
- Production deployment, publication, PR merging, and secret-store writes require Manuel's confirmation.

## Experience and visual direction

The hub leads with applied AI product work and a small selection of strong examples, while keeping every project available in the catalogue. Each project presents the user, operational problem, proposed workflow, product decisions, evidence, and limitations. Keep the required five-H2 case-study structure in each language, translated consistently.

Every demo has a short business briefing, editable scenario controls, a prominent visualization, and an explanation of the result. Desktop uses a controls/visualization/details composition; mobile stacks the same content without hiding controls. Individual visualizations vary by domain rather than repeating a KPI dashboard.

Use existing shared typography, semantic color tokens, and accessible controls. Improve hierarchy, composition, and motion before adding a new visual dependency. Animate evidence flow, comparisons, changes in state, and decision paths. Support keyboard navigation and reduced motion.

Show actual execution progress where operations emit events. Very fast local algorithms can expose a computed trace with pause, replay, and playback-speed controls. Explicitly label trace playback and keep playback duration separate from execution time. Never invent model confidence, latency, savings, commercial impact, or a production benchmark.

## Languages and routing

Use explicit `/en` and `/es` paths, including localized landing pages, demos, and hub case studies. Unprefixed browser routes redirect to English and preserve their pathname, query, and hash. API endpoints and static assets retain their current paths. Do not negotiate the first visit from browser language: Manuel explicitly chose English as the default.

Follow the installed Next.js 16.2.3 internationalization guide: language-segment pages/layouts and `proxy.ts` redirects. Do not add a localization library. The locale switch retains the current page; unsaved input is either preserved through a language-neutral session snapshot or the visitor receives an explicit reset warning. Scenario identifiers and underlying calculation data do not change with language.

Place portable locale primitives in `design-system/i18n/`; keep domain dictionaries next to each project experience. Put translated hub case studies in `content/projects/en/` and `content/projects/es/`. Generate both locale/slug combinations and keep source/demo links consistent with the selected language.

## Runtime boundaries

The primary experience calls local, typed domain adapters over existing algorithms. Adapters return input-dependent results and trace events. Shared UI owns presentation, locale controls, run state, cancellation, replay, accessibility, and elapsed-time formatting. Domain modules own computation and explanations.

Live integrations remain optional and clearly separated from local simulation. Persistent history is optional: a storage outage must not discard the computed demo result. Demo storage stays session-local by default. The collections demo previews messages and never sends them or starts scheduled work. Documentation examples operate on a local text snapshot and never open external PRs.

Do not describe cached fixtures, extraction rules, or classifier heuristics as live model output. Separate simulation results, measured local algorithm results, and live-service results in the interface and documentation. Replace invented external evidence URLs with local inspectable fixture references.

## Project-specific interactions

| Project | Business user and problem | Editable interaction | Main visualization and evidence |
|---|---|---|---|
| agente-riesgo | Credit operations; inconsistent triage | Change verification/evidence signals and compare escalation policies | Evidence flow, decision branches, comparison of review queues; policy simulator, not a credit prediction |
| identidad-360 | Risk analyst; fragmented identity evidence | Enable/disable fictional sources and introduce conflicting evidence | Source-to-profile map, contradictions, risk signals; local profile synthesis |
| kyc-antifraude | Onboarding team; verification exceptions | Modify document completeness and screening flags | Verification state machine with proceed/review/reject paths; local screening simulation |
| radar-proveedores | Procurement; supplier due diligence | Change risk signals and their relevance | Evidence-to-risk map and a decision checklist; anonymous supplier scenario |
| agente-cobranzas | Collections operations; prioritization and communication | Modify delinquency days, debt in integer cents, and contact rules | Queue segmentation, proposed contact strategy, message preview; zero external sends |
| evidencia | Support/compliance; unsupported answers | Ask questions over a local editable corpus and toggle retrieval configuration | Retrieved passages, citations, rejected claims; computed lexical retrieval and grounding checks |
| grafo | Analyst; facts spread across sources | Select entities and relationship queries | Side-by-side graph and single-passage retrieval, highlighted hops and sources |
| veredicto | AI product owner; quality regression | Compare retrievers and inspect query-level results | Ranking comparisons, calibration, regression gate; corpus-size disclosure |
| doorman | Agent owner; hostile uploaded text | Edit a document and toggle tool policy | Input-to-action guard path, fired rules, blocked operations |
| asedio | AI quality/security team; regression checks | Choose attack families and vulnerable/hardened targets | Attack matrix, findings, review queue, and regression comparison |
| compuerta | Product operations; provider outages | Change outage timing, routing policy, and request mix | Request traffic over provider lanes, breaker transitions, availability comparison |
| warmstart | Support platform owner; repeated requests and cost | Edit queries, similarity floor, and prompt version | Exact/semantic/miss paths, false hits, cache invalidation; disclosed cost assumptions |
| mesa | Workflow owner; unbounded agent revisions | Change task, step budget, and reviewer rejection cap | Agent handoffs, token/step budgets, termination reason; deterministic agent proxies |
| arbitro | Operations reviewer; disagreeing model outputs | Enter candidate labels/confidence and escalation threshold | Votes, disagreement, chosen answer or human-review branch; supplied candidate outputs |
| destilacion | Document operations; extraction tradeoffs | Edit an invoice and request-volume assumptions | Field-by-field extraction and cost crossover; rule-based student proxy, no implied trained model |
| escaneo | Document operations; corrupted OCR fields | Edit OCR text and inject controlled errors | Highlighted fields, checksum validation, flagged errors; simulated OCR |
| traductor | Business analyst; access to operational data | Ask supported questions over a local seeded dataset | Question-to-template-to-validation-to-result flow; SQL results computed locally |
| ensayo | AI product owner; prompt release decisions | Change score samples and significance level | Distributions, lift, confidence interval, rollout decision; real statistical computation |
| bandera | Product operations; risky feature rollout | Change simulated quality and no-worse margin | Traffic stages, confidence intervals, hold/advance/kill decisions |
| fabrica | AI quality team; incomplete evaluation coverage | Paste anonymized logs and adjust deduplication/sample settings | Logs-to-clusters-to-eval-set flow, removed duplicates, coverage |
| vigia | Engineering team; stale documentation | Edit source/document snapshots and rename mappings | Symbol references, stale-reference highlights, proposed corrections; no external write |

## Repository presentation

Each repository includes `README.md`, `README.es.md`, `docs/images/cover.png`, and `docs/images/demo.png`. Covers use the project title, business purpose, technical stack, and a real UI capture. Generate screenshots after the interface exists; do not fabricate product images or metrics.

Both READMEs cover the problem, how to try the demo, supported inputs, architecture, actual versus simulated behavior, setup, verification, limitations, and links. Keep licenses accurate. Configuration documentation uses required environment-variable identifiers but does not suggest committing secrets or creating secret-bearing local files.

## Acceptance criteria

For every project: run two materially different inputs; verify results differ for a documented reason; reset and rerun reproducibly; confirm unsupported/empty input receives a useful response; confirm EN/ES parity; test phone-sized and desktop layouts, keyboard use, and reduced motion. The primary demo must run with no credentials and no database. Persistence failure is a warning, not a computation failure.

For the hub: confirm all 21 projects have both language case studies and correctly localized demo/source links. For repositories: reproduce setup and relevant checks in isolation, ensure image paths resolve, and verify public text against the naming policy.

## Delivery sequence

Deliver shared foundations and the risk pilot first, then the remaining projects in domain groups, then the final catalogue and repository assets. All projects are in scope; grouping controls verification and prevents propagating a defective shared component. Work locally until an explicit publication/deployment approval.
