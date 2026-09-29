import type { ProjectStatus, UserRole } from "@prisma/client";
import { forbidden } from "@/lib/errors";

export type Actor = { id: string; email: string; name: string | null; role: UserRole };

export type Action =
  | "project:create"
  | "project:read"
  | "project:edit"
  | "project:submit"
  | "project:delete"
  | "project:list:all"
  | "project:setPrice"
  | "project:feature"
  | "project:publish"
  | "project:reject"
  | "project:archive"
  | "category:manage"
  | "technology:manage"
  | "hero:manage"
  | "review:manage"
  | "about:manage"
  | "contactInfo:manage"
  | "settings:manage"
  | "message:manage"
  | "user:manage"
  | "audit:view"
  | "upload:presign";

/** Actions a DEVELOPER may only perform on projects they own. */
const OWNER_SCOPED: readonly Action[] = ["project:read", "project:edit", "project:submit", "project:delete"];

// Every project has its own tech stack, so all three roles can maintain the shared technology catalog.
const DEVELOPER = new Set<Action>(["project:create", "upload:presign", "technology:manage", ...OWNER_SCOPED]);
const ADMIN = new Set<Action>([
  ...DEVELOPER,
  "project:list:all",
  "project:setPrice",
  "project:feature",
  "project:publish",
  "project:reject",
  "project:archive",
  "category:manage",
  "hero:manage",
  "review:manage",
  "about:manage",
  "contactInfo:manage",
  "settings:manage",
  "message:manage",
]);
const SUPER_ADMIN = new Set<Action>([...ADMIN, "user:manage", "audit:view"]);

const BY_ROLE: Record<UserRole, Set<Action>> = { DEVELOPER, ADMIN, SUPER_ADMIN };

export type ProjectResource = { ownerId?: string | null; status?: ProjectStatus };

/**
 * can(user, action, resource)
 * Developers: only own projects; read any status, but edit/submit/delete only while DRAFT
 * (once submitted the project is locked for review until an admin rejects it back).
 */
export function can(user: Pick<Actor, "id" | "role">, action: Action, resource?: ProjectResource): boolean {
  if (!BY_ROLE[user.role].has(action)) return false;
  if (user.role === "DEVELOPER" && OWNER_SCOPED.includes(action)) {
    if (!resource?.ownerId || resource.ownerId !== user.id) return false;
    if (action !== "project:read" && resource.status !== "DRAFT") return false;
  }
  return true;
}

export function assertCan(user: Pick<Actor, "id" | "role">, action: Action, resource?: ProjectResource) {
  if (!can(user, action, resource)) throw forbidden();
}
