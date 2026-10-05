"use client";
import {useState} from 'react';
import {ProjectCard} from './project-card';
import type {Project} from '@/lib/projects';
import type {Locale} from '@/design-system/i18n/locale';
const categories = [
 {id:'all',en:'All work',es:'Todo',slugs:[]},
 {id:'operations',en:'Operational decisions',es:'Decisiones operativas',slugs:['agente-riesgo','identidad-360','kyc-antifraude','radar-proveedores','agente-cobranzas','traductor']},
 {id:'evidence',en:'Evidence & documents',es:'Evidencia y documentos',slugs:['evidencia','grafo','destilacion','escaneo','vigia']},
 {id:'quality',en:'Product quality & safety',es:'Calidad y seguridad',slugs:['veredicto','doorman','asedio','arbitro','ensayo','bandera','fabrica']},
 {id:'reliability',en:'Reliable workflows',es:'Procesos confiables',slugs:['compuerta','warmstart','mesa']},
];
export function ProjectExplorer({projects,locale}:{projects:Project[];locale:Locale}) {
 const [active,setActive]=useState('all');const category=categories.find(c=>c.id===active)!;
 const shown=active==='all'?projects:projects.filter(p=>category.slugs.includes(p.frontmatter.slug));
 return <section className="mt-12"><div className="mb-7 flex flex-wrap gap-2" aria-label={locale==='en'?'Business use cases':'Casos de uso de negocio'}>{categories.map(c=><button key={c.id} type="button" aria-pressed={active===c.id} onClick={()=>setActive(c.id)} className={`rounded-full border px-4 py-2 text-sm transition-colors ${active===c.id?'border-foreground bg-foreground text-background':'border-border text-foreground/60 hover:border-foreground/30'}`}>{locale==='en'?c.en:c.es}</button>)}</div><p className="mb-6 font-mono text-xs text-foreground/50" aria-live="polite">{shown.length} {locale==='en'?'projects · choose a workflow to inspect its decision':'proyectos · elige un proceso para inspeccionar su decisión'}</p><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{shown.map(project=><ProjectCard key={project.frontmatter.slug} project={project} locale={locale}/>)}</div></section>;
}
