import type {Locale} from '@/design-system/i18n/locale';
import {dictionary} from '@/lib/i18n';
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Project } from "@/lib/projects";
import { demoHref } from "@/lib/demo-href";


export function ProjectCard({ project, locale = "en" }: { project: Project; locale?: Locale }) {
  const { frontmatter } = project;
  const c = dictionary(locale);
  const href = `/${locale}/projects/${frontmatter.slug}`;

  if (frontmatter.oneLiner && frontmatter.liveUrl) {
    const demo = demoHref(frontmatter.liveUrl, locale);
    return (
      <Card className="relative h-full transition-all duration-300 hover:border-foreground/30 hover:shadow-sm focus-within:ring-2 focus-within:ring-foreground/40">
        <div className="relative mx-3 aspect-[16/9] overflow-hidden rounded-lg border border-border/60 bg-muted">
          <Image src={`/project-captures/${frontmatter.slug}.stage${locale === "es" ? ".es" : ""}.png`} alt={locale === "en" ? `${frontmatter.title}: actual interactive demo` : `${frontmatter.title}: demo interactiva real`} fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="object-cover object-top" />
        </div>
        <CardHeader className="gap-3">
          <div className="flex items-center justify-between gap-3">
            <Badge variant={`status-${frontmatter.status}` as const}>{c.status[frontmatter.status]} · {frontmatter.year}</Badge>
            <ArrowUpRight className="size-4 text-foreground/40" />
          </div>
          <CardTitle className="text-xl leading-snug">
            <a href={demo} target="_blank" rel="noopener noreferrer" aria-describedby={`${frontmatter.slug}-cta`} className="after:absolute after:inset-0 focus-visible:outline-none">{frontmatter.title}</a>
          </CardTitle>
          <CardDescription className="text-[15px] leading-6 text-foreground/70">{frontmatter.oneLiner}</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-wrap items-center justify-between gap-3">
          <span id={`${frontmatter.slug}-cta`} className="text-sm font-medium text-accent">{c.demo} →<span className="sr-only"> ({c.newTab})</span></span>
          <Link href={href} className="relative z-10 text-sm text-foreground/60 underline-offset-4 hover:underline">{c.caseStudy}</Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Link
      href={href}
      className="group block focus-visible:outline-none"
      aria-label={`${c.caseStudy}: ${frontmatter.title}`}
    >
      <Card className="h-full transition-all duration-300 hover:border-foreground/30 hover:shadow-sm group-focus-visible:ring-2 group-focus-visible:ring-foreground/40">
        <div className="relative mx-3 aspect-[16/9] overflow-hidden rounded-lg border border-border/60 bg-muted">
          <Image src={`/project-captures/${frontmatter.slug}.stage${locale === "es" ? ".es" : ""}.png`} alt={locale === 'en' ? `${frontmatter.title}: actual interactive demo` : `${frontmatter.title}: demo interactiva real`} fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none" />
        </div>
        <CardHeader className="gap-3">
          <div className="flex items-center justify-between gap-3">
            <Badge variant={`status-${frontmatter.status}` as const}>
              {c.status[frontmatter.status]} · {frontmatter.year}
            </Badge>
            <ArrowUpRight className="size-4 text-foreground/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
          </div>
          <CardTitle className="text-xl leading-snug">
            {frontmatter.title}
          </CardTitle>
          <CardDescription className="line-clamp-3 text-[15px] leading-6 text-foreground/70">
            {frontmatter.businessDecision ?? frontmatter.summary}
          </CardDescription>
        </CardHeader>
        {frontmatter.role ? (
          <CardContent>
            <p className="text-xs uppercase tracking-wide text-foreground/50">
              {frontmatter.businessRole ? (locale === "es" ? "Quién lo usa" : "Who uses it") : (locale === "es" ? "Responsabilidad" : "Role")}
            </p>
            <p className="mt-1 text-sm text-foreground/80">{frontmatter.businessRole ?? (locale === 'es' && frontmatter.role === 'Product & Engineering' ? 'Producto e ingeniería' : frontmatter.role)}</p>
          </CardContent>
        ) : null}
        <CardFooter className="flex flex-wrap gap-1.5">
          {frontmatter.stack.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-border/60 bg-background/50 px-2.5 py-0.5 font-mono text-[11px] text-foreground/70"
            >
              {tech}
            </span>
          ))}
          {frontmatter.stack.length > 5 ? (
            <span className="rounded-full border border-border/60 bg-background/50 px-2.5 py-0.5 font-mono text-[11px] text-foreground/50">
              +{frontmatter.stack.length - 5}
            </span>
          ) : null}
        </CardFooter>
      </Card>
    </Link>
  );
}
