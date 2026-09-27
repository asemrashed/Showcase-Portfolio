"use server";
import { exec } from "@/lib/action";
import { aboutSchema, contactInfoSchema, siteSettingsSchema } from "@/lib/schemas/content";
import * as svc from "@/lib/services/singletonService";

export async function updateAboutAction(input: unknown) {
  return exec({ permission: "about:manage", schema: aboutSchema, input }, (a, d) => svc.updateAbout(a, d));
}
export async function updateContactInfoAction(input: unknown) {
  return exec({ permission: "contactInfo:manage", schema: contactInfoSchema, input }, (a, d) => svc.updateContactInfo(a, d));
}
export async function updateSettingsAction(input: unknown) {
  return exec({ permission: "settings:manage", schema: siteSettingsSchema, input }, (a, d) => svc.updateSettings(a, d));
}
