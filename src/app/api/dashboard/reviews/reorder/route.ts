import { NextRequest } from "next/server";
import { readBody, respond } from "@/lib/http";
import { reorderReviewsAction } from "@/actions/reviews";

export async function POST(req: NextRequest) {
  return respond(await reorderReviewsAction(await readBody(req)));
}
