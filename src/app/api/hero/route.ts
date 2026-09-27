import { publicRead } from "@/lib/http";
import { getHero } from "@/lib/queries/public";

export async function GET() {
  return publicRead(() => getHero());
}
