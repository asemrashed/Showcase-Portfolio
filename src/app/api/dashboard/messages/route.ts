import { NextRequest } from "next/server";
import { exec } from "@/lib/action";
import { query, respond } from "@/lib/http";
import { messageListQuerySchema } from "@/lib/schemas/message";
import * as svc from "@/lib/services/messageService";

export async function GET(req: NextRequest) {
  return respond(await exec({ permission: "message:manage", schema: messageListQuerySchema, input: query(req) }, (a, q) => svc.list(a, q)));
}
