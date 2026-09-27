import "server-only";
import { db } from "@/lib/db";
import type { Actor } from "@/lib/auth/permissions";
import { notFound, validation } from "@/lib/errors";
import { revalidate, TAGS } from "@/lib/cache";
import type { ReviewInput, ReviewUpdateInput } from "@/lib/schemas/review";
import * as audit from "./auditService";
import * as uploads from "./uploadService";

async function assertProject(id?: string | null) {
  if (!id) return;
  const p = await db.project.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  if (!p) throw validation("Linked project does not exist", { projectId: ["Project does not exist"] });
}

async function load(id: string) {
  const r = await db.review.findFirst({ where: { id, deletedAt: null } });
  if (!r) throw notFound("Review not found");
  return r;
}

export const list = (_actor: Actor) =>
  db.review.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    take: 500,
    include: { project: { select: { id: true, name: true, slug: true } } },
  });
export const get = (_actor: Actor, id: string) => load(id);

export async function create(actor: Actor, input: ReviewInput) {
  uploads.assertAssets([input.avatar]);
  await assertProject(input.projectId);
  const review = await db.$transaction(async (tx) => {
    const r = await tx.review.create({
      data: {
        authorName: input.authorName,
        authorRole: input.authorRole ?? null,
        company: input.company ?? null,
        avatarUrl: input.avatar?.url ?? null,
        avatarKey: input.avatar?.key ?? null,
        rating: input.rating,
        content: input.content,
        projectId: input.projectId ?? null,
        published: input.published,
        order: input.order ?? (await tx.review.count({ where: { deletedAt: null } })),
      },
    });
    await audit.log(tx, { actor, action: "review.create", entity: "Review", entityId: r.id, meta: { author: r.authorName } });
    return r;
  });
  revalidate(TAGS.reviews);
  return review;
}

export async function update(actor: Actor, id: string, input: ReviewUpdateInput) {
  const existing = await load(id);
  uploads.assertAssets([input.avatar]);
  if (input.projectId !== undefined) await assertProject(input.projectId);
  const review = await db.$transaction(async (tx) => {
    const r = await tx.review.update({
      where: { id },
      data: {
        ...(input.authorName !== undefined && { authorName: input.authorName }),
        ...(input.authorRole !== undefined && { authorRole: input.authorRole }),
        ...(input.company !== undefined && { company: input.company }),
        ...(input.rating !== undefined && { rating: input.rating }),
        ...(input.content !== undefined && { content: input.content }),
        ...(input.projectId !== undefined && { projectId: input.projectId }),
        ...(input.published !== undefined && { published: input.published }),
        ...(input.order !== undefined && { order: input.order }),
        ...(input.avatar !== undefined && { avatarUrl: input.avatar?.url ?? null, avatarKey: input.avatar?.key ?? null }),
      },
    });
    if (input.avatar !== undefined && existing.avatarKey && existing.avatarKey !== input.avatar?.key)
      await uploads.queueDeletion(tx, [existing.avatarKey]);
    await audit.log(tx, { actor, action: "review.update", entity: "Review", entityId: id, meta: { fields: Object.keys(input) } });
    return r;
  });
  await uploads.flushSoon();
  revalidate(TAGS.reviews);
  return review;
}

export async function remove(actor: Actor, id: string) {
  const r = await load(id);
  await db.$transaction(async (tx) => {
    await tx.review.update({ where: { id }, data: { deletedAt: new Date(), published: false } });
    await audit.log(tx, { actor, action: "review.delete", entity: "Review", entityId: id, meta: { author: r.authorName } });
  });
  revalidate(TAGS.reviews);
  return { id };
}

export async function reorder(actor: Actor, items: { id: string; order: number }[]) {
  await db.$transaction([
    ...items.map((i) => db.review.updateMany({ where: { id: i.id, deletedAt: null }, data: { order: i.order } })),
    db.auditLog.create({ data: { actorId: actor.id, actorEmail: actor.email, action: "review.reorder", entity: "Review", meta: { count: items.length } } }),
  ]);
  revalidate(TAGS.reviews);
  return { count: items.length };
}
