import type { z } from "zod";
import type { projectUpdateSchema } from "@/lib/schemas/project";

/**
 * The editor keeps one RHF instance across all 7 steps. Validation for required fields happens
 * server-side (via the same Zod schemas, through the server actions) — the editor surfaces any
 * field errors the server returns rather than duplicating the schema client-side, since the
 * required set differs between "save draft" (name/shortDescription/fullDescription/categoryId
 * only) and "publish" (+ all four pricing fields).
 */
export type ProjectFormValues = z.infer<typeof projectUpdateSchema>;

export type RoleImage = { url: string; key: string; alt: string; device: "DESKTOP" | "MOBILE" };
export type RoleValue = { name: string; description: string; images: RoleImage[] };
export type FeatureValue = { title: string; description: string; icon: string | null };
export type TechValue = { name: string; icon: string | null };

export const STEP_LABELS = ["Basic", "Media", "Roles", "Features", "Technologies", "Links", "SEO"] as const;
export type StepId = (typeof STEP_LABELS)[number] | "Pricing";
