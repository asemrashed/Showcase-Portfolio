import "server-only";
import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import { unauthorized, badRequest } from "@/lib/errors";
import { assertRate } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/mailer";
import * as audit from "./auditService";

const BCRYPT_COST = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function login(input: { email: string; password: string }, ip: string) {
  assertRate(`login:ip:${ip}`, { limit: 20, windowMs: 15 * 60_000 });
  try {
    await signIn("credentials", { email: input.email, password: input.password, redirect: false });
  } catch (e) {
    if (e instanceof AuthError) throw unauthorized("Invalid email or password");
    throw e;
  }
  return { authenticated: true };
}

export async function logout() {
  await signOut({ redirect: false });
  return { authenticated: false };
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Always returns the same result whether or not the email is registered, so this can't be used
 * to enumerate accounts. Rate-limited per IP and per email to slow down abuse either way.
 */
export async function requestPasswordReset(email: string, ip: string) {
  assertRate(`reset-request:ip:${ip}`, { limit: 8, windowMs: 15 * 60_000 });
  assertRate(`reset-request:email:${email}`, { limit: 3, windowMs: 60 * 60_000 });

  const user = await db.user.findUnique({ where: { email }, select: { id: true, email: true, name: true, active: true } });
  if (user?.active) {
    const token = randomBytes(32).toString("base64url");
    await db.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
    });
    // Never let a slow/broken mail provider fail the request — the response must look identical
    // either way, and swallowing the error here (not in the caller) keeps that guarantee in one place.
    await sendPasswordResetEmail(user.email, { name: user.name, token }).catch((e) =>
      console.error("[auth] password reset email failed", e),
    );
  }
  return { sent: true };
}

export async function resetPassword(token: string, newPassword: string) {
  const tokenHash = hashToken(token);
  const record = await db.passwordResetToken.findUnique({ where: { tokenHash }, include: { user: { select: { id: true, email: true } } } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw badRequest("This reset link is invalid or has expired. Please request a new one.");
  }

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: record.userId },
      data: { passwordHash: await bcrypt.hash(newPassword, BCRYPT_COST), sessionVersion: { increment: 1 } },
    });
    await tx.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
    // A successful reset invalidates any other outstanding reset links for this user too.
    await tx.passwordResetToken.updateMany({
      where: { userId: record.userId, usedAt: null, id: { not: record.id } },
      data: { usedAt: new Date() },
    });
    await audit.log(tx, { actor: { id: record.user.id, email: record.user.email }, action: "user.password_reset", entity: "User", entityId: record.userId });
  });
  return { reset: true };
}
