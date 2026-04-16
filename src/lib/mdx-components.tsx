import Link from "next/link";
import type { AnchorHTMLAttributes, HTMLAttributes } from "react";

import { Callout } from "@/design-system/mdx/callout";
import { Metric } from "@/design-system/mdx/metric";
import { MetricGroup } from "@/design-system/mdx/metric-group";
import { Tradeoff } from "@/design-system/mdx/tradeoff";

function isInternal(href: string | undefined): boolean {
  if (!href) return false;
  return href.startsWith("/") || href.startsWith("#");
}

export const mdxComponents = {
  h1: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="mt-12 scroll-m-24 text-3xl font-semibold tracking-tight first:mt-0 sm:text-4xl"
      {...props}
    />
  ),
  h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="mt-12 scroll-m-24 border-b border-border/60 pb-2 text-2xl font-semibold tracking-tight first:mt-0"
      {...props}
    />
  ),
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="mt-8 scroll-m-24 text-xl font-semibold tracking-tight"
      {...props}
    />
  ),
  h4: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className="mt-6 scroll-m-24 text-lg font-semibold tracking-tight"
      {...props}
    />
  ),
  p: (props: HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mt-5 leading-7 text-foreground/85 [&:first-child]:mt-0" {...props} />
  ),
  a: ({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (isInternal(href)) {
      return (
        <Link
          href={href ?? "#"}
          className="font-medium text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
          {...props}
        />
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
        {...props}
      />
    );
  },
  ul: (props: HTMLAttributes<HTMLUListElement>) => (
    <ul className="mt-5 ml-6 list-disc space-y-2 marker:text-foreground/40" {...props} />
  ),
  ol: (props: HTMLAttributes<HTMLOListElement>) => (
    <ol className="mt-5 ml-6 list-decimal space-y-2 marker:text-foreground/40" {...props} />
  ),
  li: (props: HTMLAttributes<HTMLLIElement>) => (
    <li className="leading-7 text-foreground/85" {...props} />
  ),
  blockquote: (props: HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="mt-6 border-l-2 border-foreground/40 pl-6 italic text-foreground/80"
      {...props}
    />
  ),
  hr: (props: HTMLAttributes<HTMLHRElement>) => (
    <hr className="my-10 border-border/60" {...props} />
  ),
  table: (props: HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props: HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="border-b border-border/60 text-left" {...props} />
  ),
  th: (props: HTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-3 py-2 font-semibold text-foreground" {...props} />
  ),
  td: (props: HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border-b border-border/30 px-3 py-2 text-foreground/85" {...props} />
  ),
  code: (props: HTMLAttributes<HTMLElement>) => (
    <code
      className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
      {...props}
    />
  ),
  pre: (props: HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="my-6 overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-4 font-mono text-sm leading-relaxed"
      {...props}
    />
  ),
  strong: (props: HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  Metric,
  MetricGroup,
  Tradeoff,
  Callout,
};
