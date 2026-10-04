import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import matter from 'gray-matter';
import ts from 'typescript';
test('business stories reject generic role, decision and scenario placeholders',()=>{
 const placeholders=/^(A business owner|Una persona responsable de negocio|Decidir con evidencia visible\.?|Reference scenario|Contrast scenario|Escenario de referencia|Escenario contrastante)$/i;
 for(const locale of ['en','es'])for(const name of fs.readdirSync(`content/projects/${locale}`).filter(file=>file.endsWith('.mdx'))){
  const {data}=matter(fs.readFileSync(`content/projects/${locale}/${name}`,'utf8'));
  const values=[data.businessRole,data.businessDecision,...data.scenarios.flatMap(scenario=>[scenario.title,scenario.input])];
  for(const value of values)assert.ok(!placeholders.test(value.trim()),`${locale}/${name}: generic placeholder ${value}`);
 }
});
test('business cases expose two usable scenarios and a concrete role and decision',()=>{
 for(const locale of ['en','es'])for(const name of fs.readdirSync(`content/projects/${locale}`).filter(file=>file.endsWith('.mdx'))){
  const {data}=matter(fs.readFileSync(`content/projects/${locale}/${name}`,'utf8'));
  for(const key of ['businessRole','businessDecision','businessValue','visualMechanism'])assert.ok(typeof data[key]==='string'&&data[key].trim(),`${locale}/${name}: ${key}`);
  assert.equal(data.scenarios.length,2);
  assert.notEqual(data.scenarios[0].input,data.scenarios[1].input);
  assert.notEqual(data.scenarios[0].observation,data.scenarios[1].observation);
 }
});
test('all 21 case studies have paired languages with equal source identity and five sections',()=>{
 const en=fs.readdirSync('content/projects/en').filter(x=>x.endsWith('.mdx')).sort();const es=fs.readdirSync('content/projects/es').filter(x=>x.endsWith('.mdx')).sort();assert.equal(en.length,21);assert.deepEqual(en,es);const slugs=new Set();
 for(const name of en){const a=matter(fs.readFileSync('content/projects/en/'+name,'utf8'));const b=matter(fs.readFileSync('content/projects/es/'+name,'utf8'));assert.equal(a.data.slug,b.data.slug);assert.equal(a.data.repoUrl,b.data.repoUrl);assert.equal(a.data.liveUrl,b.data.liveUrl);assert.deepEqual(a.data.stack,b.data.stack);assert.equal((a.content.match(/^## /gm)||[]).length,5);assert.equal((b.content.match(/^## /gm)||[]).length,5);assert.ok(a.data.summary!==b.data.summary);assert.ok(!slugs.has(a.data.slug));slugs.add(a.data.slug);}
});

function loadTs(file){const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;const exports={};new Function('exports',js)(exports);return exports;}

test('demo links keep the visitor language and drop any path on liveUrl', () => {
  const { demoHref } = loadTs('src/lib/demo-href.ts');
  assert.equal(demoHref('https://compuerta-x.vercel.app/app', 'es'), 'https://compuerta-x.vercel.app/es/app');
  assert.equal(demoHref('https://compuerta-x.vercel.app', 'en'), 'https://compuerta-x.vercel.app/en/app');
});

test('projects with a one-liner have it in both languages and a live demo', () => {
  for (const name of fs.readdirSync('content/projects/en').filter(f => f.endsWith('.mdx'))) {
    const en = matter(fs.readFileSync(`content/projects/en/${name}`, 'utf8')).data;
    const es = matter(fs.readFileSync(`content/projects/es/${name}`, 'utf8')).data;
    assert.equal(Boolean(en.oneLiner), Boolean(es.oneLiner), `${name}: oneLiner must exist in both languages`);
    if (en.oneLiner) { assert.ok(en.liveUrl && es.liveUrl, `${name}: oneLiner requires liveUrl`); assert.doesNotMatch(en.oneLiner + es.oneLiner, /—/); }
  }
  assert.ok(matter(fs.readFileSync('content/projects/en/compuerta.mdx', 'utf8')).data.oneLiner);
});
