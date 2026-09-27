"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import type { UserRole } from "@prisma/client";
import { useDashboardUIStore } from "@/stores/dashboard-ui-store";
import { navForRole } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

function NavLinks({ role, collapsed, onNavigate }: { role: UserRole; collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = navForRole(role);

  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto thin-scroll px-2.5 py-3">
      {items.map((item, i) => {
        // "Projects" appears once per role (label differs by role) but shares one href — de-dupe safety.
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
        return (
          <Link
            key={item.href + item.label + i}
            href={item.href}
            title={collapsed ? item.label : undefined}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
              collapsed && "justify-center px-0",
              active ? "bg-primary-soft text-primary-text" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-[18px] shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar({ role, siteName }: { role: UserRole; siteName: string }) {
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useDashboardUIStore();

  return (
    <>
      {/* Desktop: fixed column, own scroll */}
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 md:flex",
          sidebarCollapsed ? "w-[68px]" : "w-64",
        )}
      >
        <div className={cn("flex h-16 shrink-0 items-center border-b border-border px-4", sidebarCollapsed && "justify-center px-0")}>
          {!sidebarCollapsed && <Link href="/dashboard" className="truncate font-display text-base font-semibold">{siteName}</Link>}
        </div>
        <NavLinks role={role} collapsed={sidebarCollapsed} />
        <div className="border-t border-border p-2.5">
          <button
            type="button"
            onClick={toggleSidebar}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              sidebarCollapsed && "justify-center px-0",
            )}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="size-[18px]" /> : <PanelLeftClose className="size-[18px]" />}
            {!sidebarCollapsed && "Collapse"}
          </button>
        </div>
      </aside>

      {/* Mobile: slide-over */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface shadow-xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
              <span className="font-display text-base font-semibold">{siteName}</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>
            <NavLinks role={role} collapsed={false} onNavigate={() => setMobileSidebarOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
