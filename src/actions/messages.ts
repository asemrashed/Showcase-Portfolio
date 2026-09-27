"use server";
import { headers } from "next/headers";
import { exec, NoInput, run } from "@/lib/action";
import { clientIp } from "@/lib/rate-limit";
import { idSchema } from "@/lib/schemas/common";
import { contactMessageSchema, messageStatusSchema } from "@/lib/schemas/message";
import * as svc from "@/lib/services/messageService";

/** Public — no auth. Rate limited + honeypot inside the service. */
export async function submitContactAction(input: unknown) {
  return run(async () => svc.submit(contactMessageSchema.parse(input), clientIp(await headers())));
}
export async function updateMessageStatusAction(id: string, input: unknown) {
  return exec({ permission: "message:manage", schema: messageStatusSchema, input }, (a, d) =>
    svc.updateStatus(a, idSchema.parse(id), d.status),
  );
}
export async function deleteMessageAction(id: string) {
  return exec({ permission: "message:manage", schema: NoInput, input: undefined }, (a) => svc.remove(a, idSchema.parse(id)));
}
