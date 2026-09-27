import { z } from "zod";

export const idSchema = z.string().cuid("Invalid id");

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(96)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only");

/** http/https only — blocks javascript:, data:, etc. */
export const httpUrl = z
  .string()
  .trim()
  .max(2048)
  .url("Invalid URL")
  .refine((v) => /^https?:\/\//i.test(v), "Only http(s) URLs are allowed");

/** Optional URL; empty string is normalised to null. */
export const optionalUrl = z.union([httpUrl, z.literal("").transform(() => null)]).nullable().optional();

/** Site-relative path ("/projects") or http(s) URL. */
export const linkSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (v) => (v.startsWith("/") && !v.startsWith("//")) || /^https?:\/\/\S+$/i.test(v),
    "Must be an http(s) URL or a site path starting with /",
  );

export const assetRefSchema = z.object({ url: httpUrl, key: z.string().min(1).max(300) });
export const imageRefSchema = assetRefSchema.extend({
  alt: z.string().trim().min(1, "Alt text is required").max(200),
});

export const orderSchema = z.number().int().min(0).max(100000);
export const optionalText = (max: number) => z.string().trim().max(max).nullable().optional();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
});

export const reorderSchema = z.object({
  items: z.array(z.object({ id: idSchema, order: orderSchema })).min(1).max(500),
});

export const boolParam = z.enum(["true", "false"]).transform((v) => v === "true");

export type Paginated<T> = { items: T[]; page: number; pageSize: number; total: number; totalPages: number };
export function paginated<T>(items: T[], total: number, page: number, pageSize: number): Paginated<T> {
  return { items, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}
