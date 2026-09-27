import { publicRead } from "@/lib/http";
import { getAbout } from "@/lib/queries/public";

export async function GET() {
  return publicRead(() => getAbout());
}
