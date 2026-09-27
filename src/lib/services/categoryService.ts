import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { Actor } from "@/lib/auth/permissions";
import { conflict, notFound } from "@/lib/errors";
import { slugify, uniqueSlug } from "@/lib/slug";
import { revalidate, TAGS } from "@/lib/cache";
import type { CategoryInput, CategoryUpdateInput } from "@/lib/schemas/category";
import * as audit from "./auditService";
import * as uploads from "./uploadService";

const withCount = {
  _count: { select: { projects: { where: { deletedAt: null } } } },
} satisfies Prisma.CategoryInclude;

const slugTaken = (slug: string, exceptId?: string) =>
  db.category.findFirst({ where: { slug, ...(exceptId ? { id: { not: exceptId } } : {}) }, select: { id: true } }).then(Boolean);

async function load(id: string) {
  const c = await db.category.findFirst({ where: { id, deletedAt: null }, include: withCount });
  if (!c) throw notFound("Category not found");
  return c;
}

export const list = (_actor: Actor) =>
  db.category.findMany({ where: { deletedAt: null }, orderBy: [{ order: "asc" }, { name: "asc" }], include: withCount });

export const get = (_actor: Actor, id: string) => load(id);

export async function create(actor: Actor, input: CategoryInput) {
  uploads.assertAssets([input.image]);
  let slug = input.slug;
  if (slug) {
    if (await slugTaken(slug)) throw conflict("Slug already in use");
  } else {
    slug = await uniqueSlug(slugify(input.name), slugTaken);
  }
  const c = await db.$transaction(async (tx) => {
    const created = await tx.category.create({
      data: {
        name: input.name,
        slug: slug!,
        description: input.description ?? null,
        imageUrl: input.image?.url ?? null,
        imageKey: input.image?.key ?? null,
        imageAlt: input.image?.alt ?? null,
        order: input.order ?? (await tx.category.count({ where: { deletedAt: null } })),
      },
    });
    await audit.log(tx, { actor, action: "category.create", entity: "Category", entityId: created.id, meta: { name: created.name } });
    return created;
  });
  revalidate(TAGS.categories);
  return c;
}

export async function update(actor: Actor, id: string, input: CategoryUpdateInput) {
  const existing = await load(id);
  uploads.assertAssets([input.image]);
  if (input.slug && input.slug !== existing.slug && (await slugTaken(input.slug, id))) throw conflict("Slug already in use");

  const updated = await db.$transaction(async (tx) => {
    const c = await tx.category.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.order !== undefined && { order: input.order }),
        ...(input.image !== undefined && {
          imageUrl: input.image?.url ?? null,
          imageKey: input.image?.key ?? null,
          imageAlt: input.image?.alt ?? null,
        }),
      },
    });
    if (input.image !== undefined && existing.imageKey && existing.imageKey !== input.image?.key)
      await uploads.queueDeletion(tx, [existing.imageKey]);
    await audit.log(tx, { actor, action: "category.update", entity: "Category", entityId: id, meta: { fields: Object.keys(input) } });
    return c;
  });
  await uploads.flushSoon();
  revalidate(TAGS.categories, TAGS.projects);
  return updated;
}

export async function remove(actor: Actor, id: string) {
  const c = await load(id);
  if (c._count.projects > 0)
    throw conflict(`This category still has ${c._count.projects} project(s). Move or delete them first.`);
  await db.$transaction(async (tx) => {
    await tx.category.update({
      where: { id },
      data: { deletedAt: new Date(), slug: `${c.slug}--deleted-${Date.now().toString(36)}` },
    });
    await audit.log(tx, { actor, action: "category.delete", entity: "Category", entityId: id, meta: { name: c.name, slug: c.slug } });
  });
  revalidate(TAGS.categories);
  return { id };
}

export async function reorder(actor: Actor, items: { id: string; order: number }[]) {
  await db.$transaction([
    ...items.map((i) => db.category.updateMany({ where: { id: i.id, deletedAt: null }, data: { order: i.order } })),
    db.auditLog.create({ data: { actorId: actor.id, actorEmail: actor.email, action: "category.reorder", entity: "Category", meta: { count: items.length } } }),
  ]);
  revalidate(TAGS.categories);
  return { count: items.length };
}
