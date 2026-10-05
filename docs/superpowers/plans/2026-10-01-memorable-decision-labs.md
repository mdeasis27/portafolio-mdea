# Memorable decision labs

Authorized scope: continue the existing 21-project implementation with substantially better business narratives and distinctive visual experiments. No publication or production deployment.

Design direction: an editorial decision laboratory. Existing fonts and semantic tokens remain consistent; each project has its own visual mechanism. The visitor takes a business role, loads a concrete scenario, changes conditions and follows actual computed events to an explained consequence. Animation reveals computation rather than pretending to be live model execution.

## Ownership and progress

- [x] Preserve all previous work, inspect repository state and create `feat/memorable-decision-labs` in all 22 repositories. See `docs/quality/decision-lab-baseline.json`.
- [x] Add shared story/preset/stage/outcome primitives and trace-driven rendering with manual forward/back controls. The new frame test was observed failing before implementation, then all four foundation tests passed. Individual shared-kit sync recorded in `decision-lab-kit-sync.json`.
- [x] Finish 7 business project scenes: evidence gates, assembled profile, onboarding lane, supplier investigation, collection timeline, citation connections, graph traversal.
- [x] Finish 7 systems project scenes: retrieval ladder/gate, document quarantine, attack-defense matrix, outage routing, cache branches, bounded agent handoffs, converging/diverging votes.
- [x] Finish 7 product project scenes: invoice/cost curve, OCR field spotlight, query/schema/results, distributions/confidence interval, staged rollout, deduplication fan-in, documentation/reference diff.
- [x] Generate 42 substantial business cases and bilingual READMEs from implemented scenario descriptions; add interactive case-study scenario previews.
- [x] Run final tests, lint, types and production builds with bounded concurrency. Older evidence must not be used to certify new changes.
- [x] Exercise every new component in Chromium with actual algorithms, both scenarios, EN/ES, manual playback, reduced motion, keyboard, mobile and no external requests. Capture current interfaces and inspect visual evidence.

## Acceptance requirements

Each project retains all supported controls, errors, cancellation, reset and stale-result guards. Presets replace full inputs; manual editing clears preset selection. SVG/CSS geometry and labels reflect the domain result. Final decisions appear only after the terminal event, including zero-result/refusal paths. No raw company examples, invented production metrics, floating-point money or credential requirements.

Project workers own separate repositories' experience sources and scenario metadata. The main agent owns the shared kit, hub, case studies, READMEs, assets and final acceptance. Independent repositories avoid overlapping writes; no separate checkout variants are created.

## Verification boundary

An earlier environment policy denied launching a background Next verification server. Do not retry that action with another tool. Browser-component checks use the real React components, algorithms, production CSS and embedded fonts, with a controlled locale fixture; they launch no Next server. They validate interactions and visual states, not route navigation. Prior route evidence belongs to the previous implementation and is explicitly separate.

Artifacts and final results are recorded under `docs/quality/decision-lab-*`. Work remains local; existing public URLs may still show the previous deployment or return 404 for the new locale routes.

Final acceptance: all 22 repositories passed four command checks (394 tests); all 21 bilingual browser components and file previews passed. See `docs/quality/decision-lab-acceptance.md`. No publication or new route-level certification.
