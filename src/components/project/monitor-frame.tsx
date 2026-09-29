import { cn } from "@/lib/utils";

/** Browser-style chrome. Children (a scrollable screenshot viewport) fill the screen area. */
export function MonitorFrame({
  children,
  className,
  screenClassName,
}: {
  children: React.ReactNode;
  className?: string;
  screenClassName?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <div className="rounded-t-lg border border-b-0 border-border bg-muted px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
        </div>
      </div>
      <div className={cn("overflow-hidden rounded-b-lg border border-border bg-surface", screenClassName)}>{children}</div>
    </div>
  );
}
