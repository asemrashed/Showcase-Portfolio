import { getActor } from "@/lib/auth/session";
import { ProjectsList } from "@/components/dashboard/projects-list";

export default async function ProjectsPage() {
  const actor = await getActor();
  return <ProjectsList role={actor?.role} />;
}
