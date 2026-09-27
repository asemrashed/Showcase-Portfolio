import { NextRequest } from "next/server";
import { exec } from "@/lib/action";
import { idSchema } from "@/lib/schemas/common";
import { readBody, respond, type RouteCtx } from "@/lib/http";
import * as svc from "@/lib/services/categoryService";
import { updateCategoryAction, deleteCategoryAction } from "@/actions/categories";

export async function GET(_: NextRequest, { params }: RouteCtx<{ id: string }>) {
  const { id } = await params;
  return respond(await exec({ permission: "category:manage", schema: idSchema, input: id }, (a, d) => svc.get(a, d)));
}
export async function PATCH(req: NextRequest, { params }: RouteCtx<{ id: string }>) {
  return respond(await updateCategoryAction((await params).id, await readBody(req)));
}
export async function DELETE(_: NextRequest, { params }: RouteCtx<{ id: string }>) {
  return respond(await deleteCategoryAction((await params).id));
}
