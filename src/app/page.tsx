import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

import { LinkedInIcon } from "@/components/brand-icons";
import { ProjectCard } from "@/components/project-card";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getAllProjects, getFeaturedProjects } from "@/lib/projects";
import { site } from "@/lib/site";

export default async function HomePage() {
  const allProjects = await getAllProjects();
  const featured = await getFeaturedProjects();
  const projectsToShow = featured.length > 0 ? featured : allProjects.slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      <section className="pt-20 pb-16 sm:pt-28 sm:pb-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/50">
          {site.author.role}
        </p>
        <h1 className="mt-6 text-balance text-5xl font-medium leading-[1.05] tracking-tight sm:text-[64px]">
          {site.thesis.headline}
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-foreground/70 sm:text-xl">
          {site.thesis.subhead}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/projects"
            className={buttonVariants({ size: "lg" })}
          >
            View projects
            <ArrowRight className="ml-2 size-4" />
          </Link>
          <Link
            href="/about"
            className={buttonVariants({ variant: "ghost", size: "lg" })}
          >
            About
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <a
              href={site.author.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <LinkedInIcon className="size-4" />
            </a>
            <a
              href={`mailto:${site.author.email}`}
              aria-label="Email"
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <Mail className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <Separator className="opacity-60" />

      <section className="py-16 sm:py-20">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/50">
              Selected work
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Projects
            </h2>
          </div>
          {projectsToShow.length > 0 ? (
            <Link
              href="/projects"
              className="hidden text-sm text-foreground/60 transition-colors hover:text-foreground sm:block"
            >
              See all →
            </Link>
          ) : null}
        </div>

        {projectsToShow.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projectsToShow.map((project) => (
              <ProjectCard key={project.frontmatter.slug} project={project} />
            ))}
          </div>
        ) : (
          <EmptyStateHome />
        )}
      </section>
    </div>
  );
}

function EmptyStateHome() {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-background/40 px-8 py-14 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/50">
        Case studies in progress
      </p>
      <h3 className="mt-4 text-xl font-semibold tracking-tight">
        Each project gets the room it deserves.
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-foreground/60">
        I publish one case study at a time, only when the build behind it is
        real. The list fills up as systems ship.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/about"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Read the thesis
        </Link>
        <a
          href={site.author.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <LinkedInIcon className="mr-2 size-4" />
          Follow on LinkedIn
        </a>
      </div>
    </div>
  );
}
