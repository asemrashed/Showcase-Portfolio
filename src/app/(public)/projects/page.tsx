import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import { Suspense } from "react";
import { Section, SectionHeading } from "@/components/ui/section";
import { ProjectGridSkeleton } from "@/components/ui/skeleton";
import { ProjectsExplorer } from "@/components/project/projects-explorer";
import { load } from "@/lib/data";
import { getProjects } from "@/lib/queries/public";

export const metadata: Metadata = {
  title: "Projects",
  description: "Every project we've published — filter by category or search by name and tech.",
  alternates: { canonical: `${siteUrl}/projects` },
};

export default async function ProjectsPage() {
  const initialData = await load(() => getProjects({ page: 1, pageSize: 12 }), {
    items: [],
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 1,
  });

  return (
    <Section className="pt-14 sm:pt-16">
      <SectionHeading eyebrow="Work" title="Projects" description="Filter by category or search by name and technology." />
      <div className="mt-10">
        <Suspense fallback={<ProjectGridSkeleton />}>
          <ProjectsExplorer initialData={initialData} />
        </Suspense>
      </div>
    </Section>
  );
}
