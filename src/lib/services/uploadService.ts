import "server-only";
import { randomUUID } from "node:crypto";
import type { Prisma, PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";
import { storage } from "@/lib/storage";
import { badRequest } from "@/lib/errors";
import { assertRate } from "@/lib/rate-limit";
import { ALLOWED_MIME, UPLOAD_FOLDERS, type PresignInput } from "@/lib/schemas/upload";

type Db = Prisma.TransactionClient | PrismaClient;

const KEY_RE = new RegExp(`^(${UPLOAD_FOLDERS.join("|")})/\\d{4}/\\d{2}/[0-9a-f-]{36}\\.(jpg|png|webp|avif)$`);

export async function createPresign(actorId: string, input: PresignInput) {
  assertRate(`presign:${actorId}`, { limit: 60, windowMs: 60_000 });
  const rawExt = input.filename.split(".").pop()!.toLowerCase();
  const ext = (ALLOWED_MIME[input.contentType] as readonly string[]).includes(rawExt)
    ? rawExt === "jpeg"
      ? "jpg"
      : rawExt
    : ALLOWED_MIME[input.contentType][0];
  const d = new Date();
  const key = `${input.folder}/${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}.${ext}`;
  return storage.presignPut({ key, contentType: input.contentType, size: input.size, expiresIn: 300 });
}

/**
 * Never trust client-supplied url/key pairs: the key must have been minted by createPresign's
 * format and the url must be our provider's deterministic public URL for that key. Prevents
 * arbitrary-key deletion and hot-linking of foreign URLs.
 */
export function assertAsset(a: { url: string; key: string }) {
  if (!KEY_RE.test(a.key) || a.key.includes("..")) throw badRequest("Invalid asset key");
  if (a.url !== storage.publicUrl(a.key)) throw badRequest("Asset URL does not match its key");
}
export function assertAssets(list: Array<{ url: string; key: string } | null | undefined>) {
  for (const a of list) if (a) assertAsset(a);
}

export async function queueDeletion(client: Db, keys: Array<string | null | undefined>) {
  const unique = [...new Set(keys.filter((k): k is string => !!k))];
  if (unique.length) await client.pendingDeletion.createMany({ data: unique.map((key) => ({ key })), skipDuplicates: true });
}

/** A key may be re-used by another record; never delete an object that is still referenced. */
async function isReferenced(key: string) {
  const counts = await Promise.all([
    db.projectImage.count({ where: { key } }),
    db.projectRoleImage.count({ where: { key } }),
    db.project.count({ where: { ogImageKey: key } }),
    db.category.count({ where: { imageKey: key } }),
    db.heroSlide.count({ where: { imageKey: key } }),
    db.review.count({ where: { avatarKey: key } }),
    db.aboutSection.count({ where: { imageKey: key } }),
    db.siteSettings.count({ where: { OR: [{ logoKey: key }, { defaultOgImageKey: key }] } }),
    db.technology.count({ where: { iconKey: key } }),
  ]);
  return counts.some((c) => c > 0);
}

export async function flushPendingDeletions(limit = 25) {
  const items = await db.pendingDeletion.findMany({
    where: { attempts: { lt: 5 } },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  let deleted = 0;
  let failed = 0;
  for (const it of items) {
    try {
      if (!(await isReferenced(it.key))) await storage.deleteObject(it.key);
      await db.pendingDeletion.delete({ where: { id: it.id } });
      deleted++;
    } catch (e) {
      console.error("[r2] delete failed", it.key, e);
      await db.pendingDeletion.update({ where: { id: it.id }, data: { attempts: { increment: 1 } } });
      failed++;
    }
  }
  return { deleted, failed };
}

/** Best-effort cleanup right after a commit; the cron job catches anything left over. */
export async function flushSoon() {
  await flushPendingDeletions(10).catch(() => undefined);
}
