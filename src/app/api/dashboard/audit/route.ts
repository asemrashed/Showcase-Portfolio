import { NextRequest } from "next/server";
import { exec } from "@/lib/action";
import { query, respond } from "@/lib/http";
import { auditQuerySchema } from "@/lib/schemas/audit";
import * as svc from "@/lib/services/auditService";

export async function GET(req: NextRequest) {
  return respond(await exec({ permission: "audit:view", schema: auditQuerySchema, input: query(req) }, (a, q) => svc.list(a, q)));
}
