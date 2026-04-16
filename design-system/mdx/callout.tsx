// design-system/mdx/callout.tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/design-system/utils";

type CalloutProps = HTMLAttributes<HTMLDivElement> & {
  type?: "note" | "warn";
};

export function Callout({ type = "note", children, className, ...props }: CalloutProps) {
  const tone =
    type === "warn"
      ? "border-destructive/40 bg-destructive/5"
      : "border-border bg-muted/10";
  return (
    <div
      data-slot="callout"
      data-type={type}
      className={cn("my-6 rounded-[var(--radius)] border px-5 py-4 text-[15px] leading-7 text-foreground/85", tone, className)}
      {...props}
    >
      {children}
    </div>
  );
}
