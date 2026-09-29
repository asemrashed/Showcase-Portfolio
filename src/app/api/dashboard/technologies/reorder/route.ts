import { NextRequest } from "next/server";
import { readBody, respond } from "@/lib/http";
import { reorderTechnologiesAction } from "@/actions/technologies";

export async function POST(req: NextRequest) {
  return respond(await reorderTechnologiesAction(await readBody(req)));
}
