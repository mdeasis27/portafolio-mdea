import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const slugs=fs.readdirSync('content/projects/en').filter(name=>name.endsWith('.mdx')).map(name=>name.slice(0,-4));
for(const slug of slugs){
 const storyPath=path.resolve('..',slug,'docs/quality/business-story.json');
 if(!fs.existsSync(storyPath))throw new Error(`${slug}: business story not implemented`);
 const story=JSON.parse(fs.readFileSync(storyPath,'utf8'));
 for(const locale of ['en','es']){
  const s=story[locale];
  for(const key of ['user','problem','workflow','decision','value','visual','limitation'])if(typeof s?.[key]!=='string'||!s[key].trim())throw new Error(`${slug}/${locale}: missing ${key}`);
  for(const key of ['scenarioA','scenarioB'])for(const field of ['title','input','observation'])if(typeof s[key]?.[field]!=='string'||!s[key][field].trim())throw new Error(`${slug}/${locale}: missing ${key}.${field}`);
  const filename=`content/projects/${locale}/${slug}.mdx`;
  const previous=matter(fs.readFileSync(filename,'utf8'));
  const english=locale==='en';
  const sections=previous.content.split(/^## .+$/m).slice(1).map(text=>text.trim());
  const previousVisuals = new Set([s.visual, previous.data.visualMechanism, 'An animated domain process reveals computed steps.', 'Un proceso animado del dominio revela los pasos calculados.', 'A versioned prompt key flows into a cache hit or invalidation branch.', 'Una llave de prompt versionada fluye hacia una rama de acierto o invalidación.']);
  const design=sections[2].split(/\n\s*\n/).filter(paragraph=>!previousVisuals.has(paragraph.trim())).join('\n\n');
  const data={...previous.data,businessRole:s.user,businessDecision:s.decision,businessValue:s.value,visualMechanism:s.visual,scenarios:[s.scenarioA,s.scenarioB]};
  const content=english?`## The problem\n\n${s.problem}\n\n**Who uses it:** ${s.user}.\n\n**The decision:** ${s.decision}\n\n## The approach\n\n${s.workflow}\n\n### Try the decision\n\n**${s.scenarioA.title}:** ${s.scenarioA.input} ${s.scenarioA.observation}\n\n**${s.scenarioB.title}:** ${s.scenarioB.input} ${s.scenarioB.observation}\n\nChoose a scenario, edit its controls and run the local computation. Step through the visual process or reveal all steps. Reset before comparing the second scenario.\n\n## Design decisions\n\n${s.visual}\n\n${design}\n\n## Current state\n\nThe primary experience runs locally without an API key or database. Scenario presets change actual inputs, and visual playback reveals computed trace events. Live integrations remain separate. The redesigned public routes are pending deployment.\n\n## What this demonstrates\n\n${s.value}\n\n**Limits:** ${s.limitation} These portfolio prototypes do not claim measured production impact.\n`:`## El problema\n\n${s.problem}\n\n**Quién lo usa:** ${s.user}.\n\n**La decisión:** ${s.decision}\n\n## El enfoque\n\n${s.workflow}\n\n### Prueba la decisión\n\n**${s.scenarioA.title}:** ${s.scenarioA.input} ${s.scenarioA.observation}\n\n**${s.scenarioB.title}:** ${s.scenarioB.input} ${s.scenarioB.observation}\n\nElige un escenario, modifica sus controles y ejecuta el cálculo local. Avanza por la visualización paso a paso o revela todo. Reinicia antes de comparar el segundo escenario.\n\n## Decisiones de diseño\n\n${s.visual}\n\n${design}\n\n## Estado actual\n\nLa experiencia principal funciona localmente sin clave de API ni base de datos. Los escenarios cambian entradas reales y la reproducción visual revela eventos calculados. Las integraciones en vivo permanecen separadas. Las nuevas rutas públicas están pendientes de despliegue.\n\n## Lo que demuestra\n\n${s.value}\n\n**Límites:** ${s.limitation} Estos prototipos de portafolio no afirman impacto medido en producción.\n`;
  fs.writeFileSync(filename,matter.stringify(content,data));
 }
 console.log(`${slug}: business cases generated from implemented scenario descriptions`);
}

await import("./write-recruiter-missions.mjs");
