import { NextRequest } from "next/server";
import { createUserAction } from "@/actions/users";
import { exec } from "@/lib/action";
import { query, readBody, respond } from "@/lib/http";
import { userListQuerySchema } from "@/lib/schemas/user";
import * as svc from "@/lib/services/userService";

export async function GET(req: NextRequest) {
  return respond(await exec({ permission: "user:manage", schema: userListQuerySchema, input: query(req) }, (a, q) => svc.list(a, q)));
}
export async function POST(req: NextRequest) {
  return respond(await createUserAction(await readBody(req)), 201);
}
