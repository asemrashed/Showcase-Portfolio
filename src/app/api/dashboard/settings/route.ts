import { NextRequest } from "next/server";
import { updateSettingsAction } from "@/actions/singletons";
import { exec, NoInput } from "@/lib/action";
import { readBody, respond } from "@/lib/http";
import * as svc from "@/lib/services/singletonService";

export async function GET() {
  return respond(await exec({ permission: "settings:manage", schema: NoInput, input: undefined }, () => svc.getSettings()));
}
export async function PUT(req: NextRequest) {
  return respond(await updateSettingsAction(await readBody(req)));
}
