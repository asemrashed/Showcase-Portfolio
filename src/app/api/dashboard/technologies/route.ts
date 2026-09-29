import { NextRequest } from "next/server";
import { exec, NoInput } from "@/lib/action";
import { readBody, respond } from "@/lib/http";
import * as svc from "@/lib/services/technologyService";
import { createTechnologyAction } from "@/actions/technologies";

export async function GET() {
  return respond(await exec({ permission: "technology:manage", schema: NoInput, input: undefined }, (a) => svc.list(a)));
}
export async function POST(req: NextRequest) {
  return respond(await createTechnologyAction(await readBody(req)), 201);
}
