import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { can, type Actor } from "@/lib/auth/permissions";

export async function overview(actor: Actor) {
  const scope: Prisma.ProjectWhereInput = {
    deletedAt: null,
    ...(can(actor, "project:list:all") ? {} : { createdById: actor.id }),
  };
  const isAdmin = can(actor, "message:manage");
  const isSuper = can(actor, "audit:view");

  const [grouped, recentProjects, newMessages, recentMessages, recentActivity, userCount] = await Promise.all([
    db.project.groupBy({ by: ["status"], where: scope, _count: { _all: true } }),
    db.project.findMany({
      where: scope,
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, name: true, slug: true, status: true, updatedAt: true },
    }),
    isAdmin ? db.contactMessage.count({ where: { status: "NEW" } }) : Promise.resolve(null),
    isAdmin
      ? db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, subject: true, status: true, createdAt: true } })
      : Promise.resolve([]),
    db.auditLog.findMany({
      where: isSuper ? {} : { actorId: actor.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, action: true, entity: true, entityId: true, actorEmail: true, createdAt: true },
    }),
    isSuper ? db.user.count() : Promise.resolve(null),
  ]);

  const byStatus = { DRAFT: 0, PENDING: 0, PUBLISHED: 0, ARCHIVED: 0 };
  for (const g of grouped) byStatus[g.status] = g._count._all;

  return {
    stats: { projects: byStatus, totalProjects: Object.values(byStatus).reduce((a, b) => a + b, 0), newMessages, users: userCount },
    recentProjects,
    recentMessages,
    recentActivity,
  };
}
