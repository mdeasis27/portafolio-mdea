import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";

import { LinkedInIcon } from "@/components/brand-icons";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Manuel De Asís — finance and operations executive who also ships production software. Background, focus, and how to work together.",
};

const focusAreas = [
  {
    title: "AI-first operating systems",
    body: "Designing agentic workflows that replace slide-deck thinking with running software. My bias is toward filesystems, markdown, and plain code instead of vendor-locked platforms.",
  },
  {
    title: "Strategic finance & FP&A",
    body: "Unit economics, cash runway, and scenario modeling for startups moving fast. I care about the instrumented dashboard behind every forecast, not just the number.",
  },
  {
    title: "Operations leverage",
    body: "Removing the manual work that keeps executives in-the-loop on everything. If a process runs three times, I'd rather automate it than delegate it.",
  },
];

const principles = [
  "Quality over cadence. One deep case study beats ten shallow posts.",
  "Every claim ships with metrics, or it doesn't ship.",
  "Tradeoffs go in the first paragraph, not the FAQ.",
  "Code and operating instructions live in the same repo.",
  "Ethical hard stops beat spam-optimized pipelines.",
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20 sm:py-28">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/50">
        About
      </p>
      <h1 className="mt-6 text-balance text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
        Finance and operations executive who ships the software.
      </h1>

      <div className="mt-10 space-y-6 text-lg leading-relaxed text-foreground/80">
        <p>
          I&apos;m Manuel. I spent the last decade running finance and operations
          inside companies where the P&amp;L needed a builder in the room — from
          Grupo MAG to Rappi Card — and I picked up the habit of writing the
          software I used to brief engineers to write.
        </p>
        <p>
          Today I lead with both hats: I model the business and I ship the
          systems that run it. The portfolio you&apos;re reading lives on infrastructure
          I built, is updated the same week the ideas land, and is deliberately
          quiet so every project gets the space it deserves.
        </p>
        <p className="text-foreground/70">
          MBA from IE Business School. Based in México, working 100% remote with
          teams in LATAM and beyond.
        </p>
      </div>

      <Separator className="my-14 opacity-60" />

      <section>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/50">
          Focus
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          What I&apos;m working on
        </h2>
        <div className="mt-8 space-y-8">
          {focusAreas.map((area) => (
            <div key={area.title}>
              <h3 className="text-lg font-semibold text-foreground">
                {area.title}
              </h3>
              <p className="mt-2 leading-7 text-foreground/70">{area.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-14 opacity-60" />

      <section>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/50">
          Operating principles
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          How I work
        </h2>
        <ul className="mt-8 space-y-4">
          {principles.map((principle, index) => (
            <li key={principle} className="flex gap-4">
              <span className="mt-0.5 font-mono text-sm text-foreground/40">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="leading-7 text-foreground/80">{principle}</span>
            </li>
          ))}
        </ul>
      </section>

      <Separator className="my-14 opacity-60" />

      <section>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/50">
          Get in touch
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          Let&apos;s talk
        </h2>
        <p className="mt-5 max-w-xl leading-7 text-foreground/70">
          I&apos;m selectively open to senior roles — Head of, Chief of Staff, PM
          Fintech, Strategic Finance, Ops Lead — at remote-first fintech or SaaS
          companies. If that sounds like your team, the fastest paths are below.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={site.author.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ size: "lg" })}
          >
            <LinkedInIcon className="mr-2 size-4" />
            LinkedIn
          </a>
          <a
            href={`mailto:${site.author.email}`}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            <Mail className="mr-2 size-4" />
            Email
          </a>
          <Link
            href="/projects"
            className={buttonVariants({ variant: "ghost", size: "lg" })}
          >
            Projects →
          </Link>
        </div>
      </section>
    </div>
  );
}
