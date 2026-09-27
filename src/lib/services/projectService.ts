import "server-only";
import type { Prisma, ProjectStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { assertCan, can, type Actor } from "@/lib/auth/permissions";
import { AppError, conflict, forbidden, notFound, validation } from "@/lib/errors";
import { slugify, uniqueSlug } from "@/lib/slug";
import { revalidateProjectGraph } from "@/lib/cache";
import { paginated } from "@/lib/schemas/common";
import {
  ADMIN_ONLY_KEYS,
  PRICE_KEYS,
  type DashboardProjectQuery,
  type ProjectCreateInput,
  type ProjectImageCreateInput,
  type ProjectPublishInput,
  type ProjectUpdateInput,
} from "@/lib/schemas/project";
import * as audit from "./auditService";
import * as uploads from "./uploadService";

const include = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: [{ type: "asc" }, { order: "asc" }] },
  roles: { orderBy: { order: "asc" }, include: { images: { orderBy: { order: "asc" } } } },
  features: { orderBy: { order: "asc" } },
  technologies: { orderBy: { order: "asc" } },
} satisfies Prisma.ProjectInclude;
type ProjectFull = Prisma.ProjectGetPayload<{ include: typeof include }>;

/** Workflow: DRAFT → PENDING → PUBLISHED → ARCHIVED; PENDING → DRAFT (rejected); ARCHIVED → DRAFT (restore). */
const TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  DRAFT: ["PENDING", "PUBLISHED"],
  PENDING: ["PUBLISHED", "DRAFT"],
  PUBLISHED: ["ARCHIVED"],
  ARCHIVED: ["DRAFT"],
};
function assertTransition(from: ProjectStatus, to: ProjectStatus) {
  if (!TRANSITIONS[from].includes(to))
    throw new AppError("INVALID_TRANSITION", `Cannot move a project from ${from} to ${to}`);
}

const ctx = (p: { createdById: string | null; status: ProjectStatus }) => ({ ownerId: p.createdById, status: p.status });

async function load(id: string): Promise<ProjectFull> {
  const p = await db.project.findFirst({ where: { id, deletedAt: null }, include });
  if (!p) throw notFound("Project not found");
  return p;
}

/** Devs must not be able to set price/duration/featured/order — reject if the keys are present at all. */
function assertAdminFields(actor: Actor, input: ProjectUpdateInput) {
  const has = (keys: readonly string[]) => keys.some((k) => (input as Record<string, unknown>)[k] !== undefined);
  if (has(PRICE_KEYS) && !can(actor, "project:setPrice")) throw forbidden("Only admins can set price or duration");
  if (has(["featured", "order"]) && !can(actor, "project:feature")) throw forbidden("Only admins can set featured/order");
  void ADMIN_ONLY_KEYS;
}

function assertReady(p: ProjectFull) {
  const missing: string[] = [];
  if (!p.images.some((i) => i.type === "MAIN")) missing.push("main image");
  if (p.technologies.length === 0) missing.push("at least one technology");
  if (missing.length) throw validation(`Project is incomplete: add ${missing.join(" and ")}`);
}

async function assertCategory(id: string) {
  const c = await db.category.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  if (!c) throw validation("Category does not exist", { categoryId: ["Category does not exist"] });
}

async function slugFree(slug: string, exceptId?: string) {
  const hit = await db.project.findFirst({
    where: { slug, ...(exceptId ? { id: { not: exceptId } } : {}) },
    select: { id: true },
  });
  return !hit;
}
async function resolveSlug(explicit: string | undefined, name: string) {
  if (explicit) {
    if (!(await slugFree(explicit))) throw conflict("Slug already in use");
    return explicit;
  }
  return uniqueSlug(slugify(name), async (s) => !(await slugFree(s)));
}

const SCALAR_KEYS = [
  "name",
  "shortDescription",
  "fullDescription",
  "categoryId",
  "featured",
  "order",
  "liveUrl",
  "demoUrl",
  "repoUrl",
  "metaTitle",
  "metaDescription",
  ...PRICE_KEYS,
] as const;

