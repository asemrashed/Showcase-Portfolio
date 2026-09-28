import Image from "next/image";
import { cn } from "@/lib/utils";

/** A landing screenshot is usually much taller than the viewport, so it scrolls inside the frame. */
export function MonitorFrame({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cn("w-full", className)}>
      <div className="rounded-t-lg border border-b-0 border-border bg-muted px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
        </div>
      </div>
      <div className="max-h-130 overflow-y-auto rounded-b-lg border border-border bg-surface thin-scroll">
        <Image src={src} alt={alt} width={1440} height={4000} sizes="(min-width: 1024px) 55vw, 90vw" className="w-full" />
      </div>
    </div>
  );
}
