import { NextRequest } from "next/server";
import { publicRead, type RouteCtx } from "@/lib/http";
import { getCategoryBySlug } from "@/lib/queries/public";

export async function GET(_: NextRequest, { params }: RouteCtx<{ slug: string }>) {
  return publicRead(async () => getCategoryBySlug((await params).slug));
}
