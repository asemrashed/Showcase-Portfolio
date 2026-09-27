import { z } from "zod";
import {
  assetRefSchema,
  boolParam,
  idSchema,
  imageRefSchema,
  optionalText,
  optionalUrl,
  orderSchema,
  paginationSchema,
  reorderSchema,
  slugSchema,
} from "./common";

export const projectStatusEnum = z.enum(["DRAFT", "PENDING", "PUBLISHED", "ARCHIVED"]);

/** Fields only ADMIN / SUPER_ADMIN may send. */
export const PRICE_KEYS = ["minPrice", "maxPrice", "minDuration", "maxDuration"] as const;
export const ADMIN_ONLY_KEYS = [...PRICE_KEYS, "featured", "order"] as const;

const pricingShape = {
  minPrice: z.number().int().min(0).max(100_000_000),
  maxPrice: z.number().int().min(0).max(100_000_000),
  minDuration: z.number().int().min(1).max(3650), // days
  maxDuration: z.number().int().min(1).max(3650),
};

type Ranges = Partial<Record<(typeof PRICE_KEYS)[number], number | null | undefined>>;
export function checkRanges(v: Ranges, ctx: z.RefinementCtx) {
  if (v.minPrice != null && v.maxPrice != null && v.minPrice > v.maxPrice)
    ctx.addIssue({ code: "custom", path: ["maxPrice"], message: "Max price must be ≥ min price" });
  if (v.minDuration != null && v.maxDuration != null && v.minDuration > v.maxDuration)
    ctx.addIssue({ code: "custom", path: ["maxDuration"], message: "Max duration must be ≥ min duration" });
}

const roleInput = z.object({
  name: z.string().trim().min(1).max(60),
  description: optionalText(500),
  images: z
    .array(imageRefSchema.extend({ device: z.enum(["DESKTOP", "MOBILE"]) }))
    .max(40)
    .default([]),
});
const featureInput = z.object({
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).default(""),
  icon: optionalText(60),
});
const techInput = z.object({ name: z.string().trim().min(1).max(40), icon: optionalText(60) });

const shape = {
  name: z.string().trim().min(2).max(120),
  slug: slugSchema,
  shortDescription: z.string().trim().min(10).max(300),
  fullDescription: z.string().trim().min(20).max(20000),
  categoryId: idSchema,
  liveUrl: optionalUrl,
  demoUrl: optionalUrl,
  repoUrl: optionalUrl,
  metaTitle: optionalText(70),
  metaDescription: optionalText(170),
  ogImage: assetRefSchema.nullable(),
  // Nested lists: when provided they REPLACE the existing list; array order = display order.
  roles: z.array(roleInput).max(20),
  features: z.array(featureInput).max(40),
  technologies: z.array(techInput).max(40),
  // Admin-only:
  featured: z.boolean(),
  order: orderSchema,
  ...pricingShape,
};

export const projectUpdateSchema = z.object(shape).partial().strict().superRefine(checkRanges);
export const projectCreateSchema = z
  .object(shape)
  .partial()
  .required({ name: true, shortDescription: true, fullDescription: true, categoryId: true })
  .strict()
  .superRefine(checkRanges);

/** Publishing requires all four pricing fields. */
export const projectPublishSchema = z.object(pricingShape).strict().superRefine(checkRanges);
export const projectRejectSchema = z.object({ note: z.string().trim().min(3).max(500) }).strict();

export const projectImageCreateSchema = imageRefSchema.extend({
  type: z.enum(["MAIN", "DESKTOP", "MOBILE", "EXTRA"]),
  order: orderSchema.optional(),
});
export const projectImageReorderSchema = reorderSchema;

export const dashboardProjectQuerySchema = z
  .object({
    status: projectStatusEnum.optional(),
    search: z.string().trim().max(100).optional(),
    categoryId: idSchema.optional(),
    mine: boolParam.optional(),
  })
  .merge(paginationSchema);

export const publicProjectQuerySchema = z
  .object({
    category: slugSchema.optional(),
    search: z.string().trim().max(100).optional(),
    featured: boolParam.optional(),
  })
  .merge(paginationSchema);

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type ProjectPublishInput = z.infer<typeof projectPublishSchema>;
export type ProjectImageCreateInput = z.infer<typeof projectImageCreateSchema>;
export type DashboardProjectQuery = z.infer<typeof dashboardProjectQuerySchema>;
export type PublicProjectQuery = z.infer<typeof publicProjectQuerySchema>;
