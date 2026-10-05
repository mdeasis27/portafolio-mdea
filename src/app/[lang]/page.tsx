import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ProjectCard} from '@/components/project-card';
import {RecruiterJourney} from '@/components/recruiter-journey';
import {isLocale} from '@/design-system/i18n/locale';
import {dictionary} from '@/lib/i18n';
import {getAllProjects} from '@/lib/projects';

export default async function HomePage({params}:{params:Promise<{lang:string}>}) {
  const {lang}=await params;
  if(!isLocale(lang))notFound();
  const c=dictionary(lang);
  const projects=await getAllProjects(lang);
  const selected=['evidencia','compuerta','destilacion'];
  const demos=Object.fromEntries(projects.filter(p=>selected.includes(p.frontmatter.slug)&&p.frontmatter.liveUrl).map(p=>[p.frontmatter.slug,p.frontmatter.liveUrl!]));
  return <div className="mx-auto max-w-6xl px-5 sm:px-6">
    <section className="grid gap-8 pt-12 pb-10 sm:pt-20 lg:grid-cols-[1.4fr_.6fr]">
      <div><p className="font-mono text-xs uppercase tracking-[.2em] text-muted-foreground">{c.role}</p><h1 className="mt-5 whitespace-pre-line text-4xl font-medium leading-[1.08] tracking-tight sm:text-6xl">{c.headline}</h1><p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">{c.intro}</p></div>
      <div className="self-end border-l-2 border-accent pl-5"><p className="text-xl font-medium leading-8">{lang==='en'?'Try the product thinking.':'Prueba el criterio de producto.'}</p><p className="mt-3 text-sm leading-7 text-muted-foreground">{lang==='en'?'Take a role, change the conditions and inspect what happens. Start with three decisions about trust, continuity and cost.':'Toma un papel, cambia las condiciones e inspecciona qué sucede. Empieza por tres decisiones sobre confianza, continuidad y costo.'}</p><a href="#recruiter-journey" className="mt-4 inline-flex rounded-lg bg-foreground px-5 py-3 text-sm font-medium text-background">{lang==='en'?'Start the route':'Empezar el recorrido'} ↓</a></div>
    </section>
    <RecruiterJourney key={lang} locale={lang} demos={demos}/>
    <section className="py-12"><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><h2 className="text-2xl font-medium tracking-tight">{c.selected}</h2><Link href={'/'+lang+'/projects'} className="text-sm text-muted-foreground">{lang==='en'?'Explore all 21 projects':'Explorar los 21 proyectos'} →</Link></div><div className="grid gap-5 md:grid-cols-3">{selected.map(slug=>projects.find(p=>p.frontmatter.slug===slug)).filter(p=>p!==undefined).map(p=><ProjectCard key={p.frontmatter.slug} project={p} locale={lang}/>)}</div></section>
  </div>;
}