function scalarData(i: ProjectUpdateInput) {
  const d: Record<string, unknown> = {};
  for (const k of SCALAR_KEYS) if (i[k] !== undefined) d[k] = i[k];
  if (i.ogImage !== undefined) {
    d.ogImageUrl = i.ogImage?.url ?? null;
    d.ogImageKey = i.ogImage?.key ?? null;
  }
  return d;
}

async function writeChildren(tx: Prisma.TransactionClient, projectId: string, i: ProjectUpdateInput) {
  if (i.roles) {
    await tx.projectRole.deleteMany({ where: { projectId } });
    for (const [idx, r] of i.roles.entries()) {
      await tx.projectRole.create({
        data: {
          projectId,
          name: r.name,
          description: r.description ?? null,
          order: idx,
          images: {
            create: r.images.map((im, j) => ({ url: im.url, key: im.key, alt: im.alt, device: im.device, order: j })),
          },
        },
      });
    }
  }
  if (i.features) {
    await tx.projectFeature.deleteMany({ where: { projectId } });
    await tx.projectFeature.createMany({
      data: i.features.map((f, idx) => ({ projectId, title: f.title, description: f.description, icon: f.icon ?? null, order: idx })),
    });
  }
  if (i.technologies) {
    await tx.projectTechnology.deleteMany({ where: { projectId } });
    await tx.projectTechnology.createMany({
      data: i.technologies.map((t, idx) => ({ projectId, name: t.name, icon: t.icon ?? null, order: idx })),
    });
  }
}

function assetsOf(i: ProjectUpdateInput) {
  return [i.ogImage, ...(i.roles ?? []).flatMap((r) => r.images)];
}

/* ------------------------------------------------------------------ reads */

export async function get(actor: Actor, id: string) {
  const p = await load(id);
  if (!can(actor, "project:read", ctx(p))) throw notFound("Project not found");
  return p;
}

export async function list(actor: Actor, q: DashboardProjectQuery) {
  const where: Prisma.ProjectWhereInput = {
    deletedAt: null,
    ...(q.status && { status: q.status }),
    ...(q.categoryId && { categoryId: q.categoryId }),
    ...(q.search && {
      OR: [
        { name: { contains: q.search, mode: "insensitive" } },
        { slug: { contains: q.search, mode: "insensitive" } },
      ],
    }),
  };
  if (!can(actor, "project:list:all") || q.mine) where.createdById = actor.id;

  const [items, total] = await Promise.all([
    db.project.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        featured: true,
        rejectionNote: true,
        updatedAt: true,
        publishedAt: true,
        category: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        images: { where: { type: "MAIN" }, take: 1, select: { url: true, alt: true } },
      },
    }),
    db.project.count({ where }),
  ]);
  return paginated(items, total, q.page, q.pageSize);
}

/* -------------------------------------------------------------- mutations */

export async function create(actor: Actor, input: ProjectCreateInput) {
  assertAdminFields(actor, input);
  await assertCategory(input.categoryId);
  uploads.assertAssets(assetsOf(input));
  const slug = await resolveSlug(input.slug, input.name);
  const hasPrice = PRICE_KEYS.some((k) => input[k] !== undefined);

  return db.$transaction(async (tx) => {
    const p = await tx.project.create({
      data: {
        ...(scalarData(input) as { name: string; shortDescription: string; fullDescription: string; categoryId: string }),
        slug,
        createdById: actor.id,
        updatedById: actor.id,
        ...(hasPrice ? { priceSetById: actor.id, priceSetAt: new Date() } : {}),
      },
    });
    await writeChildren(tx, p.id, input);
    await audit.log(tx, { actor, action: "project.create", entity: "Project", entityId: p.id, meta: { name: p.name, slug } });
    return tx.project.findUniqueOrThrow({ where: { id: p.id }, include });
  });
}

