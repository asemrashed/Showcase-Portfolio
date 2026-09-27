import { z } from "zod";
import { assetRefSchema, idSchema, optionalText, orderSchema } from "./common";

export const reviewSchema = z
  .object({
    authorName: z.string().trim().min(2).max(80),
    authorRole: optionalText(80),
    company: optionalText(80),
    avatar: assetRefSchema.nullable().optional(),
    rating: z.number().int().min(1).max(5).default(5),
    content: z.string().trim().min(10).max(1000),
    projectId: idSchema.nullable().optional(),
    published: z.boolean().default(false),
    order: orderSchema.optional(),
  })
  .strict();
export const reviewUpdateSchema = reviewSchema.partial();
export const publicReviewQuerySchema = z.object({
  projectSlug: z.string().max(96).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ReviewUpdateInput = z.infer<typeof reviewUpdateSchema>;
