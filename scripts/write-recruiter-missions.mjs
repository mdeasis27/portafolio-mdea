import fs from 'node:fs';
import path from 'node:path';

const missions=JSON.parse(fs.readFileSync(process.argv[2]??'docs/quality/recruiter-mission-content.json','utf8'));
const marker=/\n(?:<!-- recruiter-mission:start -->|\{\/\* recruiter-mission:start \*\/\})[\s\S]*?(?:<!-- recruiter-mission:end -->|\{\/\* recruiter-mission:end \*\/\})\n/g;
for(const [slug,locales] of Object.entries(missions))for(const [locale,mission] of Object.entries(locales)) {
  const en=locale==='en';
  const body=`\n<!-- recruiter-mission:start -->\n### ${en?'Your interactive mission':'Tu misión interactiva'}\n\n${mission.challenge}\n\n${mission.comparison}\n\n**${en?'Why this approach':'Por qué este enfoque'}:** ${mission.rationale}\n\n**${en?'Before production':'Antes de producción'}:** ${mission.production}\n\n${en?'Editing inputs, choosing a preset or resetting clears the prediction and obsolete results. Comparisons appear only at completed playback; the primary demos need no account or key.':'Editar datos, elegir un escenario o reiniciar borra la predicción y los resultados anteriores. La comparación aparece al completar la reproducción; las demos principales no requieren cuenta ni llave.'}\n<!-- recruiter-mission:end -->\n`;
  const casePath=`content/projects/${locale}/${slug}.mdx`;
  let content=fs.readFileSync(casePath,'utf8').replace(marker,'');
  content=content.replace(/Reset before comparing the second scenario\./g,'The mission also computes a simultaneous comparison for the executed inputs.').replace(/Reinicia antes de comparar el segundo escenario\./g,'La misión también calcula una comparación simultánea con los datos ejecutados.');
  const heading=en?'## Current state':'## Estado actual';
  if(!content.includes(heading))throw new Error(`Missing section in ${casePath}`);
  const evidence=mission.evidence?`\n${mission.evidence}\n`:'';
  fs.writeFileSync(casePath,content.replace(heading,body.replace('<!-- recruiter-mission:end -->',evidence+'<!-- recruiter-mission:end -->').replace('<!-- recruiter-mission:start -->','{/* recruiter-mission:start */}').replace('<!-- recruiter-mission:end -->','{/* recruiter-mission:end */}')+'\n'+heading).replace(/\n{3,}/g,'\n\n'));
  const readme=path.resolve('..',slug,en?'README.md':'README.es.md');
  let text=fs.readFileSync(readme,'utf8').replace(marker,'');
  const readmeHeading=en?'## Local setup and verification':'## Instalación y verificación local';
  if(!text.includes(readmeHeading))throw new Error(`Missing section in ${readme}`);
  text=text.replace(en?'Changing language resets the scenario; the interface displays a reset notice.':'Cambiar de idioma reinicia el escenario; la interfaz muestra un aviso de reinicio.',en?'Changing language resets the scenario.':'Cambiar de idioma reinicia el escenario.');
  const imagePath=`docs/images/mission${en?'':'.es'}.png`;
  const image=fs.existsSync(path.resolve('..',slug,imagePath))?`![${mission.evidence?(en?'Recorded comparison from the previous stage':'Comparación grabada de la etapa anterior'):(en?'Actual local computed mission comparison':'Comparación local real calculada')}](${imagePath})\n`:'';
  fs.writeFileSync(readme,text.replace(readmeHeading,body.replace('<!-- recruiter-mission:end -->',evidence+image+'<!-- recruiter-mission:end -->')+'\n'+readmeHeading).replace(/\n{3,}/g,'\n\n'));
}
