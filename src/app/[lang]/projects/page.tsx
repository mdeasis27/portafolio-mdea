import {notFound} from 'next/navigation';
import {ProjectExplorer} from '@/components/project-explorer';
import {isLocale} from '@/design-system/i18n/locale';
import {dictionary} from '@/lib/i18n';
import {getAllProjects} from '@/lib/projects';
export default async function ProjectsPage({params}:{params:Promise<{lang:string}>}){const {lang}=await params;if(!isLocale(lang))notFound();const c=dictionary(lang);const projects=await getAllProjects(lang);return <div className="mx-auto max-w-6xl px-6 py-16"><header className="max-w-3xl"><p className="font-mono text-xs uppercase tracking-widest text-foreground/50">AI PRODUCT LAB / {projects.length}</p><h1 className="mt-6 text-4xl font-medium tracking-tight sm:text-5xl">{c.catalogue}</h1><p className="mt-6 text-lg leading-8 text-foreground/65">{c.catalogueIntro}</p></header><ProjectExplorer projects={projects} locale={lang}/></div>;}
