# Recruiter-first Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the SaaS-pitch home (`/en`, `/es`) with a personal hero (name, role, value line, LinkedIn/GitHub/email) and a grid of 8 featured projects.

**Architecture:** Plain server component rewrite of `src/app/[lang]/page.tsx`. Featured slugs live in one tiny pure module (`src/lib/featured.ts`) so a node test can check them against `content/projects`. Copy comes from the existing dictionaries (`src/lib/i18n/en.ts`, `es.ts`) via new keys; contact links come from `site.author`. `ProjectCard` is reused unchanged.

**Tech Stack:** Next.js 16.2.3 (App Router, no new APIs used), React 19, Tailwind v4, `node --test` (scripts/*.test.mjs), Python Playwright for the visual check.

**Spec:** `docs/superpowers/specs/2026-10-07-recruiter-home-design.md`

## Global Constraints

- English default, Spanish equivalent; UI copy in both locales (`/en`, `/es`).
- TypeScript strict, no `any`, no `@ts-ignore`.
- Reuse design tokens and `ProjectCard`; no new colors, radii or dependencies.
- Do not touch `/about`, `/projects`, project pages, nav, footer, `design-system/`.
- `RecruiterJourney` component and its QA scripts/`docs/quality/` files stay in the repo (only the home stops using it).
- Do not rename or remove existing dictionary keys (`headline`, `intro`, `selected`, `explore`, `role` may be used elsewhere).
- Hobby Vercel limit: one branch, one PR, one preview. Never run `git push` against `main`; push with `git push origin feat/recruiter-home:feat/recruiter-home`. Manuel runs the merge.
- Commits end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`; PR body ends with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

## Review Focus

- A featured slug missing from either locale's content, or lacking `liveUrl` → card would silently disappear or lose its demo link (test pins all 8 in EN and ES).
- A dictionary key present in `en.ts` but missing in `es.ts` → blank Spanish text (test pins key parity for the new keys).
- Thumbnail file missing for a featured slug/locale → broken image on the home (test pins `public/project-captures/<slug>.stage(.es).png` exist).
- Mobile (390px) overflow or contact links pushed below the fold (Playwright check).
- Sticky nav covering the `#featured` section heading after the "See projects" anchor jump (`scroll-mt`).

---

## File Structure

- Create `src/lib/featured.ts` — the ordered list of 8 featured slugs (one responsibility, pure, importable from tests via transpile).
- Create `scripts/home.test.mjs` — content/copy/asset checks for the home.
- Modify `src/lib/site.ts` — add `author.github`.
- Modify `src/lib/i18n/en.ts`, `src/lib/i18n/es.ts` — new keys: `homeTitle`, `homeIntro`, `seeProjects`, `seeAll`, `featuredHeading`, `github`, `linkedin`.
- Modify `src/app/[lang]/page.tsx` — new hero + featured grid.
- Modify `docs/superpowers/specs/2026-10-07-recruiter-home-design.md` — grid columns wording (1 column on mobile).
- Scratch (not committed): `$TMP/home-check.py` — Playwright visual/structure check.

---

### Task 1: Featured list, copy keys and site config (test first)

**Files:**
- Create: `scripts/home.test.mjs`, `src/lib/featured.ts`
- Modify: `src/lib/site.ts`, `src/lib/i18n/en.ts`, `src/lib/i18n/es.ts`, `docs/superpowers/specs/2026-10-07-recruiter-home-design.md`

**Interfaces:**
- Produces: `featuredSlugs: readonly string[]` (exported from `src/lib/featured.ts`, 8 items, ordered); dictionary keys `homeTitle, homeIntro, seeProjects, seeAll, featuredHeading, github, linkedin` (strings, both locales); `site.author.github: string`.

- [ ] **Step 1: Write the failing test**

Create `scripts/home.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import matter from 'gray-matter';
import ts from 'typescript';

function loadTs(file){const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;const exports={};new Function('exports',js)(exports);return exports;}

const {featuredSlugs}=loadTs('src/lib/featured.ts');
const {en}=loadTs('src/lib/i18n/en.ts');
const {es}=loadTs('src/lib/i18n/es.ts');
const {site}=loadTs('src/lib/site.ts');
const NEW_KEYS=['homeTitle','homeIntro','seeProjects','seeAll','featuredHeading','github','linkedin'];

test('home features eight distinct, existing projects with live demos and thumbnails in both languages',()=>{
 assert.equal(featuredSlugs.length,8);
 assert.equal(new Set(featuredSlugs).size,8);
 for(const slug of featuredSlugs)for(const locale of ['en','es']){
  const {data}=matter(fs.readFileSync(`content/projects/${locale}/${slug}.mdx`,'utf8'));
  assert.equal(data.slug,slug);
  assert.ok(data.liveUrl,`${locale}/${slug}: liveUrl`);
  assert.ok(data.oneLiner,`${locale}/${slug}: oneLiner`);
  const img=`public/project-captures/${slug}.stage${locale==='es'?'.es':''}.png`;
  assert.ok(fs.existsSync(img),`missing ${img}`);
 }
});

test('home copy exists in both languages and is different between them',()=>{
 for(const key of NEW_KEYS){
  assert.ok(typeof en[key]==='string'&&en[key].trim(),`en.${key}`);
  assert.ok(typeof es[key]==='string'&&es[key].trim(),`es.${key}`);
 }
 assert.notEqual(en.homeTitle,es.homeTitle);
 assert.notEqual(en.homeIntro,es.homeIntro);
});

test('contact links for the hero come from site config',()=>{
 assert.match(site.author.linkedin,/^https:\/\/www\.linkedin\.com\//);
 assert.equal(site.author.github,'https://github.com/mdeasis27');
 assert.match(site.author.email,/@/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test scripts/home.test.mjs`
Expected: FAIL (cannot read `src/lib/featured.ts`: ENOENT).

- [ ] **Step 3: Implement**

Create `src/lib/featured.ts`:

```ts
// Finance and operations first, then technical credibility (spec 2026-10-07).
export const featuredSlugs = [
  'agente-cobranzas',
  'agente-riesgo',
  'kyc-antifraude',
  'identidad-360',
  'radar-proveedores',
  'destilacion',
  'evidencia',
  'compuerta',
] as const;
```

In `src/lib/site.ts`, inside `author`, after the `linkedin` line add:

```ts
    github: "https://github.com/mdeasis27",
```

In `src/lib/i18n/en.ts`, add this line right after the `headline:...` line (keep every existing key):

```ts
 homeTitle:'Finance and operations leader who builds AI.',homeIntro:'I turn business decisions into working software. 21 live demos, open source, no login.',seeProjects:'See projects',seeAll:'See all 21',featuredHeading:'Featured projects',github:'GitHub',linkedin:'LinkedIn',
```

In `src/lib/i18n/es.ts`, same position:

```ts
 homeTitle:'Líder de finanzas y operaciones que construye IA.',homeIntro:'Convierto decisiones de negocio en software que funciona. 21 demos en vivo, código abierto, sin login.',seeProjects:'Ver proyectos',seeAll:'Ver los 21',featuredHeading:'Proyectos destacados',github:'GitHub',linkedin:'LinkedIn',
```

In the spec, change "Grid: 2 columns on mobile, 4 on large screens" to "Grid: 1 column on mobile, 2 on small screens, 4 on large screens (two columns at 390px would shrink thumbnails below legibility)".

- [ ] **Step 4: Run tests and typecheck**

Run: `node --test scripts/home.test.mjs && pnpm exec tsc --noEmit`
Expected: 3 tests pass; tsc exits 0.

- [ ] **Step 5: Commit**

```bash
git add scripts/home.test.mjs src/lib/featured.ts src/lib/site.ts src/lib/i18n/en.ts src/lib/i18n/es.ts docs/superpowers/specs/2026-10-07-recruiter-home-design.md
git commit -m "feat(home): featured list, hero copy keys and github link"
```

(Append the Co-Authored-By trailer.)

---

### Task 2: Rewrite the home page

**Files:**
- Modify: `src/app/[lang]/page.tsx` (full replacement)

**Interfaces:**
- Consumes: `featuredSlugs` from `@/lib/featured`; dictionary keys from Task 1; `site.author.{linkedin,github,email}`; `getAllProjects(lang)`; `ProjectCard({project, locale})`.
- Produces: the `/[lang]` route.

- [ ] **Step 1: Check where old keys are used (read-only guard)**

Run: `grep -rn "RecruiterJourney\|recruiter-journey" src | grep -v "src/components/recruiter-journey.tsx"`
Expected: only `src/app/[lang]/page.tsx`. (If anything else appears, stop and report.)

- [ ] **Step 2: Replace `src/app/[lang]/page.tsx`**

```tsx
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ProjectCard} from '@/components/project-card';
import {isLocale} from '@/design-system/i18n/locale';
import {featuredSlugs} from '@/lib/featured';
import {dictionary} from '@/lib/i18n';
import {getAllProjects} from '@/lib/projects';
import {site} from '@/lib/site';

export default async function HomePage({params}:{params:Promise<{lang:string}>}) {
  const {lang}=await params;
  if(!isLocale(lang))notFound();
  const c=dictionary(lang);
  const projects=await getAllProjects(lang);
  const featured=featuredSlugs.map(slug=>projects.find(p=>p.frontmatter.slug===slug)).filter(p=>p!==undefined);
  const link='underline underline-offset-4 text-foreground/70 hover:text-foreground';
  return <div className="mx-auto max-w-6xl px-5 sm:px-6">
    <section className="pt-12 pb-10 sm:pt-20">
      <p className="font-mono text-xs uppercase tracking-[.2em] text-muted-foreground">{site.name}</p>
      <h1 className="mt-5 max-w-3xl text-4xl font-medium leading-[1.08] tracking-tight sm:text-6xl">{c.homeTitle}</h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">{c.homeIntro}</p>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <a href="#featured" className="inline-flex rounded-lg bg-foreground px-5 py-3 font-medium text-background">{c.seeProjects} ↓</a>
        <a href={site.author.linkedin} className={link}>{c.linkedin} ↗</a>
        <a href={site.author.github} className={link}>{c.github} ↗</a>
        <a href={'mailto:'+site.author.email} className={link}>{c.email}</a>
      </div>
    </section>
    <section id="featured" className="scroll-mt-24 py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-medium tracking-tight">{c.featuredHeading}</h2>
        <Link href={'/'+lang+'/projects'} className="text-sm text-muted-foreground">{c.seeAll} →</Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{featured.map(p=><ProjectCard key={p.frontmatter.slug} project={p} locale={lang}/>)}</div>
    </section>
  </div>;
}
```

- [ ] **Step 3: Typecheck, lint, build**

Run: `pnpm exec tsc --noEmit && pnpm lint && pnpm build`
Expected: all exit 0; build output lists `/[lang]` for `en` and `es` without errors. (Unused-export warnings for `RecruiterJourney` are not errors.)

- [ ] **Step 4: Run the whole script test suite**

Run: `pnpm test:scripts`
Expected: all tests pass, including `home.test.mjs`. If a pre-existing test fails, run it on a clean `origin/main` checkout before attributing it to this change and report.

- [ ] **Step 5: Commit**

```bash
git add "src/app/[lang]/page.tsx"
git commit -m "feat(home): personal hero and eight featured projects"
```

(Append the Co-Authored-By trailer.)

---

### Task 3: Visual and structural verification, PR

**Files:**
- Scratch only: `$TMP/home-check.py` (not committed)

- [ ] **Step 1: Write the Playwright check**

Create `$TMP/home-check.py`:

```python
import sys
from playwright.sync_api import sync_playwright
base, out = sys.argv[1], sys.argv[2]
with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in ((1440, 900), (390, 844)):
        for lang in ('en', 'es'):
            pg = b.new_page(viewport={'width': w, 'height': h})
            pg.goto(f'{base}/{lang}', wait_until='networkidle')
            assert pg.locator('h1').count() == 1, 'exactly one h1'
            for sel in ('a[href*="linkedin.com"]', 'a[href="https://github.com/mdeasis27"]', 'a[href^="mailto:"]'):
                box = pg.locator(sel).first.bounding_box()
                assert box and box['y'] + box['height'] <= h, f'{sel} below the fold at {w}'
            assert pg.locator('#featured img').count() == 8, 'eight thumbnails'
            for y in range(0, pg.evaluate('document.body.scrollHeight'), 400):
                pg.evaluate(f'window.scrollTo(0,{y})'); pg.wait_for_timeout(120)
            pg.wait_for_load_state('networkidle')
            bad = pg.evaluate("[...document.querySelectorAll('#featured img')].filter(i=>!i.complete||i.naturalWidth===0).length")
            assert bad == 0, f'{bad} broken thumbnails'
            assert pg.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'horizontal overflow'
            for gone in ('Reset route', 'Reiniciar', 'Start the route', 'Empezar el recorrido'):
                assert pg.get_by_text(gone).count() == 0, gone
            pg.evaluate('window.scrollTo(0,0)')
            pg.screenshot(path=f'{out}/home-{lang}-{w}.png', full_page=True)
            print('ok', lang, w)
    b.close()
```

- [ ] **Step 2: Run against a local production server**

Run (two commands; start the server in the background first):
`pnpm start -p 3150` (background), then `python "$TMP/home-check.py" http://localhost:3150 "$TMP"`
Expected: four `ok` lines (en/es × 1440/390). Stop the server afterwards.

- [ ] **Step 3: Look at the screenshots**

Read the four `home-*.png` files. Check that the cards are not cramped at 1440px (title, one-liner, both footer links readable) and that the hero reads as a personal intro. If cards are cramped, change the grid to `lg:grid-cols-3` is NOT allowed (breaks the 8-card symmetry); instead report with screenshots and propose a fix before changing anything.

- [ ] **Step 4: Push the branch and open the PR**

```bash
git push origin feat/recruiter-home:feat/recruiter-home
gh pr create --base main --head feat/recruiter-home --title "feat(home): recruiter-first home" --body "<summary of hero + 8 featured, spec/plan paths, screenshots note>

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

- [ ] **Step 5: Verify the preview**

Wait for the Vercel check on the PR (`gh pr checks`), find the preview URL with the Vercel MCP `list_deployments` (branch `feat/recruiter-home`), then run `python "$TMP/home-check.py" <preview-url> "$TMP"` again.
Expected: four `ok` lines. Report results and hand Manuel the merge command: `gh pr merge <n> --repo mdeasis27/portafolio-mdea --squash --delete-branch`.
