"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TechBadge } from "./tech-badge";
import type { ProjectCardData } from "@/types/api";

// Tech badges: keep everything on a single row and roll the overflow into
// a "+N more" chip instead of wrapping, per design spec.
const MAX_VISIBLE_TECHNOLOGIES = 3;

/**
 * Links via /projects/[slug]. When rendered while on /projects, Next's default-active
 * intercepting route (@modal) turns this into a client-side bottom sheet; a direct load
 * or share renders the full page. No special handling needed here either way.
 *
 * Structural note: the card is no longer a single top-level <Link> because it now
 * contains a second, independent action (the external "Visit" button). Nesting an
 * <a> inside another <a> is invalid HTML and breaks click targeting/accessibility,
 * so only the image + text block is the details link; the two CTAs live in their
 * own footer row outside of it.
 */
export function ProjectCard({ project }: { project: ProjectCardData }) {
  const router = useRouter();
  const detailsHref = `/projects/${project.slug}`;

  const visibleTechnologies = project.technologies.slice(0, MAX_VISIBLE_TECHNOLOGIES);
  const hiddenTechnologiesCount = project.technologies.length - visibleTechnologies.length;

  return (
    <div
      className="group flex flex-col gap-3.5 rounded-lg border border-border/50 bg-linear-to-b from-amber-50/60 to-transparent p-3 shadow-sm ring-1 ring-black/[0.02] transition-shadow duration-300 hover:shadow-md dark:from-amber-500/[0.06] dark:ring-white/[0.03]"
    >
      <Link
        href={detailsHref}
        onMouseEnter={() => router.prefetch(detailsHref)}
        className="flex flex-col gap-3.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        {/* 16:9 frame. The desktop screenshot is a full-page capture, so we crop to its top (object-top). */}
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
          {project.image ? (
            <Image
              src={project.image.url}
              alt={project.image.alt}
              fill
              sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
              className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">No preview</div>
          )}
          {project.featured && (
            <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur">
              Featured
            </span>
          )}
          <div className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-surface/90 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
            <ArrowUpRight className="size-4" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[15px] font-medium leading-snug">{project.name}</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">{project.shortDescription}</p>
          {project.technologies.length > 0 && (
            <div className="mt-1 flex flex-nowrap items-center gap-1.5 overflow-hidden">
              {visibleTechnologies.map((t) => (
                <TechBadge key={t.name} name={t.name} icon={t.icon} className="shrink-0" />
              ))}
              {hiddenTechnologiesCount > 0 && (
                <Badge
                  className="shrink-0"
                  title={project.technologies.slice(MAX_VISIBLE_TECHNOLOGIES).map((t) => t.name).join(", ")}
                >
                  More ({hiddenTechnologiesCount})
                </Badge>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Footer actions sit outside the details Link so "Visit" can safely be its
          own <a> without producing nested interactive elements. */}
      <div className="mt-1 flex items-center gap-2">
        <Button asChild variant="secondary" className="flex-1">
          <Link href={detailsHref} onMouseEnter={() => router.prefetch(detailsHref)}>
            View details
          </Link>
        </Button>
        {project.demoUrl ? (
          <Button asChild className="flex-1">
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
              Visit
              <ExternalLink />
            </a>
          </Button>
        ) : (
          // Wrapper carries the not-allowed cursor: the disabled button itself ignores pointer events.
          <span className="flex-1 cursor-not-allowed" title="Demo link not available">
            <Button disabled className="w-full">
              Visit
              <ExternalLink />
            </Button>
          </span>
        )}
      </div>
    </div>
  );
}
