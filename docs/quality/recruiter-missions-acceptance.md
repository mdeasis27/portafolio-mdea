# Guided recruiter missions — scoped acceptance

The approved first stage is implemented in the portfolio hub, Evidencia, Compuerta and Destilación. The other 18 projects retain their existing decision labs.

## Experience

- The hub provides a suggested two-minute route through trust, continuity and economics. Progress is explicitly marked by the visitor and remains in the page only.
- Evidencia offers a partial-evidence challenge and computes strict/flexible coverage on the same question and corpus. Neither policy is presented as semantic proof.
- Compuerta asks whether the selected configuration completes at least 24 of 30 requests. It computes backup on/off under the selected outage, circuit breaker and seed, disclosing that routes consume the seeded error sequence differently.
- Destilación compares actual integer-cent costs at the selected volume. Exact equality is represented in both the adapter result and UI; 300,000 requests yield $1,800 for each option under the illustrative assumptions.
- Predictions are optional, locked after execution, and cleared with results by input edits, presets and reset. Comparisons appear only at completed playback. Reduced motion reveals completed computation directly.
- Introductions are shorter; comparisons stack on mobile. Diagrams preserve readable labels inside keyboard-focusable scroll regions with mobile hints. Engineering notes explain implementation, tradeoffs and work before production.
- English remains the default. Spanish content and visible language navigation are available; switching language resets the scenario.

## Executed evidence

- **96 tests passed** across the four repositories; six new mission tests include same-input counterfactuals, cancellation and exact equality. The equality regression was observed failing before its fix.
- **16 command checks passed:** each repository's complete test suite, lint, strict TypeScript check and production build. The final hub lint has no errors or warnings; framework metadata warnings remain in build logs.
- **8 browser component checks passed:** all three missions and the hub journey in English and Spanish, using actual React components and production CSS. Checks cover prediction, computed comparisons, no early comparison, input/preset invalidation, keyboard, reduced motion, locale links and mobile text/overflow.
- **6 local file journeys passed:** the guide opened each of the three real local demos in both languages, preserved locale and calculated the challenge comparison without external requests or browser errors.
- The existing local gallery's **21 previews** still computed results in both languages without external requests or browser errors.
- **20 PNG evidence assets** have recorded dimensions and SHA-256 hashes. Canonical captures and bilingual documentation were refreshed for the three projects; the hub uses actual comparison captures in its recruiter journey.
- Repeating mission documentation generation left all **12 bilingual case/readme files unchanged**. Case studies retain their five-section structure and paired identities.
- Independent read-only review identified equality-contract and language-navigation defects; both were fixed and checked. The switch's accessible name was also localized in the page language.

See [machine-readable acceptance](recruiter-missions-acceptance.json), [browser checks](recruiter-missions-browser.json) and [local file checks](recruiter-missions-local-preview.json). Each affected repository also has `docs/quality/recruiter-missions-verification.json` and four command logs. Previous acceptance reports describe their own phases and are not relabeled as current evidence.

## Local review

The generated guide is `docs/quality/.component-labs/recruiter-journey/preview.html`. Open it directly from the filesystem. Its demo buttons use local review navigation; case-study links still target their normal paths. Generate the guide with `python scripts/check-recruiter-missions.py` after building the four repositories and generating the three project previews with `python scripts/check-component-labs.py evidencia compuerta destilacion`. The generated directory is intentionally ignored in Git.

## Verification boundary

Browser checks use controlled navigation and embedded captured assets. They do **not** certify actual Next HTTP routes, image optimization responses, the complete rendered homepage or public deployment. Previously denied server/cache actions were not retried or bypassed. Publication, push and deployment remain pending; public links point to the existing versions.

All four repositories remain on `feat/guided-recruiter-missions`; earlier uncommitted work is preserved. No secrets, dependencies, commits, pushes or publication were introduced by this phase.
