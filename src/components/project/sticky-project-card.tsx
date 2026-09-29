import Image from "next/image";
import { ExternalLink, PlayCircle } from "lucide-react";
import { formatPriceRange, formatDuration } from "@/lib/utils";
import type { ProjectDetailData } from "@/types/api";

export function StickyProjectCard({ project, currency }: { project: ProjectDetailData; currency: string }) {
  const hasLinks = project.links.live || project.links.demo;

  return (
    <>
      {/* Desktop: sticky right column */}
      <div className="hidden lg:block">
        <div className="sticky top-24 overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface">
          {project.images.desktop && (
            <div className="relative aspect-[4/3] w-full bg-muted">
              <Image src={project.images.desktop.url} alt={project.images.desktop.alt} fill sizes="320px" className="object-cover object-top" />
            </div>
          )}
          <div className="p-5">
            <h3 className="text-base font-medium">{project.name}</h3>
            {project.pricing && (
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">{formatPriceRange(project.pricing.minPrice, project.pricing.maxPrice, currency)}</span>
              </div>
            )}
            {project.pricing && (
              <div className="flex items-center justify-between pt-2 text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{formatDuration(project.pricing.minDuration, project.pricing.maxDuration)}</span>
              </div>
            )}
            {hasLinks && (
              <div className="mt-5 flex flex-col gap-2">
                {project.links.demo && <LinkButton href={project.links.demo} label="Demo Link" icon={PlayCircle} primary />}
                {project.links.live && <LinkButton href={project.links.live} label="View live" icon={ExternalLink} />}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: fixed bottom action bar */}
      {hasLinks && (
        <div
          className="fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t border-border bg-surface/95 p-3 backdrop-blur lg:hidden"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
        >
          {project.links.demo && (
            <LinkButton href={project.links.demo} label="Demo Link" icon={PlayCircle} primary className="flex-1" />
          )}
          {project.links.live && (
            <LinkButton href={project.links.live} label="View live" icon={ExternalLink} className="flex-1" />
          )}
        </div>
      )}
    </>
  );
}

function LinkButton({
  href,
  label,
  icon: Icon,
  primary,
  className,
}: {
  href: string;
  label: string;
  icon: typeof ExternalLink;
  primary?: boolean;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 text-sm font-medium transition-colors ${
        primary ? "bg-primary text-primary-foreground hover:bg-primary-hover" : "border border-border text-foreground hover:bg-muted"
      } ${className ?? ""}`}
    >
      <Icon className="size-4" />
      {label}
    </a>
  );
}
