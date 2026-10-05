import {isLocale} from '@/design-system/i18n/locale';
import { demoHref } from "@/lib/demo-href";
import {dictionary} from '@/lib/i18n';
import {site} from '@/lib/site';
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import {CaseExperiment} from "@/components/case-experiment";
import { GitHubIcon } from "@/components/brand-icons";
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import type { Pluggable } from "unified";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { mdxComponents } from "@/lib/mdx-components";
import {
  getAllProjects,
  getProjectBySlug,
} from "@/lib/projects";

type PageParams = { slug: string; lang: string };

export async function generateStaticParams(): Promise<PageParams[]> {
  const projects = await getAllProjects();
  return ["en", "es"].flatMap(lang => projects.map(project => ({lang, slug: project.frontmatter.slug})));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug, lang } = await params;
  if (!isLocale(lang)) notFound();
  const project = await getProjectBySlug(slug, lang);
  if (!project) return { title: lang === "es" ? "Proyecto no encontrado" : "Project not found" };

  return {
    title: project.frontmatter.title,
    description: project.frontmatter.summary,
    alternates: {canonical: `/${lang}/projects/${slug}`, languages: {en:`/en/projects/${slug}`,es:`/es/projects/${slug}`}},
    openGraph: {
      title: project.frontmatter.title,
      description: project.frontmatter.summary,
      type: "article",
      images: [{url: new URL(`/project-captures/${slug}.png`,site.url).toString(),width:1440,height:1000,alt:project.frontmatter.title}],
      publishedTime: project.frontmatter.publishedAt,
      modifiedTime: project.frontmatter.updatedAt,
    },
  };
}


const remarkPlugins: Pluggable[] = [remarkGfm];

const rehypePlugins: Pluggable[] = [
  rehypeSlug,
  [
    rehypeAutolinkHeadings,
    { behavior: "wrap", properties: { className: ["anchor"] } },
  ],
  [
    rehypePrettyCode,
    {
      theme: { dark: "github-dark-dimmed", light: "github-light" },
      keepBackground: false,
    },
  ],
];

const mdxOptions: NonNullable<
  NonNullable<MDXRemoteProps["options"]>["mdxOptions"]
> = {
  remarkPlugins,
  rehypePlugins,
};

export default async function ProjectPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug, lang } = await params;
  if (!isLocale(lang)) notFound();
  const c = dictionary(lang);
  const project = await getProjectBySlug(slug, lang);
  if (!project) notFound();

  const { frontmatter, content } = project;
  const publishedDate = new Date(frontmatter.publishedAt).toLocaleDateString(
    lang === "es" ? "es-MX" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
      <Link
        href={`/${lang}/projects`}
        className="inline-flex items-center gap-2 text-sm text-foreground/60 transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {c.back}
      </Link>

      <header className="mt-10">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={`status-${frontmatter.status}` as const}>
            {c.status[frontmatter.status]} · {frontmatter.year}
          </Badge>
          <span className="font-mono text-xs text-foreground/50">
            {publishedDate}
          </span>
        </div>
        <h1 className="mt-6 text-balance text-4xl font-medium leading-tight tracking-tight sm:text-[48px]">
          {frontmatter.title}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-foreground/75">
          {frontmatter.summary}
        </p>

        {frontmatter.role ? (
          <div className="mt-8 grid gap-4 rounded-lg border border-border/60 bg-muted/30 p-5 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-6">
            <span className="font-mono text-xs uppercase tracking-wider text-foreground/50">
              {lang === 'en' ? 'Responsibility' : 'Responsabilidad'}
            </span>
            <span className="text-foreground/85">{lang === 'es' && frontmatter.role === 'Product & Engineering' ? 'Producto e ingeniería' : frontmatter.role}</span>
            <span className="font-mono text-xs uppercase tracking-wider text-foreground/50">
              {c.stack}
            </span>
            <span className="flex flex-wrap gap-1.5">
              {frontmatter.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-border/60 bg-background/60 px-2.5 py-0.5 font-mono text-[11px] text-foreground/75"
                >
                  {tech}
                </span>
              ))}
            </span>
          </div>
        ) : null}

        {(frontmatter.liveUrl || frontmatter.repoUrl) ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {frontmatter.liveUrl ? (
              <a
                href={demoHref(frontmatter.liveUrl, lang)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ size: "sm", variant: "outline" })}
              >
                <ExternalLink className="mr-2 size-3.5" />
                {c.demo}
                <span className="sr-only"> ({c.newTab})</span>
              </a>
            ) : null}
            {frontmatter.repoUrl ? (
              <a
                href={frontmatter.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ size: "sm", variant: "outline" })}
              >
                <GitHubIcon className="mr-2 size-3.5" />
                {c.source}
              </a>
            ) : null}
          </div>
        ) : null}
      </header>

      {frontmatter.businessRole && <section className="mt-8 grid gap-5 border-l-2 border-accent pl-5 sm:grid-cols-2"><div><p className="font-mono text-xs uppercase text-muted-foreground">{lang === 'en' ? 'Put yourself in this role' : 'Ponte en este papel'}</p><p className="mt-2 text-sm leading-6">{frontmatter.businessRole}</p></div><div><p className="font-mono text-xs uppercase text-muted-foreground">{lang === 'en' ? 'Your decision' : 'Tu decisión'}</p><p className="mt-2 text-sm leading-6">{frontmatter.businessDecision}</p></div></section>}
      {frontmatter.scenarios && frontmatter.visualMechanism && <CaseExperiment scenarios={frontmatter.scenarios} mechanism={frontmatter.visualMechanism} locale={lang}/>}
      <figure className="mt-10 overflow-hidden rounded-xl border border-border">
        <Image src={`/project-captures/${slug}${lang==='es'?'.es':''}.png`} alt={lang === 'en' ? `${frontmatter.title}: actual local demo` : `${frontmatter.title}: demo local real`} width={1440} height={1000} sizes="(min-width: 768px) 720px, 100vw" className="h-auto w-full" />
        <figcaption className="border-t border-border px-4 py-3 text-xs text-foreground/60">{lang === 'en' ? 'Actual local interface. Open the demo to change inputs and inspect its computed evidence.' : 'Interfaz local real. Abre la demo para cambiar entradas y revisar la evidencia calculada.'}</figcaption>
      </figure>
      <Separator className="my-12 opacity-60" />

      <div className="mdx-content">
        <MDXRemote
          source={content}
          components={mdxComponents}
          options={{ mdxOptions }}
        />
      </div>

      <Separator className="mt-20 opacity-60" />
      <div className="mt-10 flex items-center justify-between">
        <Link
          href={`/${lang}/projects`}
          className="inline-flex items-center gap-2 text-sm text-foreground/60 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {c.back}
        </Link>
      </div>
    </article>
  );
}
