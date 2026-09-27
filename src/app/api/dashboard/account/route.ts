import { getMeAction } from "@/actions/auth";
import { respond } from "@/lib/http";

/** Current user (id, email, name, role) — verified against the DB. */
export async function GET() {
  return respond(await getMeAction());
}
