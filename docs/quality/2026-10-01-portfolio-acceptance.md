# Portfolio implementation acceptance — 2026-10-01

The hub and all 21 projects now provide a consistent applied AI Product portfolio: editable local demonstrations, inspectable domain decisions and traces, English by default, Spanish equivalents, paired case studies and repository documentation, and screenshots of the actual interfaces. Work remains local and unpublished.

## Executable evidence

- 375 TypeScript/Node tests passed across 22 repositories; 11 additional canonical Python backend tests passed (Grafo 6, Evidencia 5). Total: 386 distinct passing tests, excluding repeated verification runs.
- Tests, lint, TypeScript and production builds all exited 0 in all 22 repositories. Some existing lint warnings remain. The hub build emits three `metadataBase` fallback warnings; actual locale pages have canonical absolute social-image URLs, checked in the browser.
- Actual `pnpm install --frozen-lockfile` and post-install tests passed in all 22 existing checkouts. Dependency manifests match their lockfiles. This is not evidence of an empty-clone installation. Package-manager warnings about ignored dependency build scripts were retained without approving or bypassing them.
- All 21 primary demos passed English/Spanish browser runs, input-change invalidation, reset, cancellation, keyboard navigation, 390px mobile layouts, reduced-motion playback, storage-unavailable language switching, legacy redirects, unsupported locale handling, and checks that no external/API requests were attempted.
- The hub passed both-language navigation, three catalogue filter checks, 21 image URL checks, canonical social-image URLs, legacy redirects with query retention, localized missing-case handling and mobile checks.
- All 21 entry pages passed in both languages. Complete entry/secondary route audits passed for 20 repositories. KYC's additional admin page overflowed at 390px; its metrics grid was corrected and lint, TypeScript and production build passed. The post-fix browser recheck remains pending because the environment denied the background server launch. The original failing screenshot/result is retained rather than presented as a passing check.
- Paired READMEs and actual desktop, Spanish and mobile screenshots exist in all 22 repositories. The hub contains 42 case studies and 21 real project cover images.

| Repository | Passing tests | Test / lint / types / build exits |
| --- | ---: | --- |
| portafolio-mdea | 8 | 0 / 0 / 0 / 0 |
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
| evidencia | 16 + 5 Python | 0 / 0 / 0 / 0 |
| fabrica | 8 | 0 / 0 / 0 / 0 |
| grafo | 50 + 6 Python | 0 / 0 / 0 / 0 |
| identidad-360 | 16 | 0 / 0 / 0 / 0 |
| kyc-antifraude | 3 | 0 / 0 / 0 / 0 |
| mesa | 40 | 0 / 0 / 0 / 0 |
| radar-proveedores | 3 | 0 / 0 / 0 / 0 |
| traductor | 44 | 0 / 0 / 0 / 0 |
| veredicto | 32 | 0 / 0 / 0 / 0 |
| vigia | 7 | 0 / 0 / 0 / 0 |
| warmstart | 13 | 0 / 0 / 0 / 0 |

## Evidence files

- [Command and repository checks](final-acceptance.json), collected by `scripts/collect-acceptance.py`.
- [All 21 primary browser reports](browser-acceptance.json), with individual reports in each repository.
- [Entry and secondary route audit](entry-route-acceptance.json), including the explicitly pending KYC follow-up.
- [Hub browser report](hub-browser-acceptance.json).
- [Public links](public-links.json) and [authenticated source visibility](source-visibility.json).
- Each repository's `docs/quality/final-verification.json`, command logs, `setup-install.json`, `setup-test.log`, and `implementation-evidence.md` index. Grafo and Evidencia also have `backend-verification.json`.

## Implementation decisions and limits

Adapters reuse existing domain algorithms. Where the original project only had remote integrations, local policies or seeded simulations are clearly labeled. Primary demos do not send messages, perform paid checks, write source files or create external pull requests. Supplied confidence and heuristic scores are not presented as calibrated probabilities. Monetary calculations use integer cents with visible assumptions.

The shared hook aborts cancelled/replaced runs and rejects stale callbacks and results. Trace playback reveals already computed steps; measured execution time is recorded separately. Reduced motion reveals completed steps without animation. Locale switches explicitly warn that scenario state resets.

To avoid unnecessary modules, some project copy, types and visualizations remain alongside their adapter or experience component. Business projects retain existing layout boundaries with locale-aware headers; their rendered HTML language was browser-checked. Fonts are bundled with their required license notices. Technical integration identifiers and licenses are preserved; public employer/customer references and real-company examples were anonymized.

Initial shared locale/cancellation tests were observed failing before implementation. Later suites verify final behavior; a red-first history for every project is not claimed. No secrets were read, created, or moved. A cache-deletion attempt and the final KYC browser server launch were denied; neither was retried through an alternative tool.

## Publication status

No commits, pushes, merges, deployments, repository visibility changes or secret-store writes were performed. All 22 repositories remain on `feat/recruiter-portfolio-experience`, preserving earlier work.

The new public `/en/app` demo URLs currently return 404 because the redesign is not deployed. Twelve project source links are anonymously accessible; nine repositories are confirmed private: agente-cobranzas, agente-riesgo, doorman, evidencia, identidad-360, kyc-antifraude, radar-proveedores, veredicto and warmstart. Recruiters will need deployed versions and approved repository visibility changes before these links are shareable.

The hub preview runs at `http://localhost:3100/en` and `/es` while this local server remains running. Production deployment and publication require Manuel's separate confirmation.