export async function update(actor: Actor, id: string, input: ProjectUpdateInput) {
  const existing = await load(id);
  assertCan(actor, "project:edit", ctx(existing));
  assertAdminFields(actor, input);
  if (input.categoryId) await assertCategory(input.categoryId);
  uploads.assertAssets(assetsOf(input));

  // Cross-field price/duration consistency against stored values
  const merged = (k: (typeof PRICE_KEYS)[number]) => input[k] ?? existing[k];
  if (merged("minPrice") != null && merged("maxPrice") != null && merged("minPrice")! > merged("maxPrice")!)
    throw validation("Max price must be ≥ min price", { maxPrice: ["Max price must be ≥ min price"] });
  if (merged("minDuration") != null && merged("maxDuration") != null && merged("minDuration")! > merged("maxDuration")!)
    throw validation("Max duration must be ≥ min duration", { maxDuration: ["Max duration must be ≥ min duration"] });

  let slug: string | undefined;
  if (input.slug && input.slug !== existing.slug) {
    if (!(await slugFree(input.slug, id))) throw conflict("Slug already in use");
    slug = input.slug;
  }

  const priceChanges = PRICE_KEYS.filter((k) => input[k] !== undefined && input[k] !== existing[k]);
  const oldKeys: string[] = [];
  if (input.roles) oldKeys.push(...existing.roles.flatMap((r) => r.images.map((i) => i.key)));
  if (input.ogImage !== undefined && existing.ogImageKey) oldKeys.push(existing.ogImageKey);
  const newKeys = new Set(assetsOf(input).map((a) => a?.key));

  const updated = await db.$transaction(async (tx) => {
    await tx.project.update({
      where: { id },
      data: {
        ...scalarData(input),
        ...(slug ? { slug } : {}),
        updatedById: actor.id,
        ...(priceChanges.length ? { priceSetById: actor.id, priceSetAt: new Date() } : {}),
      },
    });
    await writeChildren(tx, id, input);
    await uploads.queueDeletion(tx, oldKeys.filter((k) => !newKeys.has(k)));
    await audit.log(tx, {
      actor,
      action: "project.update",
      entity: "Project",
      entityId: id,
      meta: { fields: Object.keys(input) },
    });
    if (priceChanges.length) {
      await audit.log(tx, {
        actor,
        action: "project.price_change",
        entity: "Project",
        entityId: id,
        meta: {
          before: Object.fromEntries(priceChanges.map((k) => [k, existing[k]])),
          after: Object.fromEntries(priceChanges.map((k) => [k, input[k] ?? null])),
        },
      });
    }
    return tx.project.findUniqueOrThrow({ where: { id }, include });
  });

  await uploads.flushSoon();
  if (existing.status === "PUBLISHED") revalidateProjectGraph();
  return updated;
}

async function transition(
  actor: Actor,
  p: ProjectFull,
  to: ProjectStatus,
  data: Prisma.ProjectUncheckedUpdateManyInput,
  action: string,
  meta: Prisma.InputJsonObject = {},
) {
  assertTransition(p.status, to);
  const result = await db.$transaction(async (tx) => {
    // Compare-and-set on status guards against concurrent transitions
    const { count } = await tx.project.updateMany({
      where: { id: p.id, status: p.status, deletedAt: null },
      data: { ...data, status: to, updatedById: actor.id },
    });
    if (count === 0) throw conflict("The project changed while you were working. Reload and try again.");
    await audit.log(tx, { actor, action, entity: "Project", entityId: p.id, meta: { from: p.status, to, ...meta } });
    return tx.project.findUniqueOrThrow({ where: { id: p.id }, include });
  });
  if (p.status === "PUBLISHED" || to === "PUBLISHED") revalidateProjectGraph();
  return result;
}

export async function submit(actor: Actor, id: string) {
  const p = await load(id);
  assertCan(actor, "project:submit", ctx(p));
  assertReady(p);
  return transition(actor, p, "PENDING", { rejectionNote: null }, "project.submit");
}

export async function publish(actor: Actor, id: string, pricing: ProjectPublishInput) {
  const p = await load(id);
  assertCan(actor, "project:publish");
  assertReady(p);
  return transition(
    actor,
    p,
    "PUBLISHED",
    { ...pricing, priceSetById: actor.id, priceSetAt: new Date(), publishedAt: p.publishedAt ?? new Date(), rejectionNote: null },
    "project.publish",
    { pricing },
  );
}

