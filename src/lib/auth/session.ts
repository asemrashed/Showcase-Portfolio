import "server-only";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { unauthorized } from "@/lib/errors";
import type { Actor } from "@/lib/auth/permissions";

/**
 * Resolves the current user from the JWT *and* re-checks the DB, so deactivated users,
 * role changes and password changes (sessionVersion bump) take effect immediately.
 */
export async function getActor(): Promise<Actor | null> {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return null;
  const u = await db.user.findUnique({
    where: { id: uid },
    select: { id: true, email: true, name: true, role: true, active: true, sessionVersion: true },
  });
  if (!u || !u.active || u.sessionVersion !== session.user.sessionVersion) return null;
  return { id: u.id, email: u.email, name: u.name, role: u.role };
}

export async function requireActor(): Promise<Actor> {
  const actor = await getActor();
  if (!actor) throw unauthorized();
  return actor;
}
