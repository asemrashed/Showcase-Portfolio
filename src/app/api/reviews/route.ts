import { NextRequest } from "next/server";
import { publicRead, query } from "@/lib/http";
import { getReviews } from "@/lib/queries/public";
import { publicReviewQuerySchema } from "@/lib/schemas/review";

export async function GET(req: NextRequest) {
  return publicRead(() => getReviews(publicReviewQuerySchema.parse(query(req))));
}
