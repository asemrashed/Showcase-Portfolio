import { NextRequest } from "next/server";
import { deleteProjectAction, updateProjectAction } from "@/actions/projects";
import { exec } from "@/lib/action";
import { idSchema } from "@/lib/schemas/common";
import { readBody, respond, type RouteCtx } from "@/lib/http";
import * as svc from "@/lib/services/projectService";

type C = RouteCtx<{ id: string }>;
export async function GET(_: NextRequest, { params }: C) {
  return respond(await exec({ schema: idSchema, input: (await params).id }, (a, id) => svc.get(a, id)));
}
export async function PATCH(req: NextRequest, { params }: C) {
  return respond(await updateProjectAction((await params).id, await readBody(req)));
}
export async function DELETE(_: NextRequest, { params }: C) {
  return respond(await deleteProjectAction((await params).id));
}
