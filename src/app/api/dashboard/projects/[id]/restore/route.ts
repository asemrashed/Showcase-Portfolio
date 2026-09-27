import { NextRequest } from "next/server";
import { restoreProjectAction } from "@/actions/projects";
import { respond, type RouteCtx } from "@/lib/http";

export async function POST(_: NextRequest, { params }: RouteCtx<{ id: string }>) {
  return respond(await restoreProjectAction((await params).id));
}
