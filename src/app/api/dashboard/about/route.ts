import { NextRequest } from "next/server";
import { updateAboutAction } from "@/actions/singletons";
import { exec, NoInput } from "@/lib/action";
import { readBody, respond } from "@/lib/http";
import * as svc from "@/lib/services/singletonService";

export async function GET() {
  return respond(await exec({ permission: "about:manage", schema: NoInput, input: undefined }, () => svc.getAbout()));
}
export async function PUT(req: NextRequest) {
  return respond(await updateAboutAction(await readBody(req)));
}
