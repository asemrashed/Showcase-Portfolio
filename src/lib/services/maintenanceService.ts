import "server-only";
import { db } from "@/lib/db";
import * as audit from "./auditService";
import * as uploads from "./uploadService";

const PURGE_AFTER_DAYS = 30;

/** Hard-deletes projects soft-deleted more than N days ago and queues their storage objects. */
export async function purgeSoftDeletedProjects(limit = 50) {
  const cutoff = new Date(Date.now() - PURGE_AFTER_DAYS * 86_400_000);
  const stale = await db.project.findMany({
    where: { deletedAt: { lt: cutoff } },
    take: limit,
    include: { images: { select: { key: true } }, roles: { include: { images: { select: { key: true } } } } },
  });
  for (const p of stale) {
    const keys = [p.ogImageKey, ...p.images.map((i) => i.key), ...p.roles.flatMap((r) => r.images.map((i) => i.key))];
    await db.$transaction(async (tx) => {
      await uploads.queueDeletion(tx, keys);
      await tx.project.delete({ where: { id: p.id } });
      await audit.log(tx, { actor: null, action: "project.purge", entity: "Project", entityId: p.id, meta: { name: p.name } });
    });
  }
  return { purged: stale.length };
}

export async function runMaintenance() {
  const purged = await purgeSoftDeletedProjects();
  const storage = await uploads.flushPendingDeletions(200);
  return { ...purged, storage };
}
