import { NextRequest } from "next/server";
import { resetPasswordAction } from "@/actions/auth";
import { readBody, respond } from "@/lib/http";

export async function POST(req: NextRequest) {
  return respond(await resetPasswordAction(await readBody(req)));
}
