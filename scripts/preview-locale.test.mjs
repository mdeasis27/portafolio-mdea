import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('local preview changes language after a hash change and preserves it in project links', () => {
  const html = fs.readFileSync(new URL('./build-mission-previews.mjs', import.meta.url), 'utf8');
  const footer = html.match(/const footer = String.raw`<script>([\s\S]*?)<\/script>`/)[1];
  const events = {}; const mounted = [];
  const project = {href: '../mesa/preview.html', getAttribute() { return this.href; }, setAttribute(name,value) { this[name] = value; }};
  const document = {documentElement:{lang:'en'},addEventListener(){},querySelectorAll(selector){return selector === '[data-preview-project]' ? [project] : [];}};
  const location = {hash:'#en'};
  const context = {document,location,mountPortfolioDemo:locale=>mounted.push(locale),addEventListener:(name,handler)=>{events[name]=handler;}};
  context.window = context;
  vm.runInNewContext(footer, context);
  assert.equal(typeof events.hashchange, 'function');
  location.hash = '#es'; events.hashchange();
  assert.equal(mounted.at(-1), 'es');
  assert.equal(project.href, '../mesa/preview.html#es');
  assert.match(html, />Español</);
});
