import { redirect, notFound } from "next/navigation";
import { getActor } from "@/lib/auth/session";
import * as projectService from "@/lib/services/projectService";
import { ProjectEditor } from "@/components/dashboard/project-editor/project-editor";

type Props = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const actor = await getActor();
  if (!actor) redirect("/login");

  let project;
  try {
    project = await projectService.get(actor, id);
  } catch {
    notFound();
  }

  return <ProjectEditor projectId={id} project={project} role={actor.role} />;
}
