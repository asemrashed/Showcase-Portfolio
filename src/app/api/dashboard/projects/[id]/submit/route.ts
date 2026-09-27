import { NextRequest } from "next/server";
import { submitProjectAction } from "@/actions/projects";
import { respond, type RouteCtx } from "@/lib/http";

export async function POST(_: NextRequest, { params }: RouteCtx<{ id: string }>) {
  return respond(await submitProjectAction((await params).id));
}
