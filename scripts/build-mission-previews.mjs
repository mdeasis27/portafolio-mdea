import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';

const hub = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const names = process.argv.slice(2);
if (!names.length) throw new Error('Provide mission project names or recruiter-journey.');
for (const name of names) {
  const result = spawnSync(process.execPath, ['scripts/build-component-lab.mjs', name], {cwd: hub, encoding: 'utf8'});
  if (result.status !== 0) throw new Error(result.stderr + result.stdout);
  const root = name === 'recruiter-journey' ? hub : path.resolve(hub, '..', name);
  const output = path.join(hub, 'docs/quality/.component-labs', name);
  function readCSS(directory) {
    return fs.readdirSync(directory, {withFileTypes: true}).flatMap(item => {
      const file = path.join(directory, item.name);
      return item.isDirectory() ? readCSS(file) : item.name.endsWith('.css') ? [fs.readFileSync(file, 'utf8')] : [];
    });
  }
  let css = readCSS(path.join(root, '.next/static')).join('\n').replace(/@font-face\s*\{[^}]*\}/g, '');
  for (const [family, file] of [['Portfolio', 'Geist.woff2'], ['PortfolioMono', 'GeistMono.woff2']]) {
    css += `@font-face{font-family:${family};src:url(data:font/woff2;base64,${fs.readFileSync(path.join(hub, 'design-system/fonts', file)).toString('base64')})}`;
  }
  css += ':root{--font-sans:Portfolio;--font-mono:PortfolioMono;--font-geist-sans:Portfolio;--font-geist-mono:PortfolioMono}body{font-family:Portfolio,sans-serif;margin:0}';
  const bundle = fs.readFileSync(path.join(output, 'bundle.js'), 'utf8').replace(/<\/script/gi, '<\\/script');
  const projects = ['evidencia', 'compuerta', 'destilacion', 'agente-riesgo', 'ensayo', 'warmstart', 'veredicto', 'mesa', 'doorman'];
  const navigation = projects.map(project => `<a data-preview-project href="../${project}/preview.html">${project}</a>`).join(' · ');
  const footer = String.raw`<script>
function applyPreviewLocale(){
  const locale=location.hash==='#es'?'es':'en';
  mountPortfolioDemo(locale);
  document.querySelectorAll('[data-preview-project]').forEach(anchor=>anchor.setAttribute('href',anchor.getAttribute('href').split('#')[0]+'#'+locale));
  document.querySelectorAll('[data-preview-locale]').forEach(anchor=>anchor.setAttribute('aria-current',anchor.getAttribute('data-preview-locale')===locale?'true':'false'));
}
window.addEventListener('hashchange',applyPreviewLocale);
document.addEventListener('click',event=>{
  const anchor=event.target.closest('a');if(!anchor)return;
  const href=anchor.getAttribute('href')||'';
  const locale=href.match(/^\/(en|es)(?:\/app)?(?:[?#].*)?$/);
  if(locale){event.preventDefault();location.hash=locale[1];applyPreviewLocale();return;}
  if(anchor.matches('[data-journey-demo]')){
    event.preventDefault();
    const steps=[...document.querySelectorAll('[data-journey-step]')];
    const index=steps.findIndex(step=>step.getAttribute('aria-pressed')==='true');
    location.href='../'+['evidencia','compuerta','destilacion'][index]+'/preview.html#'+document.documentElement.lang;
  }
},true);
applyPreviewLocale();
</script>`;
  new Script(bundle);
  new Script(footer.slice(8, -9));
  fs.writeFileSync(path.join(output, 'preview.html'), `<!doctype html><html class="dark" lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} · Mission pilot review</title><style>${css}</style><body><nav style="padding:12px 24px;border-bottom:1px solid var(--border);font:14px Portfolio"><a data-preview-locale="en" href="#en" style="display:inline-block;padding:10px 16px;border:1px solid var(--border);border-radius:8px">English</a> · <a data-preview-locale="es" href="#es" style="display:inline-block;padding:10px 16px;border:1px solid var(--border);border-radius:8px">Español</a> · ${navigation}<p>Local component review / Revisión local · Controlled navigation / Navegación controlada</p></nav><div id="root"${name === 'recruiter-journey' ? ' style="max-width:1152px;margin:auto;padding:24px"' : ''}></div><script>${bundle}</script>${footer}</body></html>`);
  console.log(name + ': real component preview generated; no HTTP-route claim');
}
