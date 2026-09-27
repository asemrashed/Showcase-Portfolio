import { publicRead } from "@/lib/http";
import { getSettings } from "@/lib/queries/public";

export async function GET() {
  return publicRead(() => getSettings());
}
