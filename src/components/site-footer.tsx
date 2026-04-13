import Link from "next/link";

import { site } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border/40">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{site.name}</p>
          <p className="text-xs text-foreground/60">
            {site.author.role} · {site.author.location}
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-foreground/60">
          <Link
            href={site.author.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            LinkedIn
          </Link>
          <a
            href={`mailto:${site.author.email}`}
            className="transition-colors hover:text-foreground"
          >
            Email
          </a>
          <span className="font-mono text-xs text-foreground/40">
            © {year}
          </span>
        </nav>
      </div>
    </footer>
  );
}
