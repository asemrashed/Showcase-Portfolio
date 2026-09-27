import { NextRequest } from "next/server";
import { readBody, respond } from "@/lib/http";
import { reorderHeroSlidesAction } from "@/actions/hero";

export async function POST(req: NextRequest) {
  return respond(await reorderHeroSlidesAction(await readBody(req)));
}
