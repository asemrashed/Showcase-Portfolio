import "server-only";
import type { Prisma, PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";
import { assertCan, type Actor } from "@/lib/auth/permissions";
import { paginated } from "@/lib/schemas/common";
import type { AuditQuery } from "@/lib/schemas/audit";

type Db = Prisma.TransactionClient | PrismaClient;

/** Pass the transaction client so the log commits/rolls back with the change. */
export async function log(
  client: Db,
  e: {
    actor: { id: string; email: string } | null;
    action: string;
    entity: string;
    entityId?: string | null;
    meta?: Prisma.InputJsonObject;
  },
) {
  await client.auditLog.create({
    data: {
      actorId: e.actor?.id ?? null,
      actorEmail: e.actor?.email ?? null,
      action: e.action,
      entity: e.entity,
      entityId: e.entityId ?? null,
      meta: e.meta,
    },
  });
}

export async function list(actor: Actor, q: AuditQuery) {
  assertCan(actor, "audit:view");
  const where: Prisma.AuditLogWhereInput = {
    ...(q.entity && { entity: q.entity }),
    ...(q.action && { action: { contains: q.action, mode: "insensitive" } }),
    ...(q.actorId && { actorId: q.actorId }),
    ...((q.from || q.to) && { createdAt: { ...(q.from && { gte: q.from }), ...(q.to && { lte: q.to }) } }),
  };
  const [items, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
    }),
    db.auditLog.count({ where }),
  ]);
  return paginated(items, total, q.page, q.pageSize);
}
