import { NextRequest } from "next/server";
import { deleteUserAction, updateUserAction } from "@/actions/users";
import { exec } from "@/lib/action";
import { idSchema } from "@/lib/schemas/common";
import { readBody, respond, type RouteCtx } from "@/lib/http";
import * as svc from "@/lib/services/userService";

type C = RouteCtx<{ id: string }>;
export async function GET(_: NextRequest, { params }: C) {
  return respond(await exec({ permission: "user:manage", schema: idSchema, input: (await params).id }, (a, id) => svc.get(a, id)));
}
export async function PATCH(req: NextRequest, { params }: C) {
  return respond(await updateUserAction((await params).id, await readBody(req)));
}
export async function DELETE(_: NextRequest, { params }: C) {
  return respond(await deleteUserAction((await params).id));
}
