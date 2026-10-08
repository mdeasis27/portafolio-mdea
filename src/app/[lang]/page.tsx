import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ProjectCard} from '@/components/project-card';
import {isLocale} from '@/design-system/i18n/locale';
import {featuredSlugs} from '@/lib/featured';
import {dictionary} from '@/lib/i18n';
import {getAllProjects} from '@/lib/projects';
import {site} from '@/lib/site';

export default async function HomePage({params}:{params:Promise<{lang:string}>}) {
  const {lang}=await params;
  if(!isLocale(lang))notFound();
  const c=dictionary(lang);
  const projects=await getAllProjects(lang);
  const featured=featuredSlugs.map(slug=>projects.find(p=>p.frontmatter.slug===slug)).filter(p=>p!==undefined);
  const link='underline underline-offset-4 text-foreground/70 hover:text-foreground';
  return <div className="mx-auto max-w-6xl px-5 sm:px-6">
    <section className="pt-12 pb-10 sm:pt-20">
      <p className="font-mono text-xs uppercase tracking-[.2em] text-muted-foreground">{site.name}</p>
      <h1 className="mt-5 max-w-3xl text-4xl font-medium leading-[1.08] tracking-tight sm:text-6xl">{c.homeTitle}</h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">{c.homeIntro}</p>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <a href="#featured" className="inline-flex rounded-lg bg-foreground px-5 py-3 font-medium text-background">{c.seeProjects} ↓</a>
        <a href={site.author.linkedin} className={link}>{c.linkedin} ↗</a>
        <a href={site.author.github} className={link}>{c.github} ↗</a>
        <a href={'mailto:'+site.author.email} className={link}>{c.email}</a>
      </div>
    </section>
    <section id="featured" className="scroll-mt-24 py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-medium tracking-tight">{c.featuredHeading}</h2>
        <Link href={'/'+lang+'/projects'} className="text-sm text-muted-foreground">{c.seeAll} →</Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{featured.map(p=><ProjectCard key={p.frontmatter.slug} project={p} locale={lang}/>)}</div>
    </section>
  </div>;
}
