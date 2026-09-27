import { redirect } from "next/navigation";
import { getActor } from "@/lib/auth/session";
import { ProjectEditor } from "@/components/dashboard/project-editor/project-editor";

export default async function NewProjectPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");

  return <ProjectEditor projectId={null} project={null} role={actor.role} />;
}
