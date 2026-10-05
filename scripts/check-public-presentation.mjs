import fs from 'node:fs';
import path from 'node:path';
import {oneLinerProblems} from './one-liner-sync.mjs';
const repos=['portafolio-mdea',...fs.readdirSync('content/projects/en').filter(x=>x.endsWith('.mdx')).map(x=>x.slice(0,-4))];
let failed=false;
for(const repo of repos){const root=repo==='portafolio-mdea'?process.cwd():path.resolve('..',repo);const required=['README.md','README.es.md','docs/images/cover.png','docs/images/demo.png'];const missing=required.filter(file=>!fs.existsSync(path.join(root,file)));if(missing.length){failed=true;console.error(`${repo}: missing ${missing.join(', ')}`);}else{for(const image of ['cover','demo']){const data=fs.readFileSync(path.join(root,`docs/images/${image}.png`));if(data.subarray(1,4).toString()!=='PNG'||data.readUInt32BE(16)<1000){failed=true;console.error(`${repo}: invalid or undersized ${image}`);}}console.log(`${repo}: paired README and real image assets present`);}}
for(const problem of oneLinerProblems(process.cwd())){failed=true;console.error(problem);}
process.exitCode=failed?1:0;
