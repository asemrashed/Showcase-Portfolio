import { NextRequest } from "next/server";
import { requestPasswordResetAction } from "@/actions/auth";
import { readBody, respond } from "@/lib/http";

export async function POST(req: NextRequest) {
  return respond(await requestPasswordResetAction(await readBody(req)));
}
