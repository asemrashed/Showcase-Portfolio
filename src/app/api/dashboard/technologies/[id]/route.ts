import { NextRequest } from "next/server";
import { exec } from "@/lib/action";
import { idSchema } from "@/lib/schemas/common";
import { readBody, respond, type RouteCtx } from "@/lib/http";
import * as svc from "@/lib/services/technologyService";
import { updateTechnologyAction, deleteTechnologyAction } from "@/actions/technologies";

export async function GET(_: NextRequest, { params }: RouteCtx<{ id: string }>) {
  const { id } = await params;
  return respond(await exec({ permission: "technology:manage", schema: idSchema, input: id }, (a, d) => svc.get(a, d)));
}
export async function PATCH(req: NextRequest, { params }: RouteCtx<{ id: string }>) {
  return respond(await updateTechnologyAction((await params).id, await readBody(req)));
}
export async function DELETE(_: NextRequest, { params }: RouteCtx<{ id: string }>) {
  return respond(await deleteTechnologyAction((await params).id));
}
