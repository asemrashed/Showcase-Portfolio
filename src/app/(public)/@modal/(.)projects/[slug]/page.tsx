import { notFound } from "next/navigation";
import { ProjectSheet } from "@/components/project/project-sheet";
import { ProjectDetail } from "@/components/project/project-detail";
import { load } from "@/lib/data";
import { getProjectBySlug, getSettings } from "@/lib/queries/public";

type Props = { params: Promise<{ slug: string }> };

export default async function ProjectModal({ params }: Props) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([load(() => getProjectBySlug(slug), null), load(() => getSettings(), null)]);

  if (!project) notFound();

  return (
    <ProjectSheet title={project.name}>
      <div className="px-5 pt-6 sm:px-8">
        <ProjectDetail project={project} currency={settings?.currency ?? "USD"} />
      </div>
    </ProjectSheet>
  );
}
