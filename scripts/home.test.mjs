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

test('shared-link metadata uses the new home intro, not the retired product pitch',()=>{
 const layout=fs.readFileSync('src/app/[lang]/layout.tsx','utf8');
 assert.ok(!layout.includes('c.intro'),'layout still uses the old intro');
 assert.equal(layout.split('c.homeIntro').length-1,2,'description and openGraph.description must use c.homeIntro');
});
