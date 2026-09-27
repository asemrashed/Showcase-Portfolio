import { exec, NoInput } from "@/lib/action";
import { respond } from "@/lib/http";
import { overview } from "@/lib/services/overviewService";

export async function GET() {
  return respond(await exec({ schema: NoInput, input: undefined }, (a) => overview(a)));
}
