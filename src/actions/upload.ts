"use server";
import { exec } from "@/lib/action";
import { presignSchema } from "@/lib/schemas/upload";
import * as svc from "@/lib/services/uploadService";

export async function presignUploadAction(input: unknown) {
  return exec({ permission: "upload:presign", schema: presignSchema, input }, (a, d) => svc.createPresign(a.id, d));
}
