"use client";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import type { UserRole } from "@prisma/client";
import { useDashboardUIStore } from "@/stores/dashboard-ui-store";
import { navForRole } from "@/lib/dashboard-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "./user-menu";

function pageTitle(pathname: string, role: UserRole) {
  const items = navForRole(role);
  const match = items.find((i) => pathname === i.href || (i.href !== "/dashboard" && pathname.startsWith(i.href + "/")));
  if (match) return match.label;
  const last = pathname.split("/").filter(Boolean).pop() ?? "Dashboard";
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
}

export function DashboardTopbar({ name, email, role }: { name: string | null; email: string; role: UserRole }) {
  const pathname = usePathname();
  const setMobileSidebarOpen = useDashboardUIStore((s) => s.setMobileSidebarOpen);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMobileSidebarOpen(true)}
          className="flex size-9 items-center justify-center rounded-[var(--radius-md)] text-foreground hover:bg-muted md:hidden"
        >
          <Menu className="size-5" />
        </button>
        <h1 className="text-base font-medium">{pageTitle(pathname, role)}</h1>
      </div>
      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <UserMenu name={name} email={email} role={role} />
      </div>
    </header>
  );
}
