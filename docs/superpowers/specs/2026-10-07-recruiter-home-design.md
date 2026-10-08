# Recruiter-first home page

Date: 2026-10-07 · Scope: `portafolio-mdea` hub, route `/[lang]` (EN/ES).

## Purpose and audience

A recruiter or hiring manager should learn within about 30 seconds who Manuel is, what he does, and how to contact him, and then be able to open a project or demo without feeling assigned homework.

Success criteria:

- Name, role, value line and contact links are visible above the fold on desktop (1440px) and mobile (390px).
- Eight featured projects are visible with their new custom thumbnails.
- No guided-route widget, progress counter or empty side panel on the home.
- EN and ES are equivalent.

## Problems with the current home

- The hero reads as a SaaS pitch ("From business problem to working AI product", "Try the product thinking", "Start the route").
- The name appears only in the "MdA" logo and the footer.
- No contact or profile links above the fold, even though `site.ts` already holds LinkedIn and email.
- `RecruiterJourney` ("0/3 marked reviewed", "Mark this case reviewed", "Reset route") behaves like homework.
- Only three featured projects.

## Decisions (agreed with Manuel, 2026-10-07)

| Topic | Decision |
|---|---|
| Role angle | Finance and operations leader who builds AI (the angle already stated in `site.thesis.subhead`). |
| Extra personal elements | GitHub link only. No photo, no CV download, no availability line. |
| Layout | A: typographic hero + grid of featured projects. |
| Featured count | Eight. |

## Design

### Hero

- Eyebrow: `MANUEL DE ASÍS`.
- H1 EN: "Finance and operations leader who builds AI." ES: "Líder de finanzas y operaciones que construye IA."
- Value line EN: "I turn business decisions into working software. 21 live demos, open source, no login." ES: "Convierto decisiones de negocio en software que funciona. 21 demos en vivo, código abierto, sin login."
- Primary button "See projects" / "Ver proyectos" (anchors to the featured section). Secondary text links: LinkedIn, GitHub, email.
- Contact URLs come from `site.author`. Add `github: "https://github.com/mdeasis27"` to `src/lib/site.ts`.
- Keep the existing dark style, typography tokens, nav and footer.

### Featured projects

- Grid: 2 columns on mobile, 4 on large screens; reuses `ProjectCard` (thumbnail, title, one-liner).
- Heading from the dictionary, plus a link "See all 21 →" to `/[lang]/projects`.
- Order, finance and operations first, then technical credibility:
  1. agente-cobranzas
  2. agente-riesgo
  3. kyc-antifraude
  4. identidad-360
  5. radar-proveedores
  6. destilacion
  7. evidencia
  8. compuerta
- **Deviation from the chat selection:** `mesa` was proposed, but its content is "Bounded agent workflow" (agents with a step budget), not finance. It is replaced by `destilacion` (rent-or-buy, a financial decision, already featured today). Manuel can veto this in spec review.

### Removed from the home

- `RecruiterJourney` usage, the "Try the product thinking" panel and the `demos` map in `page.tsx`.
- The component file and its QA tooling stay untouched: five scripts under `scripts/` and files under `docs/quality/` reference it. Deleting it is a separate cleanup.

### Files

- `src/app/[lang]/page.tsx`: rewrite (hero + featured grid).
- `src/lib/i18n/en.ts`, `es.ts`: new keys for the hero copy and CTAs; update `selected` heading. Keys used elsewhere are not renamed.
- `src/lib/site.ts`: add `author.github`.
- Out of scope: `/about`, `/projects`, project pages, nav, footer, design-system.

### Accessibility and responsiveness

- Exactly one `<h1>`. Links are real `<a>`/`Link` elements with visible focus. Thumbnails keep the alt text `ProjectCard` already provides.
- Layout works at 390px with no horizontal scroll and 16px+ side gutters.

## Verification

- `pnpm build`, existing unit tests and `pnpm` lint/typecheck pass (no `any`, strict TS).
- Playwright against the preview deployment, EN and ES, at 1440px and 390px: one H1, name/role/links above the fold, 8 cards with loaded images (naturalWidth > 0), no horizontal overflow, all links return 2xx or are valid `mailto:`.
- Screenshots of each viewport attached to the PR.
- One branch, one PR, one Vercel preview (Hobby build limit). Manuel runs the merge.

## Risks

- Copy is written in first person from Manuel's perspective and the headline makes a claim about his background; it comes from `site.thesis.subhead`, which he wrote.
- `ProjectCard` may render long one-liners unevenly in a 4-column grid; adjust with line clamping in the grid only if it shows in screenshots.
