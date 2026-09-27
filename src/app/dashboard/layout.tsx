import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getActor } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { load } from "@/lib/data";
import { getSettings } from "@/lib/queries/public";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Defense-in-depth: middleware already gates /dashboard, this covers direct RSC access too.
  const actor = await getActor();
  if (!actor) redirect("/login?callbackUrl=/dashboard");

  const settings = await load(() => getSettings(), null);

  return (
    <DashboardShell role={actor.role} name={actor.name} email={actor.email} siteName={settings?.siteName ?? "Project Showcase"}>
      {children}
    </DashboardShell>
  );
}
