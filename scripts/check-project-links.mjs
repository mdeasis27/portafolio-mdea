import fs from 'node:fs';
import matter from 'gray-matter';
const projects=fs.readdirSync('content/projects/en').filter(x=>x.endsWith('.mdx')).map(filename=>matter(fs.readFileSync('content/projects/en/'+filename,'utf8')).data);
const results=[];
for(const project of projects){const item={slug:project.slug};for(const [key,address] of [['source',project.repoUrl],['deployedDemo',new URL('/en/app',project.liveUrl).toString()]]){try{const response=await fetch(address,{method:'GET',signal:AbortSignal.timeout(15000),redirect:'follow'});item[key]={status:response.status,url:response.url};await response.body?.cancel();}catch(error){item[key]={error:String(error)};}}results.push(item);console.log(JSON.stringify(item));}
fs.mkdirSync('docs/quality',{recursive:true});fs.writeFileSync('docs/quality/public-links.json',JSON.stringify(results,null,2));
