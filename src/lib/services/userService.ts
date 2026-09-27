import "server-only";
import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { Actor } from "@/lib/auth/permissions";
import { conflict, forbidden, notFound, validation } from "@/lib/errors";
import { paginated } from "@/lib/schemas/common";
import type { UserCreateInput, UserListQuery, UserUpdateInput } from "@/lib/schemas/user";
import * as audit from "./auditService";

const BCRYPT_COST = 12;
const select = {
  id: true,
  email: true,
  name: true,
  role: true,
  active: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

async function load(id: string) {
  const u = await db.user.findUnique({ where: { id }, select });
  if (!u) throw notFound("User not found");
  return u;
}

async function assertAnotherSuperAdmin(excludeId: string) {
  const n = await db.user.count({ where: { role: "SUPER_ADMIN", active: true, id: { not: excludeId } } });
  if (n === 0) throw forbidden("There must always be at least one active Super Admin");
}

export async function list(_actor: Actor, q: UserListQuery) {
  const where: Prisma.UserWhereInput = {
    ...(q.role && { role: q.role }),
    ...(q.search && {
      OR: [
        { email: { contains: q.search, mode: "insensitive" } },
        { name: { contains: q.search, mode: "insensitive" } },
      ],
    }),
  };
  const [items, total] = await Promise.all([
    db.user.findMany({ where, select, orderBy: { createdAt: "desc" }, skip: (q.page - 1) * q.pageSize, take: q.pageSize }),
    db.user.count({ where }),
  ]);
  return paginated(items, total, q.page, q.pageSize);
}

export const get = (_actor: Actor, id: string) => load(id);

export async function create(actor: Actor, input: UserCreateInput) {
  if (await db.user.findUnique({ where: { email: input.email }, select: { id: true } }))
    throw conflict("A user with this email already exists");
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  return db.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: { email: input.email, name: input.name, role: input.role, active: input.active ?? true, passwordHash },
      select,
    });
    await audit.log(tx, { actor, action: "user.create", entity: "User", entityId: u.id, meta: { email: u.email, role: u.role } });
    return u;
  });
}

export async function update(actor: Actor, id: string, input: UserUpdateInput) {
  const target = await load(id);
  const isSelf = actor.id === id;
  const roleChanges = input.role !== undefined && input.role !== target.role;
  if (isSelf && (roleChanges || input.active === false))
    throw forbidden("You cannot change your own role or deactivate your own account");
  if (target.role === "SUPER_ADMIN" && target.active && ((roleChanges && input.role !== "SUPER_ADMIN") || input.active === false))
    await assertAnotherSuperAdmin(id);
  if (input.email && input.email !== target.email && (await db.user.findUnique({ where: { email: input.email }, select: { id: true } })))
    throw conflict("A user with this email already exists");

  const invalidateSessions = input.password !== undefined || roleChanges || input.active === false;
  const updated = await db.$transaction(async (tx) => {
    const u = await tx.user.update({
      where: { id },
      data: {
        ...(input.email !== undefined && { email: input.email }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.role !== undefined && { role: input.role }),
        ...(input.active !== undefined && { active: input.active }),
        ...(input.password !== undefined && { passwordHash: await bcrypt.hash(input.password, BCRYPT_COST) }),
        ...(invalidateSessions && { sessionVersion: { increment: 1 } }),
      },
      select,
    });
    await audit.log(tx, {
      actor,
      action: "user.update",
      entity: "User",
      entityId: id,
      meta: {
        fields: Object.keys(input).filter((k) => k !== "password"),
        passwordChanged: input.password !== undefined,
        ...(roleChanges ? { roleFrom: target.role, roleTo: input.role! } : {}),
      },
    });
    return u;
  });
  return updated;
}

export async function remove(actor: Actor, id: string) {
  const target = await load(id);
  if (actor.id === id) throw forbidden("You cannot delete your own account");
  if (target.role === "SUPER_ADMIN" && target.active) await assertAnotherSuperAdmin(id);
  await db.$transaction(async (tx) => {
    await tx.user.delete({ where: { id } }); // FKs are SET NULL; audit rows keep the actor email snapshot
    await audit.log(tx, { actor, action: "user.delete", entity: "User", entityId: id, meta: { email: target.email, role: target.role } });
  });
  return { id };
}

/** Self-service password change. Bumps sessionVersion => all sessions (incl. this one) must sign in again. */
export async function changeOwnPassword(actor: Actor, input: { currentPassword: string; newPassword: string }) {
  const u = await db.user.findUnique({ where: { id: actor.id }, select: { passwordHash: true } });
  if (!u || !(await bcrypt.compare(input.currentPassword, u.passwordHash)))
    throw validation("Current password is incorrect", { currentPassword: ["Current password is incorrect"] });
  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: actor.id },
      data: { passwordHash: await bcrypt.hash(input.newPassword, BCRYPT_COST), sessionVersion: { increment: 1 } },
    });
    await audit.log(tx, { actor, action: "user.password_change", entity: "User", entityId: actor.id });
  });
  return { reauthenticate: true };
}
