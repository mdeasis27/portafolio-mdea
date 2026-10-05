import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {oneLinerProblems} from './one-liner-sync.mjs';

function workspace({hub, siblings}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'oneliner-'));
  for (const [file, text] of Object.entries(hub)) { fs.mkdirSync(path.dirname(path.join(root, 'hub', file)), {recursive: true}); fs.writeFileSync(path.join(root, 'hub', file), text); }
  for (const [slug, story] of Object.entries(siblings)) { fs.mkdirSync(path.join(root, slug, 'lib/experience'), {recursive: true}); fs.writeFileSync(path.join(root, slug, 'lib/experience/story.ts'), story); }
  return path.join(root, 'hub');
}

test('reports a hub one-liner the sibling story does not contain, and skips absent siblings', () => {
  const hub = workspace({
    hub: {
      'content/projects/en/a.mdx': '---\ntitle: A\noneLiner: A detour for outages.\n---\n',
      'content/projects/es/a.mdx': '---\ntitle: A\noneLiner: Un desvío nuevo.\n---\n',
      'content/projects/en/b.mdx': '---\ntitle: B\noneLiner: Not checked.\n---\n',
      'content/projects/en/c.mdx': '---\ntitle: C\n---\n',
    },
    siblings: {a: 'export const STORY = { en: { oneLiner: "A detour for outages." }, es: { oneLiner: "Un desvío viejo." } };', c: ''},
  });
  assert.deepEqual(oneLinerProblems(hub), ['a (es): lib/experience/story.ts has "Un desvío viejo." but the hub says "Un desvío nuevo."']);
});

test('compares the story one-liner per language exactly, after YAML folding and quote escapes', () => {
  const story = 'export const STORY = { en: { oneLiner: "Say \\"hi\\" to outages." }, es: { oneLiner: "Un desvío más largo." } };';
  const hub = workspace({
    hub: {
      'content/projects/en/a.mdx': '---\ntitle: A\noneLiner: >-\n  Say "hi" to\n  outages.\n---\n',
      'content/projects/es/a.mdx': '---\ntitle: A\noneLiner: Un desvío\n---\n',
    },
    siblings: {a: story},
  });
  assert.deepEqual(oneLinerProblems(hub), ['a (es): lib/experience/story.ts has "Un desvío más largo." but the hub says "Un desvío"']);
});
