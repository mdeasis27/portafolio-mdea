import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

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
  type Project,
} from "@/lib/projects";

type PageParams = { slug: string };

export async function generateStaticParams(): Promise<PageParams[]> {
  const projects = await getAllProjects();
  return projects.map((project) => ({ slug: project.frontmatter.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };

  return {
    title: project.frontmatter.title,
    description: project.frontmatter.summary,
    openGraph: {
      title: project.frontmatter.title,
      description: project.frontmatter.summary,
      type: "article",
      publishedTime: project.frontmatter.publishedAt,
      modifiedTime: project.frontmatter.updatedAt,
    },
  };
}

const statusLabels: Record<Project["frontmatter"]["status"], string> = {
  shipped: "Shipped",
  beta: "Beta",
  archived: "Archived",
};

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
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const { frontmatter, content } = project;
  const publishedDate = new Date(frontmatter.publishedAt).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-foreground/60 transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All projects
      </Link>

      <header className="mt-10">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="secondary"
            className="font-mono text-[10px] uppercase tracking-wider"
          >
            {statusLabels[frontmatter.status]} · {frontmatter.year}
          </Badge>
          <span className="font-mono text-xs text-foreground/50">
            {publishedDate}
          </span>
        </div>
        <h1 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {frontmatter.title}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-foreground/75">
          {frontmatter.summary}
        </p>

        {frontmatter.role ? (
          <div className="mt-8 grid gap-4 rounded-lg border border-border/60 bg-muted/30 p-5 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-6">
            <span className="font-mono text-xs uppercase tracking-wider text-foreground/50">
              Role
            </span>
            <span className="text-foreground/85">{frontmatter.role}</span>
            <span className="font-mono text-xs uppercase tracking-wider text-foreground/50">
              Stack
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
                href={frontmatter.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ size: "sm", variant: "outline" })}
              >
                <ExternalLink className="mr-2 size-3.5" />
                Live
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
                Source
              </a>
            ) : null}
          </div>
        ) : null}
      </header>

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
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-foreground/60 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to projects
        </Link>
      </div>
    </article>
  );
}
