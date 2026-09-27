import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { env } from "@/env";
import { runMaintenance } from "@/lib/services/maintenanceService";

export const maxDuration = 60;

function authorized(req: NextRequest) {
  if (!env.CRON_SECRET) return false;
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${env.CRON_SECRET}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Flushes the storage deletion queue and purges projects soft-deleted >30 days ago. */
export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
  return NextResponse.json({ ok: true, data: await runMaintenance() });
}
