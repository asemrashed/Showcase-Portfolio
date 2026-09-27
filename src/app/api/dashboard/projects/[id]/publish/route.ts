import { NextRequest } from "next/server";
import { publishProjectAction } from "@/actions/projects";
import { readBody, respond, type RouteCtx } from "@/lib/http";

export async function POST(req: NextRequest, { params }: RouteCtx<{ id: string }>) {
  return respond(await publishProjectAction((await params).id, await readBody(req)));
}
