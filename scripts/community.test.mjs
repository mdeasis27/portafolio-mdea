import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execSync} from 'node:child_process';
import {applyCommunityKit, assertClean} from './lib/community.mjs';

function tmp(){return fs.mkdtempSync(path.join(os.tmpdir(),'community-'));}
function write(root,rel,content){const p=path.join(root,rel);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,content);}
function read(root,rel){return fs.readFileSync(path.join(root,rel),'utf8');}
function makeKit(){const k=tmp();
 write(k,'LICENSE','MIT {{name}}\n');
 write(k,'.github/workflows/ci.yml','steps:\n  - run: pnpm lint\n  - run: pnpm test # if-test\n  - run: pnpm build\n');
 return k;}
function makeRepo({pkg={name:'demo',private:true,scripts:{lint:'x',test:'y',build:'z'}},readme='# Demo\n\n[Español](README.es.md)\n\nBody.\n',readmeEs='# Demo\n\n[English](README.md)\n\nCuerpo.\n'}={}){const r=tmp();
 write(r,'package.json',JSON.stringify(pkg,null,2)+'\n');
 if(readme!==null)write(r,'README.md',readme);
 if(readmeEs!==null)write(r,'README.es.md',readmeEs);
 return r;}
const snapshot=root=>{const out={};const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);e.isDirectory()?walk(p):out[path.relative(root,p)]=fs.readFileSync(p,'utf8');}};walk(root);return out;};

test('renders kit files with the repo name and adds the license to package.json after private',()=>{
 const kit=makeKit(),repo=makeRepo();
 const written=applyCommunityKit({kitDir:kit,targetDir:repo,name:'bandera'});
 assert.equal(read(repo,'LICENSE'),'MIT bandera\n');
 assert.ok(written.includes('LICENSE')&&written.includes('.github/workflows/ci.yml')&&written.includes('package.json'));
 const pkg=JSON.parse(read(repo,'package.json'));
 assert.equal(pkg.license,'MIT');
 assert.deepEqual(Object.keys(pkg),['name','private','license','scripts']);
 assert.ok(read(repo,'package.json').endsWith('}\n'));
});

test('CI test step exists only when the repo defines a test script',()=>{
 const kit=makeKit();
 const withTest=makeRepo(),noTest=makeRepo({pkg:{name:'a',private:true,scripts:{lint:'x',build:'z'}}}),noScripts=makeRepo({pkg:{name:'b'}});
 for(const r of [withTest,noTest,noScripts])applyCommunityKit({kitDir:kit,targetDir:r,name:'x'});
 assert.match(read(withTest,'.github/workflows/ci.yml'),/- run: pnpm test\n/);
 assert.doesNotMatch(read(withTest,'.github/workflows/ci.yml'),/if-test/);
 assert.doesNotMatch(read(noTest,'.github/workflows/ci.yml'),/pnpm test/);
 assert.doesNotMatch(read(noScripts,'.github/workflows/ci.yml'),/pnpm test/);
});

test('READMEs get badges under the title and a localized section, exactly once',()=>{
 const kit=makeKit(),repo=makeRepo();
 applyCommunityKit({kitDir:kit,targetDir:repo,name:'bandera'});
 const en=read(repo,'README.md'),es=read(repo,'README.es.md');
 assert.match(en,/^# Demo\n\n<!-- community-badges -->\n.*actions\/workflows\/ci\.yml\/badge\.svg.*License-MIT.*\n<!-- \/community-badges -->\n\n\[Español\]/s);
 assert.match(en,/## License and contributing/);
 assert.match(es,/## Licencia y contribución/);
 assert.equal(en.split('community-badges -->').length-1,2);
 assert.equal(en.split('<!-- community-section -->').length-1,1);
});

test('a second run changes nothing, including READMEs with CRLF line endings',()=>{
 const kit=makeKit(),repo=makeRepo({readme:'# Demo\r\n\r\n[Español](README.es.md)\r\n\r\nBody.\r\n'});
 applyCommunityKit({kitDir:kit,targetDir:repo,name:'bandera'});
 const before=snapshot(repo);
 const again=applyCommunityKit({kitDir:kit,targetDir:repo,name:'bandera'});
 assert.deepEqual(again,[]);
 assert.deepEqual(snapshot(repo),before);
});

test('package.json that already says MIT is left untouched byte for byte',()=>{
 const kit=makeKit();
 const raw='{\r\n  "name": "x",\r\n  "license": "MIT"\r\n}\r\n';
 const repo=makeRepo();write(repo,'package.json',raw);
 const written=applyCommunityKit({kitDir:kit,targetDir:repo,name:'x'});
 assert.equal(read(repo,'package.json'),raw);
 assert.ok(!written.includes('package.json'));
});

test('a missing README.es.md does not stop the other files',()=>{
 const kit=makeKit(),repo=makeRepo({readmeEs:null});
 applyCommunityKit({kitDir:kit,targetDir:repo,name:'x'});
 assert.ok(fs.existsSync(path.join(repo,'LICENSE')));
 assert.ok(!fs.existsSync(path.join(repo,'README.es.md')));
});

test('dry run reports changes but writes nothing',()=>{
 const kit=makeKit(),repo=makeRepo();const before=snapshot(repo);
 const written=applyCommunityKit({kitDir:kit,targetDir:repo,name:'x',dryRun:true});
 assert.ok(written.length>0);
 assert.deepEqual(snapshot(repo),before);
});

test('assertClean refuses a dirty tree and a non-git directory',()=>{
 const dir=tmp();
 assert.throws(()=>assertClean(dir),/not a git repo/);
 execSync('git init -q',{cwd:dir});execSync('git commit --allow-empty -m init -q',{cwd:dir,env:{...process.env,GIT_AUTHOR_NAME:'t',GIT_AUTHOR_EMAIL:'t@t',GIT_COMMITTER_NAME:'t',GIT_COMMITTER_EMAIL:'t@t'}});
 assert.doesNotThrow(()=>assertClean(dir));
 write(dir,'new.txt','x');
 assert.throws(()=>assertClean(dir),/working tree is not clean/);
});
