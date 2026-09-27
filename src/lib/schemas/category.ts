import { z } from "zod";
import { imageRefSchema, optionalText, orderSchema, slugSchema } from "./common";

export const categorySchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    slug: slugSchema.optional(),
    description: optionalText(500),
    image: imageRefSchema.nullable().optional(),
    order: orderSchema.optional(),
  })
  .strict();
export const categoryUpdateSchema = categorySchema.partial();
export type CategoryInput = z.infer<typeof categorySchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
