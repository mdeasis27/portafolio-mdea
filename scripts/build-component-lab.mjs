import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {webpack, LimitChunkCountPlugin} = require('next/dist/compiled/webpack/webpack');
const hub = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:([A-Za-z]:))/, '$1')), '..');
const slug = process.argv[2];
const journey = slug === 'recruiter-journey';
if (!slug || (!journey && !fs.existsSync(path.join(hub, 'content/projects/en', slug+'.mdx')))) throw new Error('Provide a configured project slug');
const root = journey ? hub : path.resolve(hub, '..', slug);
const experience = path.join(root, 'components/experience/experience.tsx');
const source = journey ? path.join(hub, 'src/components/recruiter-journey.tsx') : fs.existsSync(experience) ? experience : path.join(root, 'app/[lang]/app/page.tsx');
const fixture = {demos:{}, captures:{}};
if (journey) {
  const {default:matter}=await import('gray-matter');
  for (const name of ['evidencia','compuerta','destilacion']) {
    const {data}=matter(fs.readFileSync(path.join(hub,'content/projects/en',name+'.mdx'),'utf8'));
    fixture.demos[name]=data.liveUrl;
    for (const locale of ['en','es']) fixture.captures[name+'.'+locale]='data:image/png;base64,'+fs.readFileSync(path.join(hub,'public/project-captures',name+'.stage'+(locale==='es'?'.es':'')+'.png')).toString('base64');
  }
}
const output = path.join(hub, 'docs/quality/.component-labs', slug);
fs.mkdirSync(output, {recursive:true});
fs.writeFileSync(path.join(output,'entry.jsx'), `import React from 'react';
import {createRoot} from 'react-dom/client';
import * as demo from 'portfolio-experience';
import {LocaleProvider} from 'portfolio-locale';
const Component=demo.RecruiterJourney||demo.Experience||demo.default;
const fixture=${JSON.stringify(fixture)};
const root=createRoot(document.getElementById('root'));
window.mountPortfolioDemo=(locale)=>{window.__portfolioLocale=locale;document.documentElement.lang=locale;root.render(<LocaleProvider key={locale} locale={locale}><Component {...fixture} lang={locale} locale={locale}/></LocaleProvider>);};
window.mountPortfolioDemo(window.__portfolioLocale||'en');
`);

await new Promise((resolve,reject) => webpack({
  mode:'development',devtool:false,target:'web',entry:path.join(output,'entry.jsx'),
  output:{path:output,filename:'bundle.js'},
  resolve:{extensions:['.tsx','.ts','.jsx','.js','.json'],alias:{
    '@':root,'@/design-system':path.join(root,'design-system'),'portfolio-experience':source,'portfolio-locale':path.join(root,'design-system/i18n/context.tsx'),
    'next/navigation$':path.join(hub,'scripts/component-navigation.cjs'),
    'react$':require.resolve('react'),'react/jsx-runtime$':require.resolve('react/jsx-runtime'),
    'react-dom/client$':require.resolve('react-dom/client'),
  },modules:[path.join(root,'node_modules'),path.join(hub,'node_modules'),'node_modules']},
  module:{rules:[{test:/\.[tj]sx?$/,exclude:/node_modules/,use:path.join(hub,'scripts/component-loader.mjs')}]},
  plugins:[new webpack.DefinePlugin({'process.env':JSON.stringify({NODE_ENV:'development'})}),new LimitChunkCountPlugin({maxChunks:1})],
  optimization:{minimize:false},
},(error,stats)=>{
  if(error)return reject(error);
  if(stats.hasErrors())return reject(new Error(stats.toString({all:false,errors:true})));
  fs.writeFileSync(path.join(output,'build.json'),JSON.stringify({repository:slug,source,scope:'Browser component with controlled locale; no Next server and no route claims.',exitCode:0},null,2));
  resolve();
}));
console.log(slug+': component bundle built');
