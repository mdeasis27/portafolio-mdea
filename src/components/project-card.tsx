import Link from "next/link";
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

const statusLabels: Record<Project["frontmatter"]["status"], string> = {
  shipped: "Shipped",
  beta: "Beta",
  archived: "Archived",
};

export function ProjectCard({ project }: { project: Project }) {
  const { frontmatter } = project;
  const href = `/projects/${frontmatter.slug}`;

  return (
    <Link
      href={href}
      className="group block focus-visible:outline-none"
      aria-label={`Read case study: ${frontmatter.title}`}
    >
      <Card className="h-full transition-all duration-300 hover:border-foreground/30 hover:shadow-sm group-focus-visible:ring-2 group-focus-visible:ring-foreground/40">
        <CardHeader className="gap-3">
          <div className="flex items-center justify-between gap-3">
            <Badge variant={`status-${frontmatter.status}` as const}>
              {statusLabels[frontmatter.status]} · {frontmatter.year}
            </Badge>
            <ArrowUpRight className="size-4 text-foreground/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
          </div>
          <CardTitle className="text-xl leading-snug">
            {frontmatter.title}
          </CardTitle>
          <CardDescription className="line-clamp-3 text-[15px] leading-6 text-foreground/70">
            {frontmatter.summary}
          </CardDescription>
        </CardHeader>
        {frontmatter.role ? (
          <CardContent>
            <p className="text-xs uppercase tracking-wide text-foreground/50">
              Role
            </p>
            <p className="mt-1 text-sm text-foreground/80">{frontmatter.role}</p>
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
