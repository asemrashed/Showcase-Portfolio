import { NextRequest } from "next/server";
import { removeProjectImageAction } from "@/actions/projects";
import { respond, type RouteCtx } from "@/lib/http";

export async function DELETE(_: NextRequest, { params }: RouteCtx<{ id: string; imageId: string }>) {
  const { id, imageId } = await params;
  return respond(await removeProjectImageAction(id, imageId));
}
