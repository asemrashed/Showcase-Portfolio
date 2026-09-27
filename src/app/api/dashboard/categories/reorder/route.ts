import { NextRequest } from "next/server";
import { readBody, respond } from "@/lib/http";
import { reorderCategorysAction } from "@/actions/categories";

export async function POST(req: NextRequest) {
  return respond(await reorderCategorysAction(await readBody(req)));
}
