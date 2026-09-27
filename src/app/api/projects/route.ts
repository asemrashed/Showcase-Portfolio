import { NextRequest } from "next/server";
import { publicRead, query } from "@/lib/http";
import { getProjects } from "@/lib/queries/public";
import { publicProjectQuerySchema } from "@/lib/schemas/project";

export async function GET(req: NextRequest) {
  return publicRead(() => getProjects(publicProjectQuerySchema.parse(query(req))));
}
