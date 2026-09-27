import { z } from "zod";
import { idSchema, imageRefSchema, linkSchema, optionalText, orderSchema } from "./common";

export const heroSlideSchema = z
  .object({
    title: z.string().trim().min(2).max(120),
    subtitle: optionalText(300),
    ctaLabel: optionalText(40),
    ctaUrl: linkSchema.nullable().optional(),
    image: imageRefSchema,
    projectId: idSchema.nullable().optional(),
    active: z.boolean().default(true),
    order: orderSchema.optional(),
  })
  .strict();
export const heroSlideUpdateSchema = heroSlideSchema.partial();
export type HeroSlideInput = z.infer<typeof heroSlideSchema>;
export type HeroSlideUpdateInput = z.infer<typeof heroSlideUpdateSchema>;
