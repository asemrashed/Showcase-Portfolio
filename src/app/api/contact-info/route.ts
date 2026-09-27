import { publicRead } from "@/lib/http";
import { getContactInfo } from "@/lib/queries/public";

export async function GET() {
  return publicRead(() => getContactInfo());
}
