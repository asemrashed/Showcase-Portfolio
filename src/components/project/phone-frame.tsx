import { cn } from "@/lib/utils";

/** Phone chrome. Children (a scrollable screenshot viewport) fill the screen area. */
export function PhoneFrame({
  children,
  className,
  screenClassName,
}: {
  children: React.ReactNode;
  className?: string;
  screenClassName?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[280px]", className)}>
      <div className="rounded-[2rem] border-[6px] border-foreground/90 bg-foreground/90 p-1.5 shadow-lg">
        <div className="relative">
          <span className="pointer-events-none absolute left-1/2 top-0 z-10 h-4 w-20 -translate-x-1/2 rounded-b-xl bg-foreground/90" />
          <div className={cn("overflow-hidden rounded-[1.6rem] bg-surface", screenClassName)}>{children}</div>
        </div>
      </div>
    </div>
  );
}
