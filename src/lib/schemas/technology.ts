import { z } from "zod";
import { orderSchema } from "./common";

/** Fixed taxonomy for grouping the technology catalog. Displayed in this order everywhere. */
export const TECHNOLOGY_CATEGORIES = [
  "FRONTEND_FRAMEWORKS",
  "STATE_DATA_FETCHING",
  "BACKEND",
  "DATABASE_ORM",
  "AUTHENTICATION",
  "VALIDATION_UTILITIES",
  "SERVICES",
  "APIS_PAYMENTS",
  "INFRASTRUCTURE",
  "DEVOPS_TOOLING",
  "OTHER",
] as const;
export type TechnologyCategoryValue = (typeof TECHNOLOGY_CATEGORIES)[number];

export const TECHNOLOGY_CATEGORY_LABELS: Record<TechnologyCategoryValue, string> = {
  FRONTEND_FRAMEWORKS: "Frontend & Frameworks",
  STATE_DATA_FETCHING: "State Management & Data Fetching",
  BACKEND: "Backend",
  DATABASE_ORM: "Database & ORM",
  AUTHENTICATION: "Authentication",
  VALIDATION_UTILITIES: "Validation & Utilities",
  SERVICES: "Services",
  APIS_PAYMENTS: "APIs & Payments",
  INFRASTRUCTURE: "Infrastructure",
  DEVOPS_TOOLING: "DevOps & Tooling",
  OTHER: "Other",
};

export const technologyCategoryEnum = z.enum(TECHNOLOGY_CATEGORIES);

/**
 * `icon` is display-only text: either a lucide-react icon name (legacy) or a logo image URL
 * (pasted, or returned by our own upload flow). `iconKey` is only set for the latter case — the
 * R2 object key so we can clean it up on replace/delete — and is validated against `icon` in the
 * service layer (see uploadService.assertAsset) whenever it's present.
 */
export const technologySchema = z
  .object({
    name: z.string().trim().min(1).max(40),
    icon: z.string().trim().max(2048).nullable().optional(),
    iconKey: z.string().trim().max(300).nullable().optional(),
    category: technologyCategoryEnum.default("OTHER"),
    order: orderSchema.optional(),
  })
  .strict();
export const technologyUpdateSchema = technologySchema.partial();
export type TechnologyInput = z.infer<typeof technologySchema>;
export type TechnologyUpdateInput = z.infer<typeof technologyUpdateSchema>;
