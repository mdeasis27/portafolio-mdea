import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import ts from 'typescript';

// story.ts only has type imports besides its data, so transpiling and evaluating it yields STORY.
function loadStory(file) {
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS}}).outputText;
  const exports = {};
  new Function('exports', 'require', js)(exports, () => ({}));
  return exports.STORY;
}

/** The one-liner lives in the hub MDX and in each sibling's STORY[lang].oneLiner. Report every copy that drifted.
 *  Siblings that are not checked out next to the hub (CI) are skipped. */
export function oneLinerProblems(hubDir) {
  const problems = [];
  for (const lang of ['en', 'es']) {
    const dir = path.join(hubDir, 'content/projects', lang);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.mdx'))) {
      const hub = matter(fs.readFileSync(path.join(dir, file), 'utf8')).data.oneLiner?.trim();
      if (!hub) continue;
      const slug = file.slice(0, -4);
      const storyFile = path.join(hubDir, '..', slug, 'lib/experience/story.ts');
      if (!fs.existsSync(storyFile)) continue;
      const story = loadStory(storyFile)?.[lang]?.oneLiner?.trim();
      if (story !== hub) problems.push(`${slug} (${lang}): lib/experience/story.ts has ${JSON.stringify(story ?? null)} but the hub says ${JSON.stringify(hub)}`);
    }
  }
  return problems;
}
