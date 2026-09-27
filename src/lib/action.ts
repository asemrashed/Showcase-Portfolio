import "server-only";
import { Prisma } from "@prisma/client";
import { z, ZodError } from "zod";
import { AppError, type ErrorCode } from "@/lib/errors";
import { assertCan, type Action, type Actor } from "@/lib/auth/permissions";
import { requireActor } from "@/lib/auth/session";

export type ActionError = {
  code: ErrorCode;
  message: string;
  fieldErrors?: Record<string, string[]>;
  retryAfter?: number;
};
export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: ActionError };

/** Use as `schema` when an action takes no input. */
export const NoInput = z.any();

function fromZod(e: ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of e.issues) {
    const key = issue.path.join(".") || "_root";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

function toError(e: unknown): ActionError {
  // Let Next.js control-flow errors (redirect/notFound) pass through.
  if (typeof e === "object" && e && "digest" in e && String((e as { digest: unknown }).digest).startsWith("NEXT_")) {
    throw e;
  }
  if (e instanceof AppError) {
    return { code: e.code, message: e.message, fieldErrors: e.fieldErrors, retryAfter: e.retryAfter };
  }
  if (e instanceof ZodError) {
    return { code: "VALIDATION_ERROR", message: "Invalid input", fieldErrors: fromZod(e) };
  }
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") return { code: "CONFLICT", message: "A record with these unique values already exists" };
    if (e.code === "P2025") return { code: "NOT_FOUND", message: "Record not found" };
    if (e.code === "P2003") return { code: "CONFLICT", message: "This record is referenced by other data" };
  }
  console.error("[action] unexpected error", e);
  return { code: "INTERNAL_ERROR", message: "Something went wrong" };
}

export async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    return { ok: false, error: toError(e) };
  }
}

/**
 * Standard mutation/read pipeline:
 *   authenticate -> coarse RBAC -> Zod validate -> handler (service does resource-level RBAC + audit)
 */
export async function exec<S extends z.ZodTypeAny, R>(
  opts: { permission?: Action; schema: S; input: unknown },
  handler: (actor: Actor, data: z.output<S>) => Promise<R>,
): Promise<ActionResult<R>> {
  return run(async () => {
    const actor = await requireActor();
    if (opts.permission) assertCan(actor, opts.permission);
    const data = opts.schema.parse(opts.input);
    return handler(actor, data);
  });
}
