import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { CategoryGrid } from "@/components/categories/category-card";
import { ProjectGrid } from "@/components/project/project-grid";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Code-split embla-carousel out of the initial bundle for pages below the fold that use it.
const ReviewCarousel = dynamic(() => import("@/components/home/review-carousel").then((m) => m.ReviewCarousel), {
  loading: () => <Skeleton className="h-64 w-full" />,
});
import { AboutTeaser } from "@/components/home/about-teaser";
import { ContactCta } from "@/components/home/contact-cta";
import { Section, SectionHeading } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/state";
import { Button } from "@/components/ui/button";
import { load } from "@/lib/data";
import { getHero, getCategories, getProjects, getReviews, getAbout } from "@/lib/queries/public";

export const metadata: Metadata = {
  title: "Project Showcase — software we've built, shown properly",
  alternates: { canonical: siteUrl },
};

export default async function HomePage() {
  const [hero, categories, featured, reviews, about] = await Promise.all([
    load(() => getHero(), []),
    load(() => getCategories(), []),
    load(() => getProjects({ page: 1, pageSize: 6, featured: true }), { items: [], page: 1, pageSize: 6, total: 0, totalPages: 1 }),
    load(() => getReviews({ limit: 9 }), []),
    load(() => getAbout(), null),
  ]);

  return (
    <>
      <HeroCarousel slides={hero} />

      {categories.length > 0 && (
        <Section>
          <SectionHeading eyebrow="Categories" title="Explore by category" description="Every project sorted into the kind of work it is." />
          <div className="mt-10">
            <CategoryGrid categories={categories.slice(0, 6)} />
          </div>
        </Section>
      )}

      <Section className="border-t border-border">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Selected work" title="Featured projects" />
          <Button asChild variant="ghost">
            <Link href="/projects">
              View all
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-10">
          {featured.items.length > 0 ? (
            <ProjectGrid projects={featured.items} />
          ) : (
            <EmptyState title="No featured projects yet" description="Check back soon, or browse everything we've shipped." action={{ label: "Browse all projects", href: "/projects" }} />
          )}
        </div>
      </Section>

      {reviews.length > 0 && (
        <Section className="border-t border-border">
          <SectionHeading eyebrow="Client reviews" title="What people say" />
          <div className="mt-10">
            <ReviewCarousel reviews={reviews} />
          </div>
        </Section>
      )}

      {about && <AboutTeaser about={about} />}

      <ContactCta />
    </>
  );
}