export async function reject(actor: Actor, id: string, note: string) {
  const p = await load(id);
  assertCan(actor, "project:reject");
  return transition(actor, p, "DRAFT", { rejectionNote: note }, "project.reject", { note });
}

export async function archive(actor: Actor, id: string) {
  const p = await load(id);
  assertCan(actor, "project:archive");
  return transition(actor, p, "ARCHIVED", { featured: false }, "project.archive");
}

export async function restore(actor: Actor, id: string) {
  const p = await load(id);
  assertCan(actor, "project:archive");
  return transition(actor, p, "DRAFT", {}, "project.restore");
}

/** Soft delete. Slug is freed for reuse; R2 assets are purged later by the maintenance job. */
export async function remove(actor: Actor, id: string) {
  const p = await load(id);
  assertCan(actor, "project:delete", ctx(p));
  await db.$transaction(async (tx) => {
    await tx.project.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        slug: `${p.slug}--deleted-${Date.now().toString(36)}`,
        featured: false,
        updatedById: actor.id,
      },
    });
    await audit.log(tx, {
      actor,
      action: "project.delete",
      entity: "Project",
      entityId: id,
      meta: { name: p.name, slug: p.slug, status: p.status },
    });
  });
  if (p.status === "PUBLISHED") revalidateProjectGraph();
  return { id };
}

/* ----------------------------------------------------------------- images */

export async function addImage(actor: Actor, projectId: string, input: ProjectImageCreateInput) {
  const p = await load(projectId);
  assertCan(actor, "project:edit", ctx(p));
  uploads.assertAsset(input);
  const singleton = input.type !== "EXTRA"; // MAIN / DESKTOP / MOBILE hold exactly one image

  const created = await db.$transaction(async (tx) => {
    let replaced: string[] = [];
    if (singleton) {
      const old = await tx.projectImage.findMany({ where: { projectId, type: input.type } });
      replaced = old.map((o) => o.key).filter((k) => k !== input.key);
      await tx.projectImage.deleteMany({ where: { projectId, type: input.type } });
    }
    const order = input.order ?? (singleton ? 0 : await tx.projectImage.count({ where: { projectId, type: "EXTRA" } }));
    const img = await tx.projectImage.create({
      data: { projectId, url: input.url, key: input.key, alt: input.alt, type: input.type, order },
    });
    await uploads.queueDeletion(tx, replaced);
    await tx.project.update({ where: { id: projectId }, data: { updatedById: actor.id } });
    await audit.log(tx, {
      actor,
      action: "project.image_add",
      entity: "Project",
      entityId: projectId,
      meta: { imageId: img.id, type: input.type },
    });
    return img;
  });
  await uploads.flushSoon();
  if (p.status === "PUBLISHED") revalidateProjectGraph();
  return created;
}

export async function removeImage(actor: Actor, projectId: string, imageId: string) {
  const p = await load(projectId);
  assertCan(actor, "project:edit", ctx(p));
  const img = await db.projectImage.findFirst({ where: { id: imageId, projectId } });
  if (!img) throw notFound("Image not found");
  await db.$transaction(async (tx) => {
    await tx.projectImage.delete({ where: { id: imageId } });
    await uploads.queueDeletion(tx, [img.key]);
    await audit.log(tx, {
      actor,
      action: "project.image_delete",
      entity: "Project",
      entityId: projectId,
      meta: { imageId, type: img.type },
    });
  });
  await uploads.flushSoon();
  if (p.status === "PUBLISHED") revalidateProjectGraph();
  return { id: imageId };
}

export async function reorderImages(actor: Actor, projectId: string, items: { id: string; order: number }[]) {
  const p = await load(projectId);
  assertCan(actor, "project:edit", ctx(p));
  const owned = await db.projectImage.count({ where: { projectId, id: { in: items.map((i) => i.id) } } });
  if (owned !== items.length) throw validation("Some images do not belong to this project");
  await db.$transaction(items.map((i) => db.projectImage.update({ where: { id: i.id }, data: { order: i.order } })));
  if (p.status === "PUBLISHED") revalidateProjectGraph();
  return { count: items.length };
}
