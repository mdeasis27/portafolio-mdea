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

## Project branches

Each project lives in its own branch for isolated development:

```bash
# Create new project from template
git checkout -b project/name project/template
git worktree add ../mdea-name project/name
```

See `design-system/README.md` for brand token usage and update workflow.
