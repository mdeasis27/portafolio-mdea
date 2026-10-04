import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
function load(file) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const exports = {};
  new Function('exports', 'require', js)(exports, require);
  return exports;
}

test('tape marks primary as served, other providers as rerouted, null as lost, unrevealed as pending', () => {
  const { tapeCells, tapeCounts } = load('./outcome-tape.ts');
  const cells = tapeCells(['primary', 'backup', null, 'primary'], 'primary', 3);
  assert.deepEqual(cells, ['served', 'rerouted', 'lost', 'pending']);
  assert.deepEqual(tapeCounts(cells), { served: 1, rerouted: 1, lost: 1, pending: 1 });
});

test('tape reveals up to the tick of the current breaker event', () => {
  const { revealedTicks } = load('./outcome-tape.ts');
  const frame = { total: 3, complete: false, event: { evidenceIds: ['primary', 'tick:9'] } };
  assert.equal(revealedTicks(frame, 30), 10);
});

test('tape is fully revealed when playback is complete, when the trace is empty, or under reduced motion', () => {
  const { revealedTicks } = load('./outcome-tape.ts');
  assert.equal(revealedTicks({ total: 3, complete: true, event: { evidenceIds: ['tick:9'] } }, 30), 30);
  assert.equal(revealedTicks({ total: 0, complete: false }, 30), 30);
  assert.equal(revealedTicks({ total: 3, complete: false, event: { evidenceIds: ['tick:2'] } }, 30, true), 30);
});

test('tape reveals nothing when the event carries no tick', () => {
  const { revealedTicks } = load('./outcome-tape.ts');
  assert.equal(revealedTicks({ total: 2, complete: false, event: { evidenceIds: ['primary'] } }, 30), 0);
});

const { renderToStaticMarkup } = require('react-dom/server');
const { createElement: h } = require('react');

test('why-I-built-it renders nothing until Manuel provides the text', () => {
  const { WhyIBuiltIt } = load('./project-story.tsx');
  assert.equal(renderToStaticMarkup(h(WhyIBuiltIt, { title: 'Why', text: '   ' })), '');
  assert.match(renderToStaticMarkup(h(WhyIBuiltIt, { title: 'Why', text: 'Real note' })), /Real note/);
});

test('story sections are numbered with two digits and highlight one word', () => {
  const { StorySection } = load('./project-story.tsx');
  const html = renderToStaticMarkup(h(StorySection, { index: 2, heading: { before: 'Try', accent: 'it' } }));
  assert.match(html, />02</);
  assert.match(html, /class="text-accent">it</);
});

test('outcome tape exposes one cell per request with its status and a legend', () => {
  const { OutcomeTape } = load('./project-story.tsx');
  const html = renderToStaticMarkup(h(OutcomeTape, { cells: ['served', 'rerouted', 'lost', 'pending'], labels: { served: 'served', rerouted: 'rerouted', lost: 'lost' }, ariaLabel: 'Requests' }));
  assert.equal((html.match(/data-tape-cell=/g) ?? []).length, 4);
  assert.match(html, /data-tape-cell="lost"/);
  assert.match(html, /aria-label="Requests"/);
  assert.match(html, />rerouted</);
});

test('engineer notes are a native collapsed disclosure', () => {
  const { EngineerNotes } = load('./project-story.tsx');
  const html = renderToStaticMarkup(h(EngineerNotes, { summary: 'For engineers', children: 'x' }));
  assert.match(html, /^<details[^>]*><summary[^>]*>For engineers<\/summary>/);
  assert.doesNotMatch(html, /<details[^>]*open/);
});

test('analogy dictionary renders every term with its meaning', () => {
  const { AnalogyBlock } = load('./project-story.tsx');
  const html = renderToStaticMarkup(h(AnalogyBlock, { paragraphs: ['p'], dictionaryLabel: 'In the diagram', dictionary: [{ term: 'the highway', means: 'the main provider' }, { term: 'the crash', means: 'the outage' }] }));
  assert.equal((html.match(/<dt/g) ?? []).length, 2);
  assert.match(html, /the main provider/);
});
