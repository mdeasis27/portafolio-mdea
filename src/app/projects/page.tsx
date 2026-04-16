import type { Metadata } from "next";
import Link from "next/link";

import { LinkedInIcon } from "@/components/brand-icons";
import { ProjectCard } from "@/components/project-card";
import { buttonVariants } from "@/components/ui/button";
import { getAllProjects } from "@/lib/projects";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Case studies from Manuel De Asís — production systems built at the intersection of finance, operations, and AI.",
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-28">
      <header className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/50">
          Projects
        </p>
        <h1 className="font-serif mt-6 text-balance text-4xl font-medium leading-tight tracking-tight sm:text-[52px]">
          Case studies from the builder&apos;s desk.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-foreground/70">
          Each entry is a production system I designed and shipped — with the
          metrics, the tradeoffs, and the parts I&apos;d change next time.
        </p>
      </header>

      <div className="mt-16">
        {projects.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.frontmatter.slug}
                project={project}
              />
            ))}
          </div>
        ) : (
          <EmptyStateProjects />
        )}
      </div>
    </div>
  );
}

function EmptyStateProjects() {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-background/40 px-8 py-20 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/50">
        Currently writing
      </p>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight">
        The first case study is in the oven.
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-foreground/60">
        I publish one project at a time — only when the build is in production
        and the tradeoffs are honest. If you want the next one in your inbox as
        it lands, the best signal is LinkedIn.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <a
          href={site.author.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: "lg" })}
        >
          <LinkedInIcon className="mr-2 size-4" />
          Follow on LinkedIn
        </a>
        <Link
          href="/about"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          About Manuel
        </Link>
      </div>
    </div>
  );
}
