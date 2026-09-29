import "server-only";
import { db } from "@/lib/db";
import type { Actor } from "@/lib/auth/permissions";
import { conflict, notFound } from "@/lib/errors";
import type { TechnologyInput, TechnologyUpdateInput } from "@/lib/schemas/technology";
import * as audit from "./auditService";
import * as uploads from "./uploadService";

const nameTaken = (name: string, exceptId?: string) =>
  db.technology
    .findFirst({ where: { name: { equals: name, mode: "insensitive" }, ...(exceptId ? { id: { not: exceptId } } : {}) }, select: { id: true } })
    .then(Boolean);

async function load(id: string) {
  const t = await db.technology.findUnique({ where: { id } });
  if (!t) throw notFound("Technology not found");
  return t;
}

/** Catalog is small (a few dozen entries); no pagination, just name order. */
export const list = (_actor: Actor) => db.technology.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });

export const get = (_actor: Actor, id: string) => load(id);

export async function create(actor: Actor, input: TechnologyInput) {
  const name = input.name.trim();
  if (await nameTaken(name)) throw conflict("This technology already exists");
  // Only an icon we uploaded ourselves carries an iconKey; verify it actually matches the URL.
  if (input.iconKey) uploads.assertAsset({ url: input.icon ?? "", key: input.iconKey });

  const t = await db.$transaction(async (tx) => {
    const created = await tx.technology.create({
      data: {
        name,
        icon: input.icon ?? null,
        iconKey: input.iconKey ?? null,
        category: input.category ?? "OTHER",
        order: input.order ?? (await tx.technology.count()),
      },
    });
    await audit.log(tx, { actor, action: "technology.create", entity: "Technology", entityId: created.id, meta: { name: created.name } });
    return created;
  });
  return t;
}

export async function update(actor: Actor, id: string, input: TechnologyUpdateInput) {
  const existing = await load(id);
  const name = input.name?.trim();
  if (name && (await nameTaken(name, id))) throw conflict("This technology already exists");
  if (input.iconKey) uploads.assertAsset({ url: input.icon ?? "", key: input.iconKey });

  const t = await db.$transaction(async (tx) => {
    const updated = await tx.technology.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(input.icon !== undefined && { icon: input.icon }),
        ...(input.iconKey !== undefined && { iconKey: input.iconKey }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.order !== undefined && { order: input.order }),
      },
    });
    // Replacing/clearing a previously uploaded icon: queue the old object for deletion.
    if ((input.icon !== undefined || input.iconKey !== undefined) && existing.iconKey && existing.iconKey !== input.iconKey)
      await uploads.queueDeletion(tx, [existing.iconKey]);
    await audit.log(tx, { actor, action: "technology.update", entity: "Technology", entityId: id, meta: { fields: Object.keys(input) } });
    return updated;
  });
  await uploads.flushSoon();
  return t;
}

export async function remove(actor: Actor, id: string) {
  const t = await load(id);
  await db.$transaction(async (tx) => {
    await tx.technology.delete({ where: { id } });
    if (t.iconKey) await uploads.queueDeletion(tx, [t.iconKey]);
    await audit.log(tx, { actor, action: "technology.delete", entity: "Technology", entityId: id, meta: { name: t.name } });
  });
  await uploads.flushSoon();
  return { id };
}

export async function reorder(actor: Actor, items: { id: string; order: number }[]) {
  await db.$transaction([
    ...items.map((i) => db.technology.updateMany({ where: { id: i.id }, data: { order: i.order } })),
    db.auditLog.create({ data: { actorId: actor.id, actorEmail: actor.email, action: "technology.reorder", entity: "Technology", meta: { count: items.length } } }),
  ]);
  return { count: items.length };
}
