import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

/** The one-liner lives in the hub MDX and in each sibling's story.ts. Report every copy that drifted.
 *  Siblings that are not checked out next to the hub (CI) are skipped. */
export function oneLinerProblems(hubDir) {
  const problems = [];
  for (const lang of ['en', 'es']) {
    const dir = path.join(hubDir, 'content/projects', lang);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.mdx'))) {
      const {oneLiner} = matter(fs.readFileSync(path.join(dir, file), 'utf8')).data;
      if (!oneLiner) continue;
      const slug = file.slice(0, -4);
      const story = path.join(hubDir, '..', slug, 'lib/experience/story.ts');
      if (!fs.existsSync(story)) continue;
      if (!fs.readFileSync(story, 'utf8').includes(oneLiner)) problems.push(`${slug} (${lang}): lib/experience/story.ts does not contain the hub oneLiner "${oneLiner}"`);
    }
  }
  return problems;
}
