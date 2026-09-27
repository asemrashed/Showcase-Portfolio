import { logoutAction } from "@/actions/auth";
import { respond } from "@/lib/http";

export async function POST() {
  return respond(await logoutAction());
}
