import { NextRequest } from "next/server";
import { submitContactAction } from "@/actions/messages";
import { readBody, respond } from "@/lib/http";

export async function POST(req: NextRequest) {
  return respond(await submitContactAction(await readBody(req)), 201);
}
