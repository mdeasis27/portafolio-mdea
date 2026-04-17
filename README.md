# Portfolio — Manuel De Asís

Personal portfolio site and design system hub. Built with Next.js 16, Tailwind CSS v4, and MDX.

## Stack

- Next.js 16 (App Router, static export)
- TypeScript
- Tailwind CSS v4
- base-ui components (base-nova theme)
- MDX for case studies (next-mdx-remote)

## Structure

```
src/app/          — pages (home, /projects, /projects/[slug], /about)
src/components/   — UI components (Nav, Footer, ProjectCard, etc.)
src/lib/          — data fetching, types, site config
content/projects/ — MDX case studies (one file per project)
design-system/    — brand tokens and documentation
```

## Adding a case study

Create `content/projects/[slug].mdx` with this frontmatter:

```yaml
---
title: "Project Name"
slug: "project-slug"
summary: "One-sentence description"
role: "Product & Engineering"
stack: ["Next.js", "TypeScript"]
status: "shipped" # shipped | beta | archived
year: 2026
publishedAt: "2026-01-01"
featured: true
repoUrl: "https://github.com/..."   # optional
liveUrl: "https://..."              # optional
---
```

## Dev

```bash
pnpm install
pnpm dev        # localhost:3000
pnpm build      # production build
pnpm lint       # ESLint
```

## Portfolio structure

This repo lives inside the meta-folder `C:/Proyectos/proyectos-portafolio/` alongside every active portfolio project. Each project is its own independent git repo and Vercel deploy.

```
proyectos-portafolio/
├── portafolio-mdea/      ← this repo (hub + design-system + ai-kit)
├── agente-riesgo/        ← consumes design-system + ai-kit via sync
└── identidad-360/        ← consumes design-system + ai-kit via sync
```

## Design system + AI kit

The hub owns two shared kits:
- `design-system/` — visual identity (always synced to every sibling).
- `ai-kit/` — AI primitives (optional — only for projects with LLMs).

Siblings run `pnpm brand:sync` (and optionally `pnpm ai:sync`) to pull updates from the hub. See `design-system/README.md` and `ai-kit/README.md` for details.

## Spec

Full system rationale: `docs/superpowers/specs/2026-04-16-mdea-brand-design-system.md`.
