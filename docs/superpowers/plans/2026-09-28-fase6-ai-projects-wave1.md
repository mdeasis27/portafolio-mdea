# Fase 6 — AI Engineering Projects, Wave 1

> Source material: `BASWE_15_AI_Engineering_Projects_Guide.pdf`,
> `BASWE_Build_These_Six_Projects.pdf`, `baswe-six-project-build-guide.pdf`
> (27 project framings → 10 underlying skills). Consolidated into 4 buildable,
> portfolio-relevant projects.

## Decisions (locked with Manuel)

- **Architecture: hybrid.** Each project is one repo containing:
  - a **Next.js app** (public face, Vercel) with the shared `design-system/` + `ai-kit/`,
    shipped with a **demo mode that runs offline with no API keys** (mandatory per
    `ai-kit/README.md`), plus an optional BYOK live path;
  - a **real backend** in the same repo (`backend/`, Python/FastAPI or equivalent),
    with its own test suite, not deployed, linked from the case study.
- **Scope: Wave 1 first** (the 4 projects below). Wave 2 (`Mesa`, `Destilación`) later.
- Every project must produce the three things the PDFs require: **a number, an eval,
  and a tradeoff you can defend out loud.** README opens with the result.

## Why these four (relevance to the fintech/risk narrative)

| # | Project | Skill | Fits portfolio because |
|---|---|---|---|
| 1 | **Veredicto** | evals / judge calibration | Makes the existing 5 decision systems measurable. Foundational — the PDFs say start here. |
| 2 | **Evidencia** | hybrid retrieval + verified citations | Extends identidad-360 / kyc / radar: every claim must cite a real chunk. |
| 3 | **Doorman** | prompt-injection guardrails | KYC reads documents written by the candidate — hostile input is the real threat model. |
| 4 | **Warmstart** | semantic + exact + prefix caching | Cost/latency story every LLM product team needs; senior-level unit economics. |

Wave 2: **Mesa** (multi-agent orchestration with durable state, budget ceiling, trace) and
**Destilación** (LoRA adapter + break-even volume).

## Shared project template

```
<project>/
  README.md              # result-first: number, benchmark table, tradeoffs, "what didn't work"
  package.json           # Next.js app; scripts: dev, build, lint, test, brand:sync, ai:sync
  app/                   # landing (/) + demo (/app) + api routes
  components/            # project-specific UI built from design-system primitives
  lib/                   # deterministic, tested core used by demo mode
  design-system/         # synced from the hub
  ai-kit/                # synced from the hub
  backend/               # real implementation + tests (pytest / uvicorn), not deployed
    pyproject.toml
    src/<pkg>/
    tests/
  docs/                  # architecture + ADRs
```

Conventions:
- **Demo mode** uses a committed dataset + deterministic scorers, so the dashboard
  computes **real** numbers offline. Live mode is BYOK via `ai-kit`.
- Kanban of truth: `pnpm test` (vitest) for the TS core, `uv run pytest` for the backend.
- Case study in the hub follows the mandatory 5-H2 structure.

## Sequencing

Build 1 → 2 → 3 → 4, one at a time, **done when**: demo deployed, tests green
(TS + Python), README result-first, hub case study written.
