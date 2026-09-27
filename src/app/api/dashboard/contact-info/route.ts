import { NextRequest } from "next/server";
import { updateContactInfoAction } from "@/actions/singletons";
import { exec, NoInput } from "@/lib/action";
import { readBody, respond } from "@/lib/http";
import * as svc from "@/lib/services/singletonService";

export async function GET() {
  return respond(await exec({ permission: "contactInfo:manage", schema: NoInput, input: undefined }, () => svc.getContactInfo()));
}
export async function PUT(req: NextRequest) {
  return respond(await updateContactInfoAction(await readBody(req)));
}
