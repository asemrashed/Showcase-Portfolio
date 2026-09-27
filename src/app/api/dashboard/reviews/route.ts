import { NextRequest } from "next/server";
import { exec, NoInput } from "@/lib/action";
import { readBody, respond } from "@/lib/http";
import * as svc from "@/lib/services/reviewService";
import { createReviewAction } from "@/actions/reviews";

export async function GET() {
  return respond(await exec({ permission: "review:manage", schema: NoInput, input: undefined }, (a) => svc.list(a)));
}
export async function POST(req: NextRequest) {
  return respond(await createReviewAction(await readBody(req)), 201);
}
