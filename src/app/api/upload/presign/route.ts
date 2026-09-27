import { NextRequest } from "next/server";
import { presignUploadAction } from "@/actions/upload";
import { readBody, respond } from "@/lib/http";

export async function POST(req: NextRequest) {
  return respond(await presignUploadAction(await readBody(req)));
}
