import "server-only";
import { db } from "@/lib/db";
import type { Actor } from "@/lib/auth/permissions";
import { notFound, validation } from "@/lib/errors";
import { revalidate, TAGS } from "@/lib/cache";
import type { HeroSlideInput, HeroSlideUpdateInput } from "@/lib/schemas/hero";
import * as audit from "./auditService";
import * as uploads from "./uploadService";

async function assertProject(id?: string | null) {
  if (!id) return;
  const p = await db.project.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  if (!p) throw validation("Linked project does not exist", { projectId: ["Project does not exist"] });
}

async function load(id: string) {
  const s = await db.heroSlide.findUnique({ where: { id } });
  if (!s) throw notFound("Hero slide not found");
  return s;
}

export const list = (_actor: Actor) =>
  db.heroSlide.findMany({
    orderBy: { order: "asc" },
    include: { project: { select: { id: true, name: true, slug: true } } },
  });
export const get = (_actor: Actor, id: string) => load(id);

export async function create(actor: Actor, input: HeroSlideInput) {
  uploads.assertAsset(input.image);
  await assertProject(input.projectId);
  const slide = await db.$transaction(async (tx) => {
    const s = await tx.heroSlide.create({
      data: {
        title: input.title,
        subtitle: input.subtitle ?? null,
        ctaLabel: input.ctaLabel ?? null,
        ctaUrl: input.ctaUrl ?? null,
        imageUrl: input.image.url,
        imageKey: input.image.key,
        imageAlt: input.image.alt,
        projectId: input.projectId ?? null,
        active: input.active,
        order: input.order ?? (await tx.heroSlide.count()),
      },
    });
    await audit.log(tx, { actor, action: "hero.create", entity: "HeroSlide", entityId: s.id, meta: { title: s.title } });
    return s;
  });
  revalidate(TAGS.hero);
  return slide;
}

export async function update(actor: Actor, id: string, input: HeroSlideUpdateInput) {
  const existing = await load(id);
  if (input.image) uploads.assertAsset(input.image);
  if (input.projectId !== undefined) await assertProject(input.projectId);
  const slide = await db.$transaction(async (tx) => {
    const s = await tx.heroSlide.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.subtitle !== undefined && { subtitle: input.subtitle }),
        ...(input.ctaLabel !== undefined && { ctaLabel: input.ctaLabel }),
        ...(input.ctaUrl !== undefined && { ctaUrl: input.ctaUrl }),
        ...(input.projectId !== undefined && { projectId: input.projectId }),
        ...(input.active !== undefined && { active: input.active }),
        ...(input.order !== undefined && { order: input.order }),
        ...(input.image && { imageUrl: input.image.url, imageKey: input.image.key, imageAlt: input.image.alt }),
      },
    });
    if (input.image && existing.imageKey !== input.image.key) await uploads.queueDeletion(tx, [existing.imageKey]);
    await audit.log(tx, { actor, action: "hero.update", entity: "HeroSlide", entityId: id, meta: { fields: Object.keys(input) } });
    return s;
  });
  await uploads.flushSoon();
  revalidate(TAGS.hero);
  return slide;
}

export async function remove(actor: Actor, id: string) {
  const s = await load(id);
  await db.$transaction(async (tx) => {
    await tx.heroSlide.delete({ where: { id } });
    await uploads.queueDeletion(tx, [s.imageKey]);
    await audit.log(tx, { actor, action: "hero.delete", entity: "HeroSlide", entityId: id, meta: { title: s.title } });
  });
  await uploads.flushSoon();
  revalidate(TAGS.hero);
  return { id };
}

export async function reorder(actor: Actor, items: { id: string; order: number }[]) {
  await db.$transaction([
    ...items.map((i) => db.heroSlide.updateMany({ where: { id: i.id }, data: { order: i.order } })),
    db.auditLog.create({ data: { actorId: actor.id, actorEmail: actor.email, action: "hero.reorder", entity: "HeroSlide", meta: { count: items.length } } }),
  ]);
  revalidate(TAGS.hero);
  return { count: items.length };
}
