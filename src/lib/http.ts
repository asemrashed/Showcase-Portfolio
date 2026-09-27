import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { STATUS_BY_CODE, notFound } from "@/lib/errors";
import { run, type ActionResult } from "@/lib/action";

export type RouteCtx<P = Record<string, string>> = { params: Promise<P> };

export const PUBLIC_CACHE = "public, s-maxage=60, stale-while-revalidate=300";

export function respond<T>(r: ActionResult<T>, okStatus = 200, cacheControl?: string) {
  if (r.ok) {
    return NextResponse.json(r, {
      status: okStatus,
      headers: cacheControl ? { "Cache-Control": cacheControl } : { "Cache-Control": "no-store" },
    });
  }
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (r.error.retryAfter) headers["Retry-After"] = String(r.error.retryAfter);
  return NextResponse.json(r, { status: STATUS_BY_CODE[r.error.code] ?? 500, headers });
}

export async function readBody(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

/** Query string -> plain object (empty values dropped). */
export function query(req: NextRequest): Record<string, string> {
  const out: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((v, k) => {
    if (v !== "") out[k] = v;
  });
  return out;
}

/** Unauthenticated read with CDN cache headers. Returning null => 404. */
export async function publicRead<T>(fn: () => Promise<T | null>) {
  const r = await run(async () => {
    const d = await fn();
    if (d === null) throw notFound();
    return d;
  });
  return respond(r, 200, r.ok ? PUBLIC_CACHE : undefined);
}
