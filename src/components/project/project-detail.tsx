import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { TechBadge } from "./tech-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DeviceShowcase } from "./device-showcase";
import { RoleTabs } from "./role-tabs";
import { FeaturesGrid } from "./features-grid";
import { PricingBlock } from "./pricing-block";

import { ProjectReviews } from "./project-reviews";
import type { ProjectDetailData } from "@/types/api";

export function ProjectDetail({ project, currency }: { project: ProjectDetailData; currency: string }) {
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
                  <TechBadge key={t.name} name={t.name} icon={t.icon} />
                ))}
              </div>
            )}
            {(project.links.demo || project.links.live) && (
              <div className="mt-6 flex flex-wrap gap-3">
                {project.links.demo && (
                  <Button asChild size="lg">
                    <a href={project.links.demo} target="_blank" rel="noopener noreferrer">
                      Demo Link
                    </a>
                  </Button>
                )}
                {project.links.live && (
                  <Button asChild size="lg" variant="secondary">
                    <a href={project.links.live} target="_blank" rel="noopener noreferrer">
                      View live
                    </a>
                  </Button>
                )}
              </div>
            )}
          </header>

          {/* Preview section: full-page desktop + mobile screenshots, scrollable inside device frames */}
          {(project.images.desktop || project.images.mobile) && (
            <section className="mt-10">
              <DeviceShowcase
                desktop={project.images.desktop ? [project.images.desktop] : []}
                mobile={project.images.mobile ? [project.images.mobile] : []}
                priority
                className="rounded-[var(--radius-2xl)] bg-muted p-4 sm:p-6 lg:p-10"
              />
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
