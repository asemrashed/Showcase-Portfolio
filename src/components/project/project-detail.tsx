import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MonitorFrame } from "./monitor-frame";
import { PhoneFrame } from "./phone-frame";
import { ScreenshotCarousel } from "./screenshot-carousel";
import { RoleTabs } from "./role-tabs";
import { FeaturesGrid } from "./features-grid";
import { PricingBlock } from "./pricing-block";

import { ProjectReviews } from "./project-reviews";
import type { ProjectDetailData } from "@/types/api";

export function ProjectDetail({ project, currency }: { project: ProjectDetailData; currency: string }) {
  const mobileGallery = [project.images.desktop, project.images.mobile, ...project.images.extra].filter(
    (i): i is { url: string; alt: string } => !!i,
  );

  return (
    <article className="pb-16 lg:pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6">
      <div className="flex flex-col min-w-0">
          {/* Header */}
          <header>
            <Link href={`/projects?category=${project.category.slug}`} className="text-sm font-medium text-primary-text hover:underline">
              {project.category.name}
            </Link>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{project.name}</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{project.shortDescription}</p>
            {project.technologies.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {project.technologies.map((t) => (
                  <Badge key={t.name}>{t.name}</Badge>
                ))}
              </div>
            )}
            {(project.links.live || project.links.demo) && (
              <div className="mt-6 flex flex-wrap gap-3">
                {project.links.live && (
                  <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    View live
                  </a>
                )}
                {project.links.demo && (
                  <a href={project.links.demo} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-border bg-surface px-6 text-sm font-medium hover:bg-muted">
                    Demo login
                  </a>
                )}
              </div>
            )}
          </header>

          {/* Preview section */}
          {(project.images.desktop || project.images.mobile) && (
            <section className="mt-10">
              {/* Desktop: independent-scroll device frames, side by side, generous padding */}
              <div className="hidden gap-8 rounded-[var(--radius-2xl)] bg-muted p-10 lg:flex lg:items-start lg:justify-center">
                {project.images.desktop && (
                  <MonitorFrame src={project.images.desktop.url} alt={project.images.desktop.alt} className="max-w-2xl flex-1" />
                )}
                {project.images.mobile && (
                  <PhoneFrame src={project.images.mobile.url} alt={project.images.mobile.alt} />
                )}
              </div>
              {/* Mobile fallback: segmented gallery */}
              <div className="lg:hidden">
                <ScreenshotCarousel images={mobileGallery} />
              </div>
            </section>
          )}

          {/* Role tabs */}
          {project.roles.length > 0 && (
            <section className="mt-14">
              <h2 className="text-2xl font-semibold">Built for every role</h2>
              <div className="mt-6">
                <RoleTabs roles={project.roles} />
              </div>
            </section>
          )}

          {/* Features */}
          {project.features.length > 0 && (
            <section className="mt-14">
              <h2 className="text-2xl font-semibold">Features</h2>
              <div className="mt-6">
                <FeaturesGrid features={project.features} />
              </div>
            </section>
          )}

          {/* Pricing (mobile / inline; desktop numbers live in the sticky card) */}
          {project.pricing && (
            <section className="mt-14">
              <PricingBlock pricing={project.pricing} currency={currency} />
            </section>
          )}

          {/* Full description */}
          <section className="mt-14 max-w-2xl">
            <h2 className="text-2xl font-semibold">About this project</h2>
            <div className="prose-content mt-5 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
              {project.fullDescription.split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section className="mt-14">
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
              <ProjectReviews slug={project.slug} />
            </Suspense>
          </section>
      </div>
    </article>
  );
}
