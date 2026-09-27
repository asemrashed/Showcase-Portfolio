import { NextRequest } from "next/server";
import { exec, NoInput } from "@/lib/action";
import { readBody, respond } from "@/lib/http";
import * as svc from "@/lib/services/heroService";
import { createHeroSlideAction } from "@/actions/hero";

export async function GET() {
  return respond(await exec({ permission: "hero:manage", schema: NoInput, input: undefined }, (a) => svc.list(a)));
}
export async function POST(req: NextRequest) {
  return respond(await createHeroSlideAction(await readBody(req)), 201);
}
