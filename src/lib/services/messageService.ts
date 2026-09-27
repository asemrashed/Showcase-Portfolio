import "server-only";
import type { MessageStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { Actor } from "@/lib/auth/permissions";
import { env } from "@/env";
import { notFound } from "@/lib/errors";
import { assertRate } from "@/lib/rate-limit";
import { sendContactNotification } from "@/lib/mailer";
import { paginated } from "@/lib/schemas/common";
import type { ContactMessageInput, MessageListQuery } from "@/lib/schemas/message";
import * as audit from "./auditService";

/** Public submit. Rate limited per IP; honeypot hits are silently dropped. */
export async function submit(input: ContactMessageInput, ip: string) {
  assertRate(`contact:${ip}`, { limit: 5, windowMs: 60 * 60_000 });
  if (input.website) return { received: true }; // bot — pretend success

  const msg = await db.contactMessage.create({
    data: { name: input.name, email: input.email, subject: input.subject || null, message: input.message, ip },
  });
  try {
    const settings = await db.siteSettings.findUnique({ where: { id: "singleton" }, select: { contactNotifyEmail: true } });
    await sendContactNotification(settings?.contactNotifyEmail ?? env.CONTACT_TO_EMAIL, msg);
  } catch (e) {
    console.error("[contact] email notification failed", e); // never fail the submit because of email
  }
  return { received: true };
}

export async function list(_actor: Actor, q: MessageListQuery) {
  const where: Prisma.ContactMessageWhereInput = {
    ...(q.status && { status: q.status }),
    ...(q.search && {
      OR: [
        { name: { contains: q.search, mode: "insensitive" } },
        { email: { contains: q.search, mode: "insensitive" } },
        { subject: { contains: q.search, mode: "insensitive" } },
        { message: { contains: q.search, mode: "insensitive" } },
      ],
    }),
  };
  const [items, total] = await Promise.all([
    db.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, skip: (q.page - 1) * q.pageSize, take: q.pageSize }),
    db.contactMessage.count({ where }),
  ]);
  return paginated(items, total, q.page, q.pageSize);
}

export async function get(_actor: Actor, id: string) {
  const m = await db.contactMessage.findUnique({ where: { id } });
  if (!m) throw notFound("Message not found");
  return m;
}

export async function updateStatus(actor: Actor, id: string, status: MessageStatus) {
  await get(actor, id);
  return db.$transaction(async (tx) => {
    const m = await tx.contactMessage.update({ where: { id }, data: { status } });
    await audit.log(tx, { actor, action: "message.status", entity: "ContactMessage", entityId: id, meta: { status } });
    return m;
  });
}

export async function remove(actor: Actor, id: string) {
  const m = await get(actor, id);
  await db.$transaction(async (tx) => {
    await tx.contactMessage.delete({ where: { id } });
    await audit.log(tx, { actor, action: "message.delete", entity: "ContactMessage", entityId: id, meta: { from: m.email } });
  });
  return { id };
}
