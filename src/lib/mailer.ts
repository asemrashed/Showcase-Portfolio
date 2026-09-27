import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/env";
import { siteUrl } from "@/lib/site";

let transporter: Transporter | undefined;

function isConfigured() {
  return !!(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM);
}

function getTransporter() {
  return (transporter ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465, // 465 = implicit TLS; 587/25 use STARTTLS
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  }));
}

/**
 * Generic SMTP send, reused by every mail-sending feature (contact notifications, password
 * reset, and any future notification). No-ops with a console warning if SMTP isn't configured,
 * so the app degrades gracefully in local dev rather than crashing user-facing flows.
 */
export async function sendMail(msg: { to: string; subject: string; text: string; html?: string; replyTo?: string }) {
  if (!isConfigured()) {
    console.warn(`[mailer] SMTP not configured — skipping email to ${msg.to}: ${msg.subject}`);
    return;
  }
  await getTransporter().sendMail({
    from: env.SMTP_FROM,
    to: msg.to,
    replyTo: msg.replyTo,
    subject: msg.subject,
    text: msg.text,
    html: msg.html,
  });
}

export async function sendContactNotification(
  to: string | undefined,
  msg: { name: string; email: string; subject?: string | null; message: string },
) {
  if (!to) return;
  const subject = `New contact message${msg.subject ? `: ${msg.subject}` : ""}`.slice(0, 200);
  await sendMail({
    to,
    replyTo: msg.email,
    subject,
    text: `From: ${msg.name} <${msg.email}>\n\n${msg.message}`,
    html: `<p><strong>From:</strong> ${escapeHtml(msg.name)} &lt;${escapeHtml(msg.email)}&gt;</p><p>${escapeHtml(msg.message).replace(/\n/g, "<br>")}</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, opts: { name: string | null; token: string }) {
  const resetUrl = `${siteUrl}/reset-password?token=${encodeURIComponent(opts.token)}`;
  const greeting = opts.name ? `Hi ${opts.name},` : "Hi,";
  await sendMail({
    to,
    subject: "Reset your password",
    text: `${greeting}\n\nWe received a request to reset your password. This link expires in 1 hour and can only be used once:\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
    html: `<p>${greeting}</p><p>We received a request to reset your password. This link expires in 1 hour and can only be used once:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
