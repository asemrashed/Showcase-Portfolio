import { NextRequest } from "next/server";
import { deleteMessageAction, updateMessageStatusAction } from "@/actions/messages";
import { exec } from "@/lib/action";
import { idSchema } from "@/lib/schemas/common";
import { readBody, respond, type RouteCtx } from "@/lib/http";
import * as svc from "@/lib/services/messageService";

type C = RouteCtx<{ id: string }>;
export async function GET(_: NextRequest, { params }: C) {
  return respond(await exec({ permission: "message:manage", schema: idSchema, input: (await params).id }, (a, id) => svc.get(a, id)));
}
export async function PATCH(req: NextRequest, { params }: C) {
  return respond(await updateMessageStatusAction((await params).id, await readBody(req)));
}
export async function DELETE(_: NextRequest, { params }: C) {
  return respond(await deleteMessageAction((await params).id));
}
