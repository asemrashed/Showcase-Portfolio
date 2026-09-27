import { NextRequest } from "next/server";
import { changePasswordAction } from "@/actions/auth";
import { readBody, respond } from "@/lib/http";

export async function POST(req: NextRequest) {
  return respond(await changePasswordAction(await readBody(req)));
}
