import type { ReactNode } from "react";
import type { UserRole } from "@prisma/client";
import { DashboardSidebar } from "./sidebar";
import { DashboardTopbar } from "./topbar";

export function DashboardShell({
  role,
  name,
  email,
  siteName,
  children,
}: {
  role: UserRole;
  name: string | null;
  email: string;
  siteName: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--radius-md)] focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <DashboardSidebar role={role} siteName={siteName} />
      <div className="flex h-dvh min-w-0 flex-1 flex-col overflow-y-auto thin-scroll">
        <DashboardTopbar name={name} email={email} role={role} />
        <main id="dashboard-main" className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
