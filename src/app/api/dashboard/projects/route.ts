import { NextRequest } from "next/server";
import { createProjectAction } from "@/actions/projects";
import { exec } from "@/lib/action";
import { query, readBody, respond } from "@/lib/http";
import { dashboardProjectQuerySchema } from "@/lib/schemas/project";
import * as svc from "@/lib/services/projectService";

export async function GET(req: NextRequest) {
  return respond(await exec({ schema: dashboardProjectQuerySchema, input: query(req) }, (a, q) => svc.list(a, q)));
}
export async function POST(req: NextRequest) {
  return respond(await createProjectAction(await readBody(req)), 201);
}
