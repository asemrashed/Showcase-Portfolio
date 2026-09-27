import { NextRequest } from "next/server";
import { loginAction } from "@/actions/auth";
import { readBody, respond } from "@/lib/http";

export async function POST(req: NextRequest) {
  return respond(await loginAction(await readBody(req)));
}
