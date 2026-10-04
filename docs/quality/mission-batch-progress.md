# Execution ledger — 2026-10-02-next-mission-batch

Manuel approved implementation of Veredicto, Mesa and Doorman in this session. Git state, recent commits and worktrees were inspected; all four repositories now use `feat/evaluation-agent-policy-missions`. Existing changes are retained. No shared interfaces between project wrappers; shared UI components are copied only to the three owned projects.

Ruling: Continue in the existing dirty worktrees with sequential writes — their uncommitted implementation is required context and must be preserved. No cleanup, commit or blanket synchronization.

Ruling: Manual visual acceptance belongs to the previous pilot only. New batch browser/capture/HTTP verification remains pending under existing denials.

- Wrapper regression tests failed on missing mission modules, then 13 tests passed after implementation. Six initial bilingual markup checks passed.
- Independent review found unscored retrieval being treated as approval, premature Doorman policy styling, untranslated presets and unsafe numeric inputs. New regressions failed for unscored retrieval/numeric domains and pre-decision scene rendering, then passed after corrections.

Ruling: Retain regression detection unchanged but require the existing recall >=0.5 quality condition and relevant labels for the mission gate — equal failures cannot approve search. Questions without relevant labels are explicitly unscored, with their own trace and UI outcome.

Ruling: Localize preset data for each locale while keeping text identical between compared paths within that run — semantic translations may trigger different lexical rules, so equivalent business consequences are checked rather than claiming identical rule counts across languages.

Ruling: Preserve Mesa's existing pre-step budget checking and disclose token overrun possibility — no graph-accounting redesign was authorized or required for this mission.

Task 1: complete — selected/BM25 comparison, scored/unscored quality gate, display translations and regression checks.
Task 2: complete — step-cap comparison with fixed task/token/review inputs, budget ledger and disclosed pre-step limitation.
Task 3: complete — identical-document policy comparison, classification/authorization separation, localized presets and no invented operation when only a classification rule fires.

Final executable verification: 109 tests and 16 commands pass across the four repositories; six initial EN/ES renders and two Doorman sequence renders pass. Shared kit copies match; generated preview scripts parse; 12 documentation files are idempotent. New owner visual review, browser/captures and HTTP verification remain pending. No publish/push/merge/deploy or secret access occurred.
