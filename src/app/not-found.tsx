import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-start px-6 py-32">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/50">
        404
      </p>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
        Nothing to audit here.
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-foreground/70">
        This page doesn&apos;t exist — or the case study behind it is still in
        review. Head back to the hub.
      </p>
      <div className="mt-10 flex gap-3">
        <Link href="/" className={buttonVariants()}>
          Home
        </Link>
        <Link
          href="/projects"
          className={buttonVariants({ variant: "outline" })}
        >
          Projects
        </Link>
      </div>
    </div>
  );
}
