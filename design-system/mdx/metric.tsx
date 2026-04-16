// design-system/mdx/metric.tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/design-system/utils";

type MetricProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
  label: string;
  description?: string;
};

export function Metric({ value, label, description, className, ...props }: MetricProps) {
  return (
    <div
      data-slot="metric"
      className={cn(
        "flex flex-col gap-1 rounded-[var(--radius)] border border-border bg-surface p-5",
        className,
      )}
      {...props}
    >
      <span className="font-serif text-3xl font-medium tracking-tight text-foreground">{value}</span>
      <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {description ? (
        <span className="mt-1 text-sm leading-6 text-foreground/80">{description}</span>
      ) : null}
    </div>
  );
}
