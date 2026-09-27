import { NextRequest } from "next/server";
import { exec, NoInput } from "@/lib/action";
import { readBody, respond } from "@/lib/http";
import * as svc from "@/lib/services/categoryService";
import { createCategoryAction } from "@/actions/categories";

export async function GET() {
  return respond(await exec({ permission: "category:manage", schema: NoInput, input: undefined }, (a) => svc.list(a)));
}
export async function POST(req: NextRequest) {
  return respond(await createCategoryAction(await readBody(req)), 201);
}
