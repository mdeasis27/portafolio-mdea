<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Brand + AI kits

This repo is the source of truth for:
- `design-system/` — visual tokens, fonts, and components distributed to sibling projects.
- `ai-kit/` — shared AI primitives (model allowlist, client, demo-mode convention).

**Before writing any new UI:** check `design-system/components/` for existing primitives and `design-system/README.md` for token usage. Do not reintroduce ad-hoc colors or radii outside the tokens.

**Before adding AI to a new feature:** read `ai-kit/README.md`. Every public-facing AI project must have a demo mode that works without API keys.
