import { NextRequest } from "next/server";
import { addProjectImageAction, reorderProjectImagesAction } from "@/actions/projects";
import { readBody, respond, type RouteCtx } from "@/lib/http";

type C = RouteCtx<{ id: string }>;
/** Attach an uploaded image: { url, key, alt, type: DESKTOP|MOBILE, order? } */
export async function POST(req: NextRequest, { params }: C) {
  return respond(await addProjectImageAction((await params).id, await readBody(req)), 201);
}
/** Reorder: { items: [{ id, order }] } */
export async function PATCH(req: NextRequest, { params }: C) {
  return respond(await reorderProjectImagesAction((await params).id, await readBody(req)));
}
