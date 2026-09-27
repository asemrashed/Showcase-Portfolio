import { publicRead } from "@/lib/http";
import { getCategories } from "@/lib/queries/public";

export async function GET() {
  return publicRead(() => getCategories());
}
