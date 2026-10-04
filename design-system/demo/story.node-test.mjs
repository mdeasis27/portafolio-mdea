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
