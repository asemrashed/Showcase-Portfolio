import { z } from "zod";
import { httpUrl, imageRefSchema, optionalText, assetRefSchema } from "./common";

const socials = z
  .array(z.object({ platform: z.string().trim().min(1).max(30), url: httpUrl }))
  .max(12)
  .default([]);

export const aboutSchema = z
  .object({
    title: z.string().trim().min(2).max(120),
    description: z.string().trim().min(10).max(10000),
    image: imageRefSchema.nullable().optional(),
    stats: z
      .array(z.object({ label: z.string().trim().min(1).max(40), value: z.string().trim().min(1).max(40) }))
      .max(8)
      .default([]),
    skills: z.array(z.string().trim().min(1).max(40)).max(50).default([]),
  })
  .strict();

export const contactInfoSchema = z
  .object({
    email: z.string().trim().email().nullable().optional(),
    phone: optionalText(40),
    address: optionalText(300),
    mapUrl: httpUrl.nullable().optional(),
    workingHours: optionalText(120),
    socials,
  })
  .strict();

export const siteSettingsSchema = z
  .object({
    siteName: z.string().trim().min(1).max(80),
    tagline: optionalText(200),
    logo: assetRefSchema.nullable().optional(),
    defaultOgImage: assetRefSchema.nullable().optional(),
    currency: z.string().trim().toUpperCase().length(3).default("USD"),
    footerText: optionalText(300),
    contactNotifyEmail: z.string().trim().email().nullable().optional(),
    socials,
  })
  .strict();

export type AboutInput = z.infer<typeof aboutSchema>;
export type ContactInfoInput = z.infer<typeof contactInfoSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
