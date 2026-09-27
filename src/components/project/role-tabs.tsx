"use client";
import * as Tabs from "@radix-ui/react-tabs";
import { RoleScreenshotGroup } from "./role-screenshot-group";
import { cn } from "@/lib/utils";
import type { ProjectDetailData } from "@/types/api";

export function RoleTabs({ roles }: { roles: ProjectDetailData["roles"] }) {
  if (roles.length === 0) return null;

  return (
    <Tabs.Root defaultValue={roles[0].id} className="w-full">
      <Tabs.List className="flex gap-1 overflow-x-auto border-b border-border no-scrollbar" aria-label="Views by role">
        {roles.map((role) => (
          <Tabs.Trigger
            key={role.id}
            value={role.id}
            className={cn(
              "shrink-0 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-colors",
              "data-[state=active]:border-primary data-[state=active]:text-foreground",
              "hover:text-foreground focus-visible:outline-none",
            )}
          >
            {role.name}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {roles.map((role) => (
        // forceMount off (default): Radix only renders the active panel's children,
        // so an inactive role's images never mount until its tab is selected.
        <Tabs.Content key={role.id} value={role.id} className="pt-6 focus-visible:outline-none">
          {role.description && <p className="mb-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{role.description}</p>}
          <RoleScreenshotGroup images={role.images} />
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
