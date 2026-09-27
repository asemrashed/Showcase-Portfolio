"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProjectCardData } from "@/types/api";

/**
 * Links via /projects/[slug]. When rendered while on /projects, Next's default-active
 * intercepting route (@modal) turns this into a client-side bottom sheet; a direct load
 * or share renders the full page. No special handling needed here either way.
 */
export function ProjectCard({ project }: { project: ProjectCardData }) {
  const router = useRouter();

  return (
    <Link
      href={`/projects/${project.slug}`}
      onMouseEnter={() => router.prefetch(`/projects/${project.slug}`)}
      className="group flex flex-col gap-3.5 rounded-[var(--radius-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] bg-muted">
        {project.image ? (
          <Image
            src={project.image.url}
            alt={project.image.alt}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
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
          <div className="mt-1 flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 4).map((t) => (
              <Badge key={t.name}>{t.name}</Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
